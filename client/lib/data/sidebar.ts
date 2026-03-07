import {
  LayoutDashboard,
  CreditCard,
  PlusCircle,
  ClipboardCheck,
  RotateCw,
  BarChart3,
  ScrollText,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Subscriptions",
    items: [
      {
        label: "Subscriptions",
        href: "/dashboard/subscriptions",
        icon: CreditCard,
      },
      {
        label: "New Subscription",
        href: "/dashboard/subscriptions/new",
        icon: PlusCircle,
      },
      {
        label: "Approvals",
        href: "/dashboard/approvals",
        icon: ClipboardCheck,
      },
      { label: "Renewals", href: "/dashboard/renewals", icon: RotateCw },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Activity Logs", href: "/dashboard/activity", icon: ScrollText },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Profile", href: "/dashboard/profile", icon: User }],
  },
];
