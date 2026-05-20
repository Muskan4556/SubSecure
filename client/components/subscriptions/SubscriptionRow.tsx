"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Subscription, SubscriptionStatus } from "@/lib/types/subscription-types";
import { formatAmount, formatDateShort } from "@/lib/utils/format";
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

function StatusBadge({
  status,
  daysUntil,
}: {
  status: SubscriptionStatus;
  daysUntil: number;
}) {
  if (status === "CANCELLED") {
    return (
      <span className="text-[10px] font-mono bg-red-500/12 text-red-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">
        Cancelled
      </span>
    );
  }
  if (daysUntil <= 7) {
    return (
      <span className="text-[10px] font-mono bg-amber-400/12 text-amber-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">
        Ending soon
      </span>
    );
  }
  return (
    <span className="text-[10px] font-mono bg-emerald-500/12 text-emerald-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">
      Active
    </span>
  );
}

function rowDotColor(status: SubscriptionStatus, daysUntil: number) {
  if (status === "CANCELLED") return "bg-red-500/50";
  if (daysUntil <= 7) return "bg-amber-400";
  return "bg-emerald-500";
}

export function SubscriptionRow({
  sub,
  onCancel,
  now,
  index,
}: {
  sub: Subscription;
  onCancel: (id: string) => void;
  now: number;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  const daysUntil = Math.ceil(
    (new Date(sub.renewalDate).getTime() - now) / (1000 * 60 * 60 * 24),
  );

  const plan = [sub.category, sub.billingCycle === "MONTHLY" ? "Monthly" : "Yearly"]
    .filter(Boolean)
    .join(" · ");

  const cancelButton = sub.status === "ACTIVE" && (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button className="text-[11px] font-mono text-red-400/40 hover:text-red-400 transition-colors">
          Cancel
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{sub.name}</strong> will be cancelled immediately. This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => onCancel(sub.id)}
          >
            Yes, cancel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const rowBg = index % 2 === 0 ? "bg-[#0d1525]" : "bg-white/[0.012]";

  return (
    <div className={`${rowBg} border-b border-white/4 last:border-0`}>
      {/* ── Desktop table row ── */}
      <div className="hidden md:grid md:grid-cols-[1fr_1fr_110px_90px_110px_100px] items-center px-5 py-2.5 gap-4 sm:gap-6">
        {/* Service + dot */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${rowDotColor(sub.status, daysUntil)}`}
          />
          <Link
            href={`/dashboard/subscriptions/${sub.id}`}
            className="text-[13px] text-white/70 hover:text-white/95 transition-colors truncate"
          >
            {sub.name}
          </Link>
        </div>

        {/* Plan (category · cycle) */}
        <span className="text-[12px] font-mono text-white/30 whitespace-nowrap truncate">
          {plan}
        </span>

        {/* Cost */}
        <span className="text-[13px] font-mono text-white/60 text-right">
          {formatAmount(sub.amount)}
          <span className="text-[11px] text-white/25">
            /{sub.billingCycle === "MONTHLY" ? "mo" : "yr"}
          </span>
        </span>

        {/* Next renewal */}
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/dashboard/subscriptions/${sub.id}`}
            className="text-[11px] font-mono text-white/25 hover:text-white/60 transition-colors"
          >
            View
          </Link>
          {cancelButton}
        </div>
      </div>

      {/* ── Mobile card row ── */}
      <div className="md:hidden flex items-start justify-between px-4 py-3 gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${rowDotColor(sub.status, daysUntil)}`}
          />
          <div className="min-w-0">
            <Link
              href={`/dashboard/subscriptions/${sub.id}`}
              className="text-[13px] text-white/75 hover:text-white/95 transition-colors truncate block"
            >
              {sub.name}
            </Link>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] font-mono text-white/25">{plan}</span>
              {sub.status === "ACTIVE" && (
                <span className={`text-[11px] font-mono flex items-center gap-1 ${daysUntil <= 7 ? "text-amber-400/70" : "text-white/20"}`}>
                  <Clock className="w-2.5 h-2.5" />
                  {formatDateShort(sub.renewalDate)}
                  {daysUntil <= 7 && ` (${daysUntil}d)`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-[13px] font-mono text-white/60">
            {formatAmount(sub.amount)}
            <span className="text-[11px] text-white/25">
              /{sub.billingCycle === "MONTHLY" ? "mo" : "yr"}
            </span>
          </span>
          <div className="flex items-center gap-2.5">
            <StatusBadge status={sub.status} daysUntil={daysUntil} />
            {cancelButton}
          </div>
        </div>
      </div>
    </div>
  );
}
