"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Receipt, Pencil, X, Check } from "lucide-react";
import {
  useBillingHistory,
  useCancelSubscription,
  useSubscription,
  useUpdateSubscription,
} from "@/apis/subscriptions/subscriptions-api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  editSubscriptionSchema,
  type EditSubscriptionValues,
} from "@/lib/validations/subscriptionValidation";
import { formatAmount } from "@/lib/utils/format";
import { BillingStatusBadge } from "@/components/subscriptions/BillingStatusBadge";
import { SubscriptionEditForm } from "@/components/subscriptions/SubscriptionEditForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const { data: sub, isLoading: subLoading } = useSubscription(id);
  const { data: billingData, isLoading: billingLoading } = useBillingHistory(id);
  const { mutate: update, isPending: updating } = useUpdateSubscription();
  const { mutate: cancel, isPending: cancelling } = useCancelSubscription();

  const { register, handleSubmit, reset } = useForm<EditSubscriptionValues>({
    resolver: zodResolver(editSubscriptionSchema),
  });

  function startEdit() {
    reset({
      name: sub?.name,
      category: sub?.category ?? "",
      amount: Number(sub?.amount),
      billingCycle: sub?.billingCycle,
      renewalDate: sub?.renewalDate
        ? new Date(sub.renewalDate).toISOString().split("T")[0]
        : "",
    });
    setEditing(true);
  }

  function onEditSubmit(values: EditSubscriptionValues) {
    const payload = { ...values };
    if (payload.renewalDate) {
      payload.renewalDate = new Date(payload.renewalDate).toISOString();
    }
    update(
      { id, data: payload },
      {
        onSuccess: () => {
          toast.success("Subscription updated");
          setEditing(false);
        },
        onError: () => toast.error("Update failed"),
      },
    );
  }

  function handleCancel() {
    cancel(id, {
      onSuccess: () => {
        toast.success("Subscription cancelled");
        router.push("/dashboard/subscriptions");
      },
      onError: () => toast.error("Cancel failed"),
    });
  }

  if (subLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="text-center py-20">
        <p className="text-[12px] font-mono text-white/30">
          Subscription not found
        </p>
        <Link
          href="/dashboard/subscriptions"
          className="text-[11px] font-mono text-blue-400/60 hover:text-blue-400 mt-2 block"
        >
          ← Back to subscriptions
        </Link>
      </div>
    );
  }

  const history = billingData?.data ?? [];

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Back link */}
      <Link
        href="/dashboard/subscriptions"
        className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/25 hover:text-white/50 transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> Subscriptions
      </Link>

      {/* Detail card */}
      <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.12em] mb-0.5">
              Subscription
            </p>
            {!editing && (
              <h2 className="text-[1.1rem] font-bold tracking-tight text-white/90">
                {sub.name}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-2">
            {sub.status === "ACTIVE" && !editing && (
              <>
                <button
                  onClick={startEdit}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/70 border border-white/10 hover:border-white/25 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={cancelling}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-red-400/40 hover:text-red-400 border border-red-500/10 hover:border-red-500/30 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        <strong>{sub.name}</strong> will be cancelled
                        immediately. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep it</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={handleCancel}
                      >
                        Yes, cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            {editing && (
              <>
                <Button
                  type="submit"
                  form="edit-form"
                  size="sm"
                  disabled={updating}
                  className="bg-white text-black hover:bg-white/90 text-[11px] h-7 px-3"
                >
                  {updating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3 h-3" /> Save
                    </>
                  )}
                </Button>
                <button
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/60 border border-white/10 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <X className="w-3 h-3" /> Discard
                </button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <SubscriptionEditForm
            register={register}
            onSubmit={handleSubmit(onEditSubmit)}
          />
        ) : (
          <div className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-4">
            {[
              {
                label: "Amount",
                value: `${formatAmount(sub.amount)} / ${sub.billingCycle === "MONTHLY" ? "month" : "year"}`,
              },
              { label: "Status", value: sub.status },
              { label: "Category", value: sub.category ?? "—" },
              { label: "Billing cycle", value: sub.billingCycle },
              {
                label: "Renewal date",
                value: new Date(sub.renewalDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              },
              {
                label: "Created",
                value: new Date(sub.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[9px] font-mono text-white/25 uppercase tracking-wider mb-0.5">
                  {label}
                </p>
                <p
                  className={`text-[12px] font-mono ${
                    value === "ACTIVE"
                      ? "text-emerald-400"
                      : value === "CANCELLED"
                        ? "text-red-400"
                        : "text-white/70"
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billing history */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="w-3.5 h-3.5 text-white/25" />
          <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em]">
            Billing history
          </p>
        </div>

        <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
          {billingLoading ? (
            <div className="bg-[#0d1525] px-5 py-8 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="bg-[#0d1525] px-5 py-6 text-center">
              <p className="text-[11px] font-mono text-white/25">
                No billing records yet
              </p>
            </div>
          ) : (
            history.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-4 bg-[#0d1525] px-5 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-white/55">
                    {new Date(record.billingDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <BillingStatusBadge status={record.status} />
                <p className="text-[12px] font-mono text-white/70 shrink-0">
                  {formatAmount(record.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
