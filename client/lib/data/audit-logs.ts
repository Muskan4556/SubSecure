export const ACTION_COLORS: Record<string, string> = {
  USER_SIGNED_UP: "text-blue-400/70",
  LOGIN_FAILED: "text-red-400/70",
  SUB_CREATED: "text-emerald-400/70",
  SUB_CANCELLED: "text-red-400/70",
  SUB_UPDATED: "text-amber-400/70",
  ACCOUNT_SUSPENDED: "text-red-400",
  RECURRING_BILLING_PROCESSED: "text-blue-400/50",
  RENEWAL_REMINDER_SENT: "text-white/40",
};

export const ACTION_FILTERS = [
  "",
  "LOGIN_FAILED",
  "SUB_CREATED",
  "SUB_CANCELLED",
  "ACCOUNT_SUSPENDED",
] as const;

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}
