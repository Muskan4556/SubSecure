import { createHash } from "crypto";
import prisma from "../prisma";
import { BillingCycle, SubscriptionStatus } from "@prisma/client";

export type SignalType = "OVERLAP" | "CONCENTRATION" | "RENEWAL_SOON";

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
}

export interface CategoryDetail {
  category: string;
  monthly: number;
  share: number;
  items: CategoryItem[];
}

export interface InsightFacts {
  activeCount: number;
  monthlyTotal: number;
  yearlyTotal: number;
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
        savings: {
          monthlyMin,
          monthlyMax,
          yearlyMin,
          yearlyMax,
        },
      });
    }
  }

  // 2. CONCENTRATION: one category with share >= 50%, or one subscription with share >= 40% of the monthly total.
  // Category concentration
  for (const cat of byCategory) {
    if (cat.share >= 50) {
      const catEntry = catMap.get(cat.category);
      concentrationSignals.push({
        id: `concentration-${cat.category}`,
        type: "CONCENTRATION",
        subjectName: cat.category,
        share: cat.share,
        monthlyAmount: cat.monthlyAmount,
        subscriptionIds: catEntry ? catEntry.subs.map((s) => s.id) : [],
        savings: null,
      });
    }
  }

  // Single subscription concentration >= 40%
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
        subscriptionIds: [s.id],
        savings: null,
      });
    }
  }

  // 3. RENEWAL_SOON: renews within 7 days and monthlyAmount >= 20% of the monthly total.
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
        monthlyAmount: Math.round(subMonthly * 100) / 100,
        subscriptionIds: [s.id],
        savings: null,
      });
    }
  }

  // Priority: OVERLAP > CONCENTRATION > RENEWAL_SOON. Keep at most 5 signals.
  const rankedSignals = [
    ...overlapSignals,
    ...concentrationSignals,
    ...renewalSoonSignals,
  ].slice(0, 5);

  // Build categories view for AI: names + amounts per item, no IDs, sorted by monthly desc
  const categories: CategoryDetail[] = Array.from(catMap.entries())
    .map(([category, { total, subs: catSubs }]) => ({
      category,
      monthly: Math.round(total * 100) / 100,
      share: monthlyTotal > 0 ? Math.round((total / monthlyTotal) * 100) : 0,
      items: catSubs
        .map((s) => ({
          name: s.name,
          monthly: Math.round(toMonthly(Number(s.amount), s.billingCycle) * 100) / 100,
        }))
        .sort((a, b) => b.monthly - a.monthly),
    }))
    .sort((a, b) => b.monthly - a.monthly);

  return {
    monthlyTotal,
    yearlyTotal,
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

  const { monthlyTotal, yearlyTotal, byCategory, categories, signals } = computeSignals(subs);

  const facts: InsightFacts = {
    activeCount: subs.length,
    monthlyTotal,
    yearlyTotal,
    byCategory,
    categories,
    signals,
  };

  const dataHash = createHash("sha256")
    .update(JSON.stringify(facts))
    .digest("hex");

  return { ...facts, dataHash };
}
