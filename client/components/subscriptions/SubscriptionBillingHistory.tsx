"use client";

import { Receipt, Loader2 } from "lucide-react";
import { BillingStatusBadge } from "@/components/subscriptions/BillingStatusBadge";
import { formatAmount, formatDateLong } from "@/lib/utils/format";
import type { BillingHistory } from "@/lib/types/subscription-types";

type Props = {
  history: BillingHistory[];
  isLoading: boolean;
};

export function SubscriptionBillingHistory({ history, isLoading }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="w-3.5 h-3.5 text-white/25" />
        <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em]">
          Billing history
        </p>
      </div>

      <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
        {isLoading ? (
          <div className="bg-[#0d1525] px-5 py-8 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="bg-[#0d1525] px-5 py-6 text-center">
            <p className="text-[12px] font-mono text-white/25">
              No billing records yet
            </p>
          </div>
        ) : (
          history.map((record) => (
            <div
              key={record.id}
              className="flex items-center gap-4 bg-[#0d1525] px-5 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-mono text-white/55">
                  {formatDateLong(record.billingDate)}
                </p>
              </div>
              <BillingStatusBadge status={record.status} />
              <p className="text-[13px] font-mono text-white/70 shrink-0">
                {formatAmount(record.amount)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
