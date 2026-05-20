"use client";

import { useMemo, useState } from "react";
import { Receipt, Loader2 } from "lucide-react";
import { useAllMyBillingHistory } from "@/apis/subscriptions/subscriptions-api";
import type {
  BillingHistoryWithSubscription,
  BillingStatus,
} from "@/lib/types/subscription-types";
import { formatAmount, formatDate } from "@/lib/utils/format";

function StatusBadge({ status }: { status: BillingStatus }) {
  const styles: Record<BillingStatus, string> = {
    PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span
      className={`text-[11px] font-mono border px-2 py-0.5 rounded-full ${styles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

type TimeFilter = "recent" | "month" | "last_month" | "year" | "all";

const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: "recent", label: "Recent (30 d)" },
  { id: "month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "year", label: "This year" },
  { id: "all", label: "All time" },
];

function getDateRange(filter: TimeFilter): { from: Date | null; to: Date | null } {
  const now = new Date();

  if (filter === "recent") {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { from, to: now };
  }
  if (filter === "month") {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: now,
    };
  }
  if (filter === "last_month") {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
    };
  }
  if (filter === "year") {
    return { from: new Date(now.getFullYear(), 0, 1), to: now };
  }
  return { from: null, to: null };
}

function BillingRow({ record }: { record: BillingHistoryWithSubscription }) {
  return (
    <div className="flex items-center gap-4 bg-[#0d1525] px-5 py-3.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-medium text-white/75 truncate">
            {record.subscription.name}
          </span>
          <StatusBadge status={record.status} />
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[11px] font-mono text-white/25">
            {record.subscription.billingCycle === "MONTHLY" ? "Monthly" : "Yearly"}
          </span>
          <span className="text-[11px] font-mono text-white/20">
            {formatDate(record.billingDate)}
          </span>
        </div>
      </div>
      <div className="text-[14px] font-mono text-white/70 shrink-0">
        {formatAmount(record.amount)}
        <span className="text-[11px] text-white/25">
          /{record.subscription.billingCycle === "MONTHLY" ? "mo" : "yr"}
        </span>
      </div>
    </div>
  );
}

export default function BillingHistoryPage() {
  const [filter, setFilter] = useState<TimeFilter>("recent");
  const { data, isLoading } = useAllMyBillingHistory();

  const rawRecords = data?.data;

  const records = useMemo(() => {
    const allRecords = rawRecords ?? [];
    const { from, to } = getDateRange(filter);
    if (!from && !to) return allRecords;
    return allRecords.filter((r) => {
      const d = new Date(r.billingDate);
      return (!from || d >= from) && (!to || d <= to);
    });
  }, [rawRecords, filter]);

  const totalPaid = useMemo(
    () =>
      records
        .filter((r) => r.status === "PAID")
        .reduce((sum, r) => sum + Number(r.amount), 0),
    [records],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">
            Finances
          </p>
          <h1 className="text-[1.1rem] sm:text-[1.25rem] font-bold tracking-tight text-white/90">
            Billing History
          </h1>
        </div>

        {!isLoading && records.length > 0 && (
          <div className="text-right shrink-0">
            <p className="text-[11px] font-mono text-white/25 uppercase tracking-wider mb-0.5">
              Total paid
            </p>
            <p className="text-[1.1rem] font-bold font-mono text-emerald-400">
              {formatAmount(totalPaid)}
            </p>
          </div>
        )}
      </div>

      {/* Time filter tabs */}
      <div className="flex flex-wrap gap-1">
        {TIME_FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`text-[11px] font-mono px-3 py-1.5 rounded-lg transition-colors ${
              filter === id
                ? "bg-white/10 text-white/80"
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
        {isLoading ? (
          <div className="bg-[#0d1525] px-5 py-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="bg-[#0d1525] px-5 py-10 text-center">
            <Receipt className="w-6 h-6 text-white/10 mx-auto mb-2" />
            <p className="text-[13px] font-mono text-white/25">
              No billing records for this period
            </p>
          </div>
        ) : (
          records.map((record) => <BillingRow key={record.id} record={record} />)
        )}
      </div>

      {records.length > 0 && (
        <p className="text-[11px] font-mono text-white/25">
          {records.length} record{records.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
