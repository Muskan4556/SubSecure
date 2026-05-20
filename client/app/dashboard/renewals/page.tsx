"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, AlertCircle, RotateCw } from "lucide-react";
import { useUpcomingRenewals } from "@/apis/subscriptions/subscriptions-api";
import { formatAmount, formatDateShort } from "@/lib/utils/format";

function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const DAY_OPTIONS = [7, 14, 30, 60, 90];

export default function RenewalsPage() {
  const [days, setDays] = useState(60);
  const { data, isLoading } = useUpcomingRenewals(days);
  const renewals = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">
            Renewals
          </p>
          <h1 className="text-[1.1rem] sm:text-[1.25rem] font-bold tracking-tight text-white/90">
            Upcoming renewals
          </h1>
        </div>

        {/* Day filter */}
        <div className="flex gap-1">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-[11px] font-mono px-3 py-1.5 rounded-lg transition-colors ${
                days === d
                  ? "bg-white/10 text-white/80"
                  : "text-white/30 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
        </div>
      ) : renewals.length === 0 ? (
        <div className="bg-white/3 border border-white/8 rounded-xl px-5 py-12 text-center">
          <RotateCw className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-[13px] font-mono text-white/30">
            No renewals in the next {days} days
          </p>
          {days < 90 && (
            <p className="text-[11px] font-mono text-white/15 mt-1.5">
              Try a longer window — monthly renewals can be 31 days out
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
          {renewals.map((sub) => {
            const d = daysUntil(sub.renewalDate);
            const urgent = d <= 3;
            return (
              <Link
                key={sub.id}
                href={`/dashboard/subscriptions/${sub.id}`}
                className="flex items-center gap-4 bg-[#0d1525] hover:bg-white/4 px-5 py-3.5 group transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-white/75 group-hover:text-white/90 transition-colors truncate">
                      {sub.name}
                    </span>
                    {urgent && (
                      <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {sub.category && (
                      <span className="text-[11px] font-mono text-white/25">{sub.category}</span>
                    )}
                    <span className="text-[11px] font-mono text-white/20">
                      {sub.billingCycle === "MONTHLY" ? "Monthly" : "Yearly"}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[13px] font-mono text-white/70">
                    {formatAmount(sub.amount)}
                    <span className="text-[11px] text-white/25">/{sub.billingCycle === "MONTHLY" ? "mo" : "yr"}</span>
                  </div>
                  <div className={`text-[11px] font-mono mt-0.5 ${urgent ? "text-amber-400/80" : "text-white/30"}`}>
                    {d === 0 ? "Today" : d === 1 ? "Tomorrow" : `in ${d} days`}
                    {" · "}
                    {formatDateShort(sub.renewalDate)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!isLoading && renewals.length > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/20">
          <RotateCw className="w-3 h-3" />
          {renewals.length} renewal{renewals.length !== 1 ? "s" : ""} within {days} days
        </div>
      )}
    </div>
  );
}
