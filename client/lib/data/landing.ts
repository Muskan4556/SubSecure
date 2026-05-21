import {
  CreditCard,
  FileText,
  Activity,
  XCircle,
  Bell,
  Users,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";

// Ticker items
export const TICKER_ITEMS = [
  "ROLE-BASED ACCESS CONTROL",
  "AUDIT LOG VISIBILITY",
  "DUPLICATE SUBSCRIPTION GUARD",
  "BCRYPT PASSWORD HASHING",
  "HTTPONLY REFRESH COOKIES",
  "JWT ACCESS TOKENS",
  "SILENT TOKEN REFRESH",
  "ZOD SCHEMA VALIDATION",
  "PASSWORD STRENGTH ENFORCEMENT",
  "OWNERSHIP CHECK MIDDLEWARE",
  "EXPRESS RATE LIMITING",
] as const;

// Dashboard mockup data
export type DashboardRow = {
  name: string;
  plan: string;
  cost: string;
  next: string;
  status: "Active" | "Ending";
};

export const DASHBOARD_ROWS: DashboardRow[] = [
  {
    name: "Figma Professional",
    plan: "Team · Annual",
    cost: "$540/yr",
    next: "Dec 14",
    status: "Active",
  },
  {
    name: "GitHub Enterprise",
    plan: "Per-seat · Monthly",
    cost: "$21/mo",
    next: "Jun 18",
    status: "Active",
  },
  {
    name: "Slack Business+",
    plan: "Per-seat · Monthly",
    cost: "$87/mo",
    next: "Jun 3",
    status: "Ending",
  },
  {
    name: "Adobe Creative Cloud",
    plan: "All Apps · Annual",
    cost: "$720/yr",
    next: "Aug 22",
    status: "Active",
  },
  {
    name: "Notion Team",
    plan: "Plus · Monthly",
    cost: "$16/mo",
    next: "Jun 29",
    status: "Active",
  },
];

export type DashboardStat = { label: string; value: string; green?: boolean };

export const DASHBOARD_STATS: DashboardStat[] = [
  { label: "Monthly Spend", value: "$213" },
  { label: "Annual Commitment", value: "$1,384" },
  { label: "Upcoming Renewals", value: "3", green: true },
  { label: "Audit Events (24h)", value: "18" },
];

export type SidebarNavItem = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: string;
};

export const DASHBOARD_SIDEBAR_NAV: SidebarNavItem[] = [
  { icon: CreditCard, label: "Subscriptions", active: true },
  { icon: Activity, label: "Activity Logs", badge: "12" },
  { icon: Bell, label: "Renewals", badge: "2" },
  { icon: FileText, label: "Billing History" },
  { icon: Users, label: "Analytics" },
];

// Problem section data
export type ProblemStat = { n: string; label: string };

export const PROBLEM_STATS: ProblemStat[] = [
  {
    n: "$219",
    label: "Average monthly subscription spend\nreported by consumers",
  },
  {
    n: "67%",
    label: "Of Fortune 1000 employees use SaaS apps\nwithout IT approval",
  },
  {
    n: "~30%",
    label: "Of SaaS spend can sit unused\nthrough overlap and underuse",
  },
];

// Security section data
export type SecurityTechnique = { label: string };

export const SECURITY_TECHNIQUES: SecurityTechnique[] = [
  { label: "bcrypt · cost-10" },
  { label: "JWT · 15m access tokens" },
  { label: "httpOnly refresh cookies" },
  { label: "Express rate limiting" },
  { label: "Duplicate subscription guard" },
  { label: "Zod server-side validation" },
];

export type ThreatRow = { n: string; threat: string; fix: string };

export const THREAT_MODEL: ThreatRow[] = [
  {
    n: "01",
    threat: "Credential Compromise",
    fix: "Rate-limited login endpoints, bcrypt hashing, strong password policy enforced at signup.",
  },
  {
    n: "02",
    threat: "Payment Data Leakage",
    fix: "Authenticated API access, httpOnly refresh cookies, and no payment card data stored in the app.",
  },
  {
    n: "03",
    threat: "Unauthorized Manipulation",
    fix: "Server-enforced RBAC, ownership checks, Zod input validation, and audit logs for key actions.",
  },
  {
    n: "04",
    threat: "Replay / Duplicate Requests",
    fix: "Duplicate subscription guard performs case-insensitive validation before any write is committed to the database",
  },
  {
    n: "05",
    threat: "Insider Misuse",
    fix: "Audit logs capture actor, action, entity, IP address, and timestamp with admin/user role separation.",
  },
];

// Platform / features section data
export type Feature = { icon: LucideIcon; name: string; desc: string };

export const FEATURES: Feature[] = [
  {
    icon: CreditCard,
    name: "Subscription Dashboard",
    desc: "Every recurring charge in one view — active, ending, cancelled. Admins see all. Users see theirs. Enforced at the API layer.",
  },
  {
    icon: FileText,
    name: "Billing History",
    desc: "A permanent record of every payment event with amount, date, and status. Your paper trail against unexplained charges.",
  },
  {
    icon: Activity,
    name: "Immutable Audit Logs",
    desc: "Important auth, admin, subscription, billing, and renewal actions are logged with actor identity and timestamps.",
  },
  {
    icon: XCircle,
    name: "Controlled Cancellation",
    desc: "Cancel any active subscription immediately. Every cancellation is logged with actor identity — no silent or unauthorized reversals.",
  },
  {
    icon: Bell,
    name: "Renewal Visibility",
    desc: "See upcoming renewals before they hit your bill. No more opening your bank statement to find a surprise charge.",
  },
  {
    icon: Users,
    name: "Role-Based Access",
    desc: "Admins manage everything. Users manage only theirs. Not a UI trick — it's enforced server-side on every endpoint.",
  },
];

// Mission section data
export type MissionPoint = { icon: LucideIcon; text: string };

export const MISSION_POINTS: MissionPoint[] = [
  {
    icon: CheckCircle,
    text: "Full visibility into every active and upcoming charge",
  },
  {
    icon: CheckCircle,
    text: "Prevents duplicate subscriptions for the same service",
  },
  {
    icon: CheckCircle,
    text: "Billing history creates a paper trail against unauthorized changes",
  },
  {
    icon: CheckCircle,
    text: "Immutable audit logs enforce organizational accountability",
  },
  {
    icon: CheckCircle,
    text: "Role-based access stops insider billing manipulation",
  },
];
