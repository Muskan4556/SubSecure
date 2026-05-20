import type { BillingStatus } from "@/lib/types/subscription-types";

const STATUS_STYLES: Record<BillingStatus, string> = {
  PAID: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  PENDING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  FAILED: "text-red-400 bg-red-500/10 border-red-500/20",
};

export function BillingStatusBadge({ status }: { status: BillingStatus }) {
  return (
    <span
      className={`text-[9px] font-mono border px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
