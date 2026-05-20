"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  useBillingHistory,
  useCancelSubscription,
  useSubscription,
  useUpdateSubscription,
} from "@/apis/subscriptions/subscriptions-api";
import { SubscriptionDetailCard } from "@/components/subscriptions/SubscriptionDetailCard";
import { SubscriptionBillingHistory } from "@/components/subscriptions/SubscriptionBillingHistory";
import type { EditSubscriptionValues } from "@/lib/validations/subscriptionValidation";

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: sub, isLoading: subLoading } = useSubscription(id);
  const { data: billingData, isLoading: billingLoading } =
    useBillingHistory(id);
  const { mutate: update, isPending: updating } = useUpdateSubscription();
  const { mutate: cancel, isPending: cancelling } = useCancelSubscription();

  function handleEditSubmit(values: EditSubscriptionValues) {
    const payload = { ...values };
    if (payload.renewalDate) {
      payload.renewalDate = new Date(payload.renewalDate).toISOString();
    }
    update(
      { id, data: payload },
      {
        onSuccess: () => toast.success("Subscription updated"),
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
        <p className="text-[13px] font-mono text-white/30">
          Subscription not found
        </p>
        <Link
          href="/dashboard/subscriptions"
          className="text-[12px] font-mono text-blue-400/60 hover:text-blue-400 mt-2 block"
        >
          ← Back to subscriptions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <Link
        href="/dashboard/subscriptions"
        className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/25 hover:text-white/50 transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> Subscriptions
      </Link>

      <SubscriptionDetailCard
        sub={sub}
        updating={updating}
        cancelling={cancelling}
        onEditSubmit={handleEditSubmit}
        onCancel={handleCancel}
      />

      <SubscriptionBillingHistory
        history={billingData?.data ?? []}
        isLoading={billingLoading}
      />
    </div>
  );
}
