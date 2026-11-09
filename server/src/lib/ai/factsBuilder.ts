import { createHash } from "crypto";
import prisma from "../prisma";
import { BillingCycle, SubscriptionStatus } from "@prisma/client";

export type SignalType = "OVERLAP" | "CLUSTER" | "CONCENTRATION" | "RENEWAL_SOON";

export interface SignalSavings {
  monthlyMin: number;
  monthlyMax: number;
  yearlyMin: number;
  yearlyMax: number;
}

export interface InsightSignal {
  id: string;
  type: SignalType;
  category?: string;
  subjectName?: string;
  names?: string[];
  subscriptionIds: string[];
  combinedMonthly?: number;
  share?: number;
  monthlyAmount?: number;
  renewalDate?: string;
  // CLUSTER specific fields
  date?: string;
  total?: number;
  count?: number;
  // Context added to every item (computed in code)
  yearly?: number;
  perDay?: number;
  savings: SignalSavings | null;
}

export interface CategoryFact {
  category: string;
  monthlyAmount: number;
  share: number; // percentage 0-100
}

export interface CategoryItem {
  name: string;
  monthly: number;
  yearly: number;
  perDay: number;
}

export interface CategoryDetail {
  category: string;
  monthly: number;
  yearly: number;
  perDay: number;
  share: number;
  items: CategoryItem[];
}

export interface InsightFacts {
  activeCount: number;
  monthlyTotal: number;
  yearlyTotal: number;
  perDayTotal: number;
  byCategory: CategoryFact[];
  categories: CategoryDetail[]; // enriched view for AI: names + amounts per item, no IDs
  signals: InsightSignal[];
}

export interface InsightFactsWithHash extends InsightFacts {
  dataHash: string;
}

export interface SubscriptionInput {
  id: string;
  name: string;
  amount: number | string;
  billingCycle: BillingCycle;
  category: string;
  renewalDate: Date;
}

export function toMonthly(amount: number, cycle: BillingCycle): number {
  return cycle === BillingCycle.YEARLY ? amount / 12 : amount;
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Categories eligible for OVERLAP signals
export const OVERLAP_CATEGORIES = new Set([
  "ENTERTAINMENT",
  "MUSIC",
  "CLOUD_STORAGE",
]);

export function computeSignals(
  subs: SubscriptionInput[],
  now = new Date(),
): {
  monthlyTotal: number;
  yearlyTotal: number;
  perDayTotal: number;
  byCategory: CategoryFact[];
  categories: CategoryDetail[];
  signals: InsightSignal[];
} {
  const monthlyTotal = Math.round(
    subs.reduce(
      (sum, s) => sum + toMonthly(Number(s.amount), s.billingCycle),
      0,
    ) * 100,
  ) / 100;
  const yearlyTotal = Math.round(monthlyTotal * 12 * 100) / 100;
  const perDayTotal = Math.round((monthlyTotal / 30) * 100) / 100;

  // Group by category
  const catMap = new Map<string, { total: number; subs: SubscriptionInput[] }>();
  for (const s of subs) {
    const entry = catMap.get(s.category) ?? { total: 0, subs: [] };
    entry.total += toMonthly(Number(s.amount), s.billingCycle);
    entry.subs.push(s);
    catMap.set(s.category, entry);
  }

  const byCategory: CategoryFact[] = Array.from(catMap.entries())
    .map(([category, { total }]) => ({
      category,
      monthlyAmount: Math.round(total * 100) / 100,
      share: monthlyTotal > 0 ? Math.round((total / monthlyTotal) * 100) : 0,
    }))
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount);

  const overlapSignals: InsightSignal[] = [];
  const clusterSignals: InsightSignal[] = [];
  const concentrationSignals: InsightSignal[] = [];
  const renewalSoonSignals: InsightSignal[] = [];

  // 1. OVERLAP: 2+ active subscriptions in ENTERTAINMENT, MUSIC or CLOUD_STORAGE only.
  // Do NOT create overlaps for PRODUCTIVITY or DEVELOPMENT.
  for (const [category, { subs: catSubs }] of catMap.entries()) {
    if (OVERLAP_CATEGORIES.has(category) && catSubs.length >= 2) {
      const monthlyValues = catSubs.map((s) =>
        toMonthly(Number(s.amount), s.billingCycle),
      );
      const combinedMonthly =
        Math.round(monthlyValues.reduce((a, b) => a + b, 0) * 100) / 100;
      const monthlyMin = Math.round(Math.min(...monthlyValues) * 100) / 100;
      const monthlyMax = Math.round(Math.max(...monthlyValues) * 100) / 100;
      const yearlyMin = Math.round(monthlyMin * 12 * 100) / 100;
      const yearlyMax = Math.round(monthlyMax * 12 * 100) / 100;

      overlapSignals.push({
        id: `overlap-${category}`,
        type: "OVERLAP",
        category,
        subscriptionIds: catSubs.map((s) => s.id),
        names: catSubs.map((s) => s.name),
        combinedMonthly,
        yearly: Math.round(combinedMonthly * 12 * 100) / 100,
        perDay: Math.round((combinedMonthly / 30) * 100) / 100,
        savings: {
          monthlyMin,
          monthlyMax,
          yearlyMin,
          yearlyMax,
        },
      });
    }
  }

  // 2. CLUSTER: 3+ active subscriptions renewing within the same 3 days.
  // Sort subs by renewal date
  const sortedByRenewal = [...subs].sort(
    (a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime(),
  );

  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
  const processedClusterIds = new Set<string>();

  for (let i = 0; i < sortedByRenewal.length; i++) {
    const startSub = sortedByRenewal[i];
    if (!startSub || processedClusterIds.has(startSub.id)) continue;

    const startTime = new Date(startSub.renewalDate).getTime();
    const windowSubs: SubscriptionInput[] = [startSub];

    for (let j = i + 1; j < sortedByRenewal.length; j++) {
      const candidate = sortedByRenewal[j];
      if (!candidate) continue;
      const candidateTime = new Date(candidate.renewalDate).getTime();
      if (candidateTime - startTime <= THREE_DAYS_MS) {
        windowSubs.push(candidate);
      } else {
        break;
      }
    }

    if (windowSubs.length >= 3) {
      windowSubs.forEach((s) => processedClusterIds.add(s.id));

      const clusterTotal = Math.round(
        windowSubs.reduce((sum, s) => sum + Number(s.amount), 0) * 100,
      ) / 100;

      const firstDate = new Date(startSub.renewalDate);
      const lastSub = windowSubs[windowSubs.length - 1];
      const lastDate = lastSub ? new Date(lastSub.renewalDate) : firstDate;
      const dateStr =
        firstDate.toDateString() === lastDate.toDateString()
          ? formatDateDisplay(firstDate)
          : `${formatDateDisplay(firstDate)} – ${formatDateDisplay(lastDate)}`;

      clusterSignals.push({
        id: `cluster-${startSub.id}`,
        type: "CLUSTER",
        names: windowSubs.map((s) => s.name),
        subscriptionIds: windowSubs.map((s) => s.id),
        date: dateStr,
        total: clusterTotal,
        count: windowSubs.length,
        yearly: Math.round(clusterTotal * 12 * 100) / 100,
        perDay: Math.round((clusterTotal / 30) * 100) / 100,
        savings: null,
      });
    }
  }

  // 3. CONCENTRATION: one category with share >= 50%, or one subscription with share >= 40% of the monthly total.
  for (const cat of byCategory) {
    if (cat.share >= 50) {
      const catEntry = catMap.get(cat.category);
      concentrationSignals.push({
        id: `concentration-${cat.category}`,
        type: "CONCENTRATION",
        subjectName: cat.category,
        share: cat.share,
        monthlyAmount: cat.monthlyAmount,
        yearly: Math.round(cat.monthlyAmount * 12 * 100) / 100,
        perDay: Math.round((cat.monthlyAmount / 30) * 100) / 100,
        subscriptionIds: catEntry ? catEntry.subs.map((s) => s.id) : [],
        savings: null,
      });
    }
  }

  for (const s of subs) {
    const subMonthly = toMonthly(Number(s.amount), s.billingCycle);
    const share =
      monthlyTotal > 0 ? Math.round((subMonthly / monthlyTotal) * 100) : 0;
    if (share >= 40) {
      concentrationSignals.push({
        id: `concentration-sub-${s.id}`,
        type: "CONCENTRATION",
        subjectName: s.name,
        share,
        monthlyAmount: Math.round(subMonthly * 100) / 100,
        yearly: Math.round(subMonthly * 12 * 100) / 100,
        perDay: Math.round((subMonthly / 30) * 100) / 100,
        subscriptionIds: [s.id],
        savings: null,
      });
    }
  }

  // 4. RENEWAL_SOON: renews within 7 days and monthlyAmount >= 20% of the monthly total.
  for (const s of subs) {
    const subMonthly = toMonthly(Number(s.amount), s.billingCycle);
    const renewalTime = new Date(s.renewalDate).getTime();
    const nowTime = now.getTime();
    const diffDays = (renewalTime - nowTime) / (1000 * 60 * 60 * 24);

    const isWithin7Days = diffDays >= 0 && diffDays <= 7;
    const isAtLeast20Percent =
      monthlyTotal > 0 && subMonthly >= 0.2 * monthlyTotal;

    if (isWithin7Days && isAtLeast20Percent) {
      renewalSoonSignals.push({
        id: `renewal-${s.id}`,
        type: "RENEWAL_SOON",
        subjectName: s.name,
        renewalDate: new Date(s.renewalDate).toISOString(),
        date: formatDateDisplay(new Date(s.renewalDate)),
        monthlyAmount: Math.round(subMonthly * 100) / 100,
        yearly: Math.round(subMonthly * 12 * 100) / 100,
        perDay: Math.round((subMonthly / 30) * 100) / 100,
        subscriptionIds: [s.id],
        savings: null,
      });
    }
  }

  // Priority: OVERLAP > CLUSTER > CONCENTRATION > RENEWAL_SOON. Keep at most 5 signals.
  const rankedSignals = [
    ...overlapSignals,
    ...clusterSignals,
    ...concentrationSignals,
    ...renewalSoonSignals,
  ].slice(0, 5);

  // Build categories view for AI: names + amounts per item, no IDs, sorted by monthly desc
  const categories: CategoryDetail[] = Array.from(catMap.entries())
    .map(([category, { total, subs: catSubs }]) => {
      const catMonthly = Math.round(total * 100) / 100;
      return {
        category,
        monthly: catMonthly,
        yearly: Math.round(catMonthly * 12 * 100) / 100,
        perDay: Math.round((catMonthly / 30) * 100) / 100,
        share: monthlyTotal > 0 ? Math.round((total / monthlyTotal) * 100) : 0,
        items: catSubs
          .map((s) => {
            const m = Math.round(toMonthly(Number(s.amount), s.billingCycle) * 100) / 100;
            return {
              name: s.name,
              monthly: m,
              yearly: Math.round(m * 12 * 100) / 100,
              perDay: Math.round((m / 30) * 100) / 100,
            };
          })
          .sort((a, b) => b.monthly - a.monthly),
      };
    })
    .sort((a, b) => b.monthly - a.monthly);

  return {
    monthlyTotal,
    yearlyTotal,
    perDayTotal,
    byCategory,
    categories,
    signals: rankedSignals,
  };
}

export async function buildFacts(userId: string): Promise<InsightFactsWithHash> {
  const rawSubs = await prisma.subscription.findMany({
    where: { userId, status: SubscriptionStatus.ACTIVE },
    select: {
      id: true,
      name: true,
      amount: true,
      billingCycle: true,
      category: true,
      renewalDate: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const subs: SubscriptionInput[] = rawSubs.map((s) => ({
    id: s.id,
    name: s.name,
    amount: Number(s.amount),
    billingCycle: s.billingCycle,
    category: s.category,
    renewalDate: s.renewalDate,
  }));

  const { monthlyTotal, yearlyTotal, perDayTotal, byCategory, categories, signals } = computeSignals(subs);

  const facts: InsightFacts = {
    activeCount: subs.length,
    monthlyTotal,
    yearlyTotal,
    perDayTotal,
    byCategory,
    categories,
    signals,
  };

  const dataHash = createHash("sha256")
    .update(JSON.stringify(facts))
    .digest("hex");

  return { ...facts, dataHash };
}
