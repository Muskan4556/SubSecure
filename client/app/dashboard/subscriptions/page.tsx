"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, PlusCircle } from "lucide-react";
import {
  useCancelSubscription,
  useSubscriptions,
} from "@/apis/subscriptions/subscriptions-api";
import type { SubscriptionStatus } from "@/lib/types/subscription-types";
import { toast } from "sonner";
import { SubscriptionRow } from "@/components/subscriptions/SubscriptionRow";

const PAGE_NOW = Date.now();

export default function SubscriptionsPage() {
  const [statusFilter, setStatusFilter] = useState<
    SubscriptionStatus | undefined
  >(undefined);
  const { data, isLoading } = useSubscriptions({ status: statusFilter });
  const { mutate: cancel, isPending: cancelling } = useCancelSubscription();

  const subscriptions = data?.data ?? [];

  function handleCancel(id: string) {
    cancel(id, {
      onSuccess: () => toast.success("Subscription cancelled"),
      onError: () => toast.error("Failed to cancel subscription"),
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">
            Subscriptions
          </p>
          <h1 className="text-[1.25rem] font-bold tracking-tight text-white/90">
            All subscriptions
          </h1>
        </div>
        <Link
          href="/dashboard/subscriptions/new"
          className="inline-flex items-center gap-2 text-[12px] font-semibold text-white border border-white/15 hover:border-white/30 hover:bg-white/5 px-4 py-2 rounded-lg transition-all shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add subscription
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {([undefined, "ACTIVE", "CANCELLED"] as const).map((s) => (
          <button
            key={String(s)}
            onClick={() => setStatusFilter(s)}
            className={`text-[10px] font-mono px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === s
                ? "bg-white/10 text-white/80"
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            {s ?? "All"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
        {isLoading ? (
          <div className="bg-[#0d1525] px-5 py-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-[#0d1525] px-5 py-10 text-center">
            <p className="text-[12px] font-mono text-white/25">
              No subscriptions found
            </p>
            <Link
              href="/dashboard/subscriptions/new"
              className="text-[11px] font-mono text-blue-400/60 hover:text-blue-400 mt-2 block transition-colors"
            >
              + Add your first subscription
            </Link>
          </div>
        ) : (
          subscriptions.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              sub={sub}
              onCancel={handleCancel}
              now={PAGE_NOW}
            />
          ))
        )}
      </div>

      {subscriptions.length > 0 && (
        <p className="text-[10px] font-mono text-white/25">
          {subscriptions.length} subscription
          {subscriptions.length !== 1 ? "s" : ""}
        </p>
      )}

      {cancelling && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
        </div>
      )}
    </div>
  );
}
