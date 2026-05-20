"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  editSubscriptionSchema,
  type EditSubscriptionValues,
} from "@/lib/validations/subscriptionValidation";
import { SubscriptionEditForm } from "@/components/subscriptions/SubscriptionEditForm";
import { formatAmount, formatDate, formatDateLong } from "@/lib/utils/format";
import type { Subscription } from "@/lib/types/subscription-types";

type Props = {
  sub: Subscription;
  updating: boolean;
  cancelling: boolean;
  onEditSubmit: (values: EditSubscriptionValues) => void;
  onCancel: () => void;
};

const INFO_FIELDS = (sub: Subscription) => [
  {
    label: "Amount",
    value: `${formatAmount(sub.amount)} / ${sub.billingCycle === "MONTHLY" ? "month" : "year"}`,
  },
  { label: "Status", value: sub.status },
  { label: "Category", value: sub.category ?? "—" },
  { label: "Billing cycle", value: sub.billingCycle },
  { label: "Renewal date", value: formatDateLong(sub.renewalDate) },
  { label: "Created", value: formatDate(sub.createdAt) },
];

export function SubscriptionDetailCard({
  sub,
  updating,
  cancelling,
  onEditSubmit,
  onCancel,
}: Props) {
  const [editing, setEditing] = useState(false);

  const { register, handleSubmit, reset } = useForm<EditSubscriptionValues>({
    resolver: zodResolver(editSubscriptionSchema),
  });

  function startEdit() {
    reset({
      name: sub.name,
      category: sub.category ?? "",
      amount: Number(sub.amount),
      billingCycle: sub.billingCycle,
      renewalDate: new Date(sub.renewalDate).toISOString().split("T")[0],
    });
    setEditing(true);
  }

  function handleEditSubmit(values: EditSubscriptionValues) {
    onEditSubmit(values);
    setEditing(false);
  }

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
      {/* Card header */}
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
                      <strong>{sub.name}</strong> will be cancelled immediately.
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onCancel}>
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

      {/* Card body */}
      {editing ? (
        <SubscriptionEditForm
          register={register}
          onSubmit={handleSubmit(handleEditSubmit)}
        />
      ) : (
        <div className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-4">
          {INFO_FIELDS(sub).map(({ label, value }) => (
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
  );
}
