import {
  LayoutDashboard,
  CreditCard,
  PlusCircle,
  RotateCw,
  BarChart3,
  ScrollText,
  Receipt,
  Users,
  User,
  type LucideIcon,
} from "lucide-react";

export type Role = "ADMIN" | "USER";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["USER"],
      },
      {
        label: "Dashboard",
        href: "/dashboard/admin",
        icon: LayoutDashboard,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Subscriptions",
    items: [
      {
        label: "Subscriptions",
        href: "/dashboard/subscriptions",
        icon: CreditCard,
        roles: ["USER"],
      },
      {
        label: "New Subscription",
        href: "/dashboard/subscriptions/new",
        icon: PlusCircle,
        roles: ["USER"],
      },
      {
        label: "Renewals",
        href: "/dashboard/renewals",
        icon: RotateCw,
        roles: ["USER"],
      },
      {
        label: "Billing History",
        href: "/dashboard/billing-history",
        icon: Receipt,
        roles: ["USER"],
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        roles: ["ADMIN"],
      },
      {
        label: "Activity Logs",
        href: "/dashboard/activity",
        icon: ScrollText,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        label: "Users",
        href: "/dashboard/admin/users",
        icon: Users,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Profile", href: "/dashboard/profile", icon: User }],
  },
];
