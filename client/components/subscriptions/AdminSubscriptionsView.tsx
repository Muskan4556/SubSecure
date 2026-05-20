"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAdminAllSubscriptions } from "@/apis/admin/admin-api";
import {
  AdminSubscriptionRow,
  ADMIN_SUB_TABLE_COLS,
} from "@/components/admin/AdminSubscriptionRow";
import { formatAmount } from "@/lib/utils/format";

const PAGE_NOW = Date.now();

export function AdminSubscriptionsView() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const { data, isLoading } = useAdminAllSubscriptions(statusFilter);

  const subscriptions = data?.data ?? [];
  const platformStats = data?.stats;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">
          Admin
        </p>
        <h1 className="text-[1.1rem] sm:text-[1.25rem] font-bold tracking-tight text-white/90">
          All subscriptions
        </h1>
        {!isLoading && subscriptions.length > 0 && (
          <p className="text-[11px] font-mono text-white/30 mt-1">
            {platformStats?.totalActive ?? 0} active ·{" "}
            {platformStats?.totalCancelled ?? 0} cancelled · platform-wide
          </p>
        )}
      </div>

      {/* Platform stats row */}
      {platformStats && (
        <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-white/6">
          {[
            {
              label: "Monthly Volume",
              value: formatAmount(platformStats.totalMonthlyVolume),
              green: false,
            },
            {
              label: "Active",
              value: String(platformStats.totalActive),
              green: true,
            },
            {
              label: "Cancelled",
              value: String(platformStats.totalCancelled),
              green: false,
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`bg-[#0d1525] px-4 sm:px-5 py-3 ${i < 2 ? "border-r border-white/5" : ""}`}
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
          className={`hidden md:grid ${ADMIN_SUB_TABLE_COLS} px-5 py-2.5 gap-4 sm:gap-6 bg-white/3 border-b border-white/6`}
        >
          {[
            { label: "Owner", align: "text-left" },
            { label: "Service", align: "text-left" },
            { label: "Plan", align: "text-left" },
            { label: "Cost", align: "text-right" },
            { label: "Next", align: "text-right" },
            { label: "Status", align: "text-right" },
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
          </div>
        ) : (
          subscriptions.map((sub, i) => (
            <AdminSubscriptionRow
              key={sub.id}
              sub={sub}
              index={i}
              now={PAGE_NOW}
            />
          ))
        )}
      </div>

      {subscriptions.length > 0 && (
        <p className="text-[11px] font-mono text-white/25">
          {subscriptions.length} subscription
          {subscriptions.length !== 1 ? "s" : ""} across all users
        </p>
      )}
    </div>
  );
}
