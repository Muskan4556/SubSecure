"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  return status === "ACTIVE" ? (
    <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
      Active
    </span>
  ) : (
    <span className="text-[11px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
      Cancelled
    </span>
  );
}

export function SubscriptionRow({
  sub,
  onCancel,
  now,
}: {
  sub: Subscription;
  onCancel: (id: string) => void;
  now: number;
}) {
  const [open, setOpen] = useState(false);

  const daysUntil = Math.ceil(
    (new Date(sub.renewalDate).getTime() - now) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="flex items-center gap-4 bg-[#0d1525] px-5 py-3.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <Link
            href={`/dashboard/subscriptions/${sub.id}`}
            className="text-[13px] font-medium text-white/75 hover:text-white/90 transition-colors truncate"
          >
            {sub.name}
          </Link>
          <StatusBadge status={sub.status} />
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {sub.category && (
            <span className="text-[11px] font-mono text-white/25">
              {sub.category}
            </span>
          )}
          <span className="text-[11px] font-mono text-white/20">
            {sub.billingCycle === "MONTHLY" ? "Monthly" : "Yearly"}
          </span>
          {sub.status === "ACTIVE" && (
            <span
              className={`text-[11px] font-mono ${daysUntil <= 7 ? "text-amber-400/70" : "text-white/20"}`}
            >
              renews{" "}
              {formatDateShort(sub.renewalDate)}
              {daysUntil <= 7 && ` (${daysUntil}d)`}
            </span>
          )}
        </div>
      </div>

      <div className="text-[14px] font-mono text-white/70 shrink-0">
        {formatAmount(sub.amount)}
        <span className="text-[11px] text-white/25">
          /{sub.billingCycle === "MONTHLY" ? "mo" : "yr"}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/dashboard/subscriptions/${sub.id}`}
          className="text-[11px] font-mono text-white/30 hover:text-white/70 transition-colors flex items-center gap-1"
        >
          View <ArrowUpRight className="w-3 h-3" />
        </Link>

        {sub.status === "ACTIVE" && (
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
                  <strong>{sub.name}</strong> will be cancelled immediately.
                  This cannot be undone.
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
        )}
      </div>
    </div>
  );
}
