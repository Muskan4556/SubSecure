"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useSpendByCategory } from "@/apis/ai/ai-api";
import { formatAmount } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const CATEGORY_LABELS: Record<string, string> = {
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

// Colors matching CategoryBadge
const CATEGORY_COLORS: Record<string, string> = {
  ENTERTAINMENT: "#fb7185", // rose-400
  MUSIC: "#c084fc", // purple-400
  PRODUCTIVITY: "#60a5fa", // blue-400
  CLOUD_STORAGE: "#38bdf8", // sky-400
  DEVELOPMENT: "#34d399", // emerald-400
  EDUCATION: "#fbbf24", // amber-400
  HEALTH_FITNESS: "#4ade80", // green-400
  NEWS_READING: "#fb923c", // orange-400
  GAMING: "#a78bfa", // violet-400
  UTILITIES: "#2dd4bf", // teal-400
  FINANCE: "#a3e635", // lime-400
  OTHER: "rgba(255,255,255,0.35)",
};

export function SpendByCategoryChart() {
  const { data, isLoading } = useSpendByCategory();

  const categories = data?.data ?? [];

  // Sort by spend descending
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => b.monthlyAmount - a.monthlyAmount);
  }, [categories]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      monthlyAmount: {
        label: "Monthly Spend",
      },
    };
    for (const item of sortedCategories) {
      config[item.category] = {
        label: CATEGORY_LABELS[item.category] ?? item.category,
        color: CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.OTHER,
      };
    }
    return config;
  }, [sortedCategories]);

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-7 w-full bg-white/5" />
        ))}
      </div>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <p className="text-[12px] font-mono text-white/25 text-center py-6">
        No subscription spend yet
      </p>
    );
  }

  const chartData = sortedCategories.map((c) => ({
    category: c.category,
    label: CATEGORY_LABELS[c.category] ?? c.category,
    monthlyAmount: c.monthlyAmount,
    share: c.share,
    fill: CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS.OTHER,
  }));

  return (
    <div className="w-full">
      <ChartContainer
        config={chartConfig}
        className="w-full"
        style={{ height: Math.max(160, chartData.length * 36) }}
      >
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
          barCategoryGap="25%"
        >
          <XAxis
            type="number"
            dataKey="monthlyAmount"
            hide
          />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            tick={{
              fill: "rgba(255,255,255,0.45)",
              fontSize: 11,
              fontFamily: "var(--font-geist-mono)",
            }}
            axisLine={false}
            tickLine={false}
          />
          <ChartTooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white/90">
                      {formatAmount(Number(value))}/mo
                    </span>
                    <span className="text-[11px] font-mono text-white/40">
                      ({item.payload.share}%)
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar
            dataKey="monthlyAmount"
            radius={[0, 4, 4, 0]}
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.category}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

