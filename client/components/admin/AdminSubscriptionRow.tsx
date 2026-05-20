"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import type { AdminSubscription } from "@/lib/types/admin-types";
import type { SubscriptionStatus } from "@/lib/types/subscription-types";
import { formatAmount, formatDateShort } from "@/lib/utils/format";

export const ADMIN_SUB_TABLE_COLS =
  "grid-cols-[200px_1fr_1fr_100px_80px_100px]";

function StatusBadge({
  status,
  daysUntil,
}: {
  status: SubscriptionStatus;
  daysUntil: number;
}) {
  if (status === "CANCELLED")
    return (
      <span className="text-[10px] font-mono bg-red-500/12 text-red-400 px-1.5 py-0.5 rounded-full">
        Cancelled
      </span>
    );
  if (daysUntil <= 7)
    return (
      <span className="text-[10px] font-mono bg-amber-400/12 text-amber-400 px-1.5 py-0.5 rounded-full">
        Ending soon
      </span>
    );
  return (
    <span className="text-[10px] font-mono bg-emerald-500/12 text-emerald-400 px-1.5 py-0.5 rounded-full">
      Active
    </span>
  );
}

function dotColor(status: SubscriptionStatus, daysUntil: number) {
  if (status === "CANCELLED") return "bg-red-500/50";
  if (daysUntil <= 7) return "bg-amber-400";
  return "bg-emerald-500";
}

export function AdminSubscriptionRow({
  sub,
  index,
  now,
}: {
  sub: AdminSubscription;
  index: number;
  now: number;
}) {
  const daysUntil = Math.ceil(
    (new Date(sub.renewalDate).getTime() - now) / (1000 * 60 * 60 * 24),
  );

  const plan = [sub.category, sub.billingCycle === "MONTHLY" ? "Monthly" : "Yearly"]
    .filter(Boolean)
    .join(" · ");

  const rowBg = index % 2 === 0 ? "bg-[#0d1525]" : "bg-white/[0.012]";

  return (
    <div className={`${rowBg} border-b border-white/4 last:border-0`}>
      {/* Desktop */}
      <div
        className={`hidden md:grid ${ADMIN_SUB_TABLE_COLS} items-center px-5 py-2.5 gap-4 sm:gap-6`}
      >
        {/* Owner */}
        <div className="min-w-0">
          <span className="text-[12px] font-medium text-white/65 truncate block">
            {sub.user.name}
          </span>
          <span className="text-[11px] font-mono text-blue-400/50 truncate block">
            {sub.user.email}
          </span>
        </div>

        {/* Service + dot */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(sub.status, daysUntil)}`}
          />
          <Link
            href={`/dashboard/subscriptions/${sub.id}`}
            className="text-[13px] text-white/70 hover:text-white/95 transition-colors truncate"
          >
            {sub.name}
          </Link>
        </div>

        {/* Plan */}
        <span className="text-[12px] font-mono text-white/30 truncate">{plan}</span>

        {/* Cost */}
        <span className="text-[13px] font-mono text-white/60 text-right">
          {formatAmount(sub.amount)}
          <span className="text-[11px] text-white/25">
            /{sub.billingCycle === "MONTHLY" ? "mo" : "yr"}
          </span>
        </span>

        {/* Next */}
        <div className="flex items-center justify-end gap-1 text-[12px] font-mono text-white/25">
          {sub.status === "ACTIVE" ? (
            <>
              <Clock className="w-2.5 h-2.5 shrink-0" />
              <span className={daysUntil <= 7 ? "text-amber-400/80" : ""}>
                {formatDateShort(sub.renewalDate)}
              </span>
            </>
          ) : (
            <span>—</span>
          )}
        </div>

        {/* Status */}
        <div className="flex justify-end">
          <StatusBadge status={sub.status} daysUntil={daysUntil} />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-start justify-between px-4 py-3 gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${dotColor(sub.status, daysUntil)}`}
          />
          <div className="min-w-0">
            <Link
              href={`/dashboard/subscriptions/${sub.id}`}
              className="text-[13px] text-white/75 hover:text-white/95 transition-colors truncate block"
            >
              {sub.name}
            </Link>
            <span className="text-[11px] font-mono text-blue-400/50 truncate block">
              {sub.user.email}
            </span>
            <span className="text-[11px] font-mono text-white/25">{plan}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-[13px] font-mono text-white/60">
            {formatAmount(sub.amount)}
            <span className="text-[11px] text-white/25">
              /{sub.billingCycle === "MONTHLY" ? "mo" : "yr"}
            </span>
          </span>
          <StatusBadge status={sub.status} daysUntil={daysUntil} />
        </div>
      </div>
    </div>
  );
}
