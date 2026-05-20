import {
  Users,
  CreditCard,
  ShieldAlert,
  Activity,
  BarChart3,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export type StatCard = {
  label: string;
  value: number;
  sub: string;
  color: string;
};

export type QuickLink = {
  icon: LucideIcon;
  label: string;
  sub: string;
  href: string;
};

export type UserBreakdownItem = {
  icon: LucideIcon;
  label: string;
  color: string;
  valueKey:
    | "active"
    | "suspended"
    | "auditEventsLast24h"
    | "activeSubscriptions";
};

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export const ADMIN_QUICK_LINKS: QuickLink[] = [
  {
    icon: BarChart3,
    label: "Analytics",
    sub: "Platform-wide spending & trends",
    href: "/dashboard/analytics",
  },
  {
    icon: ScrollText,
    label: "Activity Logs",
    sub: "Full audit trail",
    href: "/dashboard/activity",
  },
];

export const USER_BREAKDOWN_ITEMS: UserBreakdownItem[] = [
  {
    icon: Users,
    label: "Active Users",
    color: "text-emerald-400",
    valueKey: "active",
  },
  {
    icon: ShieldAlert,
    label: "Suspended Users",
    color: "text-red-400",
    valueKey: "suspended",
  },
  {
    icon: Activity,
    label: "Audit Events (24 h)",
    color: "text-amber-400",
    valueKey: "auditEventsLast24h",
  },
  {
    icon: CreditCard,
    label: "Active Subscriptions",
    color: "text-blue-400",
    valueKey: "activeSubscriptions",
  },
];
