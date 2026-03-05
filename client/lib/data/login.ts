import { ShieldCheck, AlertTriangle, BarChart3, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type LoginFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const loginFeatures: LoginFeature[] = [
  {
    icon: ShieldCheck,
    title: "Zero Zombie Subscriptions",
    description: "Detect and eliminate unused SaaS tools draining your budget.",
  },
  {
    icon: AlertTriangle,
    title: "Shadow IT Detection",
    description: "Uncover unauthorized software purchases before they become risks.",
  },
  {
    icon: BarChart3,
    title: "Compliance & Audit Trails",
    description: "Enterprise-grade logs and controls for every subscription event.",
  },
  {
    icon: Lock,
    title: "Secure Credential Vault",
    description: "Billing credentials protected with end-to-end encryption.",
  },
];

export const loginBranding = {
  headline: "Stop Subscription\nSprawl in its tracks.",
  subheadline:
    "Full visibility over every SaaS tool, billing credential, and access permission — secured and auditable.",
  badge: "Enterprise Subscription Management",
  complianceTags: ["SOC 2 Type II", "ISO 27001", "GDPR"],
};
