"use client";

import { useMemo, useState } from "react";
import { Receipt, Loader2, Calendar } from "lucide-react";
import { useAllMyBillingHistory } from "@/apis/subscriptions/subscriptions-api";
import type {
  BillingHistoryWithSubscription,
  BillingStatus,
} from "@/lib/types/subscription-types";
import { formatAmount, formatDate } from "@/lib/utils/format";

const TABLE_COLS = "grid-cols-[1fr_80px_110px_100px_110px]";

function StatusBadge({ status }: { status: BillingStatus }) {
  const styles: Record<BillingStatus, string> = {
    PAID: "bg-emerald-500/12 text-emerald-400",
    PENDING: "bg-amber-400/12 text-amber-400",
    FAILED: "bg-red-500/12 text-red-400",
  };
  return (
    <span
      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${styles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function dotColor(status: BillingStatus) {
  if (status === "PAID") return "bg-emerald-500";
  if (status === "PENDING") return "bg-amber-400";
  return "bg-red-500/70";
}

function BillingRow({
  record,
  index,
}: {
  record: BillingHistoryWithSubscription;
  index: number;
}) {
  const rowBg = index % 2 === 0 ? "bg-[#0d1525]" : "bg-white/[0.012]";
  return (
    <div className={`${rowBg} border-b border-white/4 last:border-0`}>
      {/* Desktop */}
      <div
        className={`hidden md:grid ${TABLE_COLS} items-center px-5 py-2.5 gap-4 sm:gap-6`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(record.status)}`}
          />
          <span className="text-[13px] text-white/70 truncate">
            {record.subscription.name}
          </span>
        </div>
        <span className="text-[12px] font-mono text-white/30">
          {record.subscription.billingCycle === "MONTHLY"
            ? "Monthly"
            : "Yearly"}
        </span>
        <div className="flex items-center gap-1 text-[12px] font-mono text-white/30">
          <Calendar className="w-2.5 h-2.5 shrink-0" />
          {formatDate(record.billingDate)}
        </div>
        <div className="flex justify-end">
          <StatusBadge status={record.status} />
        </div>
        <span className="text-[13px] font-mono text-white/60 text-right">
          {formatAmount(record.amount)}
          <span className="text-[11px] text-white/25">
            /{record.subscription.billingCycle === "MONTHLY" ? "mo" : "yr"}
          </span>
        </span>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-start justify-between px-4 py-3 gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${dotColor(record.status)}`}
          />
          <div className="min-w-0">
            <span className="text-[13px] text-white/75 truncate block">
              {record.subscription.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-white/25">
                {record.subscription.billingCycle === "MONTHLY"
                  ? "Monthly"
                  : "Yearly"}
              </span>
              <span className="text-[11px] font-mono text-white/20">
                {formatDate(record.billingDate)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-[13px] font-mono text-white/60">
            {formatAmount(record.amount)}
          </span>
          <StatusBadge status={record.status} />
        </div>
      </div>
    </div>
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

function getDateRange(filter: TimeFilter): {
  from: Date | null;
  to: Date | null;
} {
  const now = new Date();
  if (filter === "recent") {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { from, to: now };
  }
  if (filter === "month")
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
  if (filter === "last_month")
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
    };
  if (filter === "year")
    return { from: new Date(now.getFullYear(), 0, 1), to: now };
  return { from: null, to: null };
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
  const totalPending = useMemo(
    () =>
      records
        .filter((r) => r.status === "PENDING")
        .reduce((sum, r) => sum + Number(r.amount), 0),
    [records],
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">
            Finances
          </p>
          <h1 className="text-[1.1rem] sm:text-[1.25rem] font-bold tracking-tight text-white/90">
            Billing History
          </h1>
          {!isLoading && records.length > 0 && (
            <p className="text-[11px] font-mono text-white/30 mt-1">
              {records.length} record{records.length !== 1 ? "s" : ""}
              {totalPaid > 0 && ` · ${formatAmount(totalPaid)} paid`}
            </p>
          )}
        </div>

        {/* Stats */}
        {!isLoading && records.length > 0 && (
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">
                Total paid
              </p>
              <p className="text-[1.1rem] font-bold font-mono text-emerald-400">
                {formatAmount(totalPaid)}
              </p>
            </div>
            {totalPending > 0 && (
              <div className="text-right">
                <p className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-0.5">
                  Pending
                </p>
                <p className="text-[1.1rem] font-bold font-mono text-amber-400">
                  {formatAmount(totalPending)}
                </p>
              </div>
            )}
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

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-white/6">
        {/* Column headers — desktop only */}
        <div
          className={`hidden md:grid ${TABLE_COLS} px-5 py-2.5 gap-4 sm:gap-6 bg-white/3 border-b border-white/6`}
        >
          {[
            { label: "Subscription", align: "text-left" },
            { label: "Cycle", align: "text-left" },
            { label: "Date", align: "text-left" },
            { label: "Status", align: "text-right" },
            { label: "Amount", align: "text-right" },
          ].map(({ label, align }) => (
            <span
              key={label}
              className={`text-[10px] font-mono text-white/20 uppercase tracking-wider ${align}`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Rows */}
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
          records.map((record, i) => (
            <BillingRow key={record.id} record={record} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
