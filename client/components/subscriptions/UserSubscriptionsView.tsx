"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, PlusCircle, AlertCircle } from "lucide-react";
import {
  useCancelSubscription,
  useSubscriptions,
  useSubscriptionStats,
} from "@/apis/subscriptions/subscriptions-api";
import type { SubscriptionStatus } from "@/lib/types/subscription-types";
import { toast } from "sonner";
import { SubscriptionRow } from "@/components/subscriptions/SubscriptionRow";
import { formatAmount } from "@/lib/utils/format";

const PAGE_NOW = Date.now();
const TABLE_COLS = "grid-cols-[1fr_1fr_110px_90px_110px_100px]";

export function UserSubscriptionsView() {
  const [statusFilter, setStatusFilter] = useState<
    SubscriptionStatus | undefined
  >(undefined);
  const { data, isLoading } = useSubscriptions({ status: statusFilter });
  const { data: statsData } = useSubscriptionStats();
  const { mutate: cancel, isPending: cancelling } = useCancelSubscription();

  const subscriptions = data?.data ?? [];
  const stats = statsData?.data;

  const upcomingSoon = subscriptions.filter((s) => {
    const days = Math.ceil(
      (new Date(s.renewalDate).getTime() - PAGE_NOW) / (1000 * 60 * 60 * 24),
    );
    return s.status === "ACTIVE" && days <= 7;
  });

  const annualCommitment = subscriptions
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => {
      const amount = Number(s.amount);
      return sum + (s.billingCycle === "MONTHLY" ? amount * 12 : amount);
    }, 0);

  const activeCount = stats?.totalActive ?? 0;

  function handleCancel(id: string) {
    cancel(id, {
      onSuccess: () => toast.success("Subscription cancelled"),
      onError: () => toast.error("Failed to cancel subscription"),
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">
            Subscriptions
          </p>
          <h1 className="text-[1.1rem] sm:text-[1.25rem] font-bold tracking-tight text-white/90">
            All subscriptions
          </h1>
          {!isLoading && subscriptions.length > 0 && (
            <p className="text-[11px] font-mono text-white/30 mt-1">
              {activeCount} active
              {upcomingSoon.length > 0 &&
                ` · ${upcomingSoon.length} ending soon`}
              {annualCommitment > 0 &&
                ` · ${formatAmount(annualCommitment)}/yr combined`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {upcomingSoon.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-lg px-2.5 py-1.5">
              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="text-[11px] font-mono text-amber-300/80">
                {upcomingSoon.length === 1
                  ? `${upcomingSoon[0].name} renewing soon`
                  : `${upcomingSoon.length} renewing soon`}
              </span>
            </div>
          )}
          <Link
            href="/dashboard/subscriptions/new"
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-white bg-emerald-500/90 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add new
          </Link>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl overflow-hidden border border-white/6">
          {[
            {
              label: "Monthly Spend",
              value: formatAmount(stats.totalMonthlySpend),
              green: false,
            },
            {
              label: "Annual Est.",
              value: formatAmount(annualCommitment),
              green: false,
            },
            {
              label: "Upcoming Renewals",
              value: String(upcomingSoon.length),
              green: upcomingSoon.length > 0,
            },
            { label: "Active", value: String(activeCount), green: false },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`bg-[#0d1525] px-4 sm:px-5 py-3 ${i < 3 ? "border-r border-white/5" : ""} nth-2:border-r-0 sm:nth-2:border-r border-b border-white/5 sm:border-b-0`}
            >
              <div className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-1">
                {s.label}
              </div>
              <div
                className={`text-[14px] font-bold leading-none ${s.green ? "text-emerald-400" : "text-white/85"}`}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1">
        {([undefined, "ACTIVE", "CANCELLED"] as const).map((s) => (
          <button
            key={String(s)}
            onClick={() => setStatusFilter(s)}
            className={`text-[11px] font-mono px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === s
                ? "bg-white/10 text-white/80"
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            {s === undefined ? "All" : s === "ACTIVE" ? "Active" : "Cancelled"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-white/6">
        <div
          className={`hidden md:grid ${TABLE_COLS} px-5 py-2.5 gap-4 sm:gap-6 bg-white/3 border-b border-white/6`}
        >
          {[
            { label: "Service", align: "text-left" },
            { label: "Plan", align: "text-left" },
            { label: "Cost", align: "text-right" },
            { label: "Next", align: "text-right" },
            { label: "Status", align: "text-right" },
            { label: "", align: "" },
          ].map(({ label, align }) => (
            <span
              key={label}
              className={`text-[10px] font-mono text-white/20 uppercase tracking-wider ${align}`}
            >
              {label}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div className="bg-[#0d1525] px-5 py-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-[#0d1525] px-5 py-10 text-center">
            <p className="text-[13px] font-mono text-white/25">
              No subscriptions found
            </p>
            <Link
              href="/dashboard/subscriptions/new"
              className="text-[12px] font-mono text-blue-400/60 hover:text-blue-400 mt-2 block transition-colors"
            >
              + Add your first subscription
            </Link>
          </div>
        ) : (
          subscriptions.map((sub, i) => (
            <SubscriptionRow
              key={sub.id}
              sub={sub}
              onCancel={handleCancel}
              now={PAGE_NOW}
              index={i}
            />
          ))
        )}
      </div>

      {subscriptions.length > 0 && (
        <p className="text-[11px] font-mono text-white/25">
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
