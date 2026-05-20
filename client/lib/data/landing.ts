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
  "IMMUTABLE AUDIT TRAILS",
  "IDEMPOTENT API OPERATIONS",
  "BCRYPT PASSWORD HASHING",
  "HTTPONLY REFRESH COOKIES",
  "JWT ACCESS TOKENS",
  "DUPLICATE BILLING GUARD",
  "ZOD SCHEMA VALIDATION",
  "SERVER-SIDE VALIDATION",
  "ZERO-TRUST API DESIGN",
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
  { icon: Activity, label: "Audit Log", badge: "12" },
  { icon: Bell, label: "Renewals", badge: "2" },
  { icon: FileText, label: "Billing History" },
  { icon: Users, label: "Analytics" },
];

// Problem section data
export type ProblemStat = { n: string; label: string };

export const PROBLEM_STATS: ProblemStat[] = [
  {
    n: "~$32",
    label: "Average monthly waste per person\nfrom forgotten subscriptions",
  },
  {
    n: "67%",
    label: "Of employees use SaaS tools\nwithout IT billing visibility",
  },
  { n: "3×", label: "Cost reduction from\na single recurring spend audit" },
];

// Security section data
export type SecurityTechnique = { label: string };

export const SECURITY_TECHNIQUES: SecurityTechnique[] = [
  { label: "bcrypt · cost-10" },
  { label: "JWT · 15m access tokens" },
  { label: "httpOnly refresh cookies" },
  { label: "Express rate limiting" },
  { label: "Idempotent writes" },
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
    fix: "HTTPS-only transport, all endpoints behind authenticated middleware, no raw credentials stored.",
  },
  {
    n: "03",
    threat: "Unauthorized Manipulation",
    fix: "Server-enforced RBAC on every route, Zod input validation, audit log on every state change.",
  },
  {
    n: "04",
    threat: "Replay / Duplicate Requests",
    fix: "Duplicate subscription guard runs inside a DB transaction before any write is committed.",
  },
  {
    n: "05",
    threat: "Insider Misuse",
    fix: "Immutable audit trail with before/after diffs, actor identity on every event, admin/user role separation.",
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
    desc: "Create, update, cancel, delete — every action is permanently logged with actor identity and a full before/after diff.",
  },
  {
    icon: XCircle,
    name: "Controlled Cancellation",
    desc: "Cancel any active subscription immediately. Every cancellation is logged with actor identity — no silent or unauthorized reversals.",
  },
  {
    icon: Bell,
    name: "Renewal Visibility",
    desc: "See everything renewing in the next 30 days. No more opening your bank statement to find a surprise charge.",
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
