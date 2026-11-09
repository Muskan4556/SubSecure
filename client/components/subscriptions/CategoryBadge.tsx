import type { SubscriptionCategory } from "@/lib/types/subscription-types";

const CATEGORY_LABELS: Record<SubscriptionCategory, string> = {
  ENTERTAINMENT: "Entertainment",
  MUSIC: "Music",
  PRODUCTIVITY: "Productivity",
  CLOUD_STORAGE: "Cloud Storage",
  DEVELOPMENT: "Development",
  EDUCATION: "Education",
  HEALTH_FITNESS: "Health & Fitness",
  NEWS_READING: "News & Reading",
  GAMING: "Gaming",
  UTILITIES: "Utilities",
  FINANCE: "Finance",
  OTHER: "Other",
};

const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  ENTERTAINMENT:
    "bg-rose-500/15 text-rose-400/90 ring-rose-500/20",
  MUSIC:
    "bg-purple-500/15 text-purple-400/90 ring-purple-500/20",
  PRODUCTIVITY:
    "bg-blue-500/15 text-blue-400/90 ring-blue-500/20",
  CLOUD_STORAGE:
    "bg-sky-500/15 text-sky-400/90 ring-sky-500/20",
  DEVELOPMENT:
    "bg-emerald-500/15 text-emerald-400/90 ring-emerald-500/20",
  EDUCATION:
    "bg-amber-500/15 text-amber-400/90 ring-amber-500/20",
  HEALTH_FITNESS:
    "bg-green-500/15 text-green-400/90 ring-green-500/20",
  NEWS_READING:
    "bg-orange-500/15 text-orange-400/90 ring-orange-500/20",
  GAMING:
    "bg-violet-500/15 text-violet-400/90 ring-violet-500/20",
  UTILITIES:
    "bg-teal-500/15 text-teal-400/90 ring-teal-500/20",
  FINANCE:
    "bg-lime-500/15 text-lime-400/90 ring-lime-500/20",
  OTHER:
    "bg-white/8 text-white/40 ring-white/10",
};

export function CategoryBadge({
  category,
  size = "sm",
}: {
  category: SubscriptionCategory;
  size?: "sm" | "xs";
}) {
  const label = CATEGORY_LABELS[category] ?? category;
  const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.OTHER;
  const cls =
    size === "xs"
      ? "text-[10px] px-1.5 py-px"
      : "text-[11px] px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono ring-1 ring-inset ${cls} ${color}`}
    >
      {label}
    </span>
  );
}
