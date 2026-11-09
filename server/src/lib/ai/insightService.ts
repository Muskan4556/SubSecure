import prisma from "../prisma";
import { buildFacts } from "./factsBuilder";
import { callGemini, AiError } from "./geminiWrapper";
import { getDailyCount, incrementDailyCount } from "./dailyCounter";
import type { InsightFactsWithHash, InsightSignal, SignalSavings } from "./factsBuilder";
import type { RawAiInsightItem } from "./insightSchema";

const AI_ENABLED = process.env.AI_ENABLED !== "false";
const DAILY_LIMIT = Number(process.env.AI_DAILY_REQUEST_LIMIT ?? 12);
const USER_DAILY_LIMIT = Number(process.env.USER_DAILY_REFRESH_LIMIT ?? 2);
export const MAX_MANUAL_REFRESHES = Math.max(1, USER_DAILY_LIMIT - 1);
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function todayDateString(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Los_Angeles",
  });
}

/** Convert "CLOUD_STORAGE" → "Cloud Storage", "ENTERTAINMENT" → "Entertainment" */
export function toTitleCase(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export interface MergedInsight {
  signalId: string | null;
  title: string;
  detail: string;
  subscriptionIds: string[];
  savings: SignalSavings | null;
}

export interface InsightResult {
  /** Code-built headline: "₹2,322/mo · ₹27,860/yr · 5 subscriptions" */
  statLine: string;
  /** Single list of 3-4 insight items */
  insights: MergedInsight[];
  aiGenerated: boolean;
  cached: boolean;
  updatedAt: string;
  refreshesLeft: number;
  dataHash: string;
  /** Why rule summary was used instead of AI — present only when aiGenerated=false */
  fallbackReason?: string;
}

/** Build the stat line in code — never from AI */
export function buildStatLine(facts: InsightFactsWithHash): string {
  const mo = facts.monthlyTotal.toLocaleString("en-IN");
  const yr = facts.yearlyTotal.toLocaleString("en-IN");
  const n = facts.activeCount;
  return `₹${mo}/mo · ₹${yr}/yr · ${n} subscription${n !== 1 ? "s" : ""}`;
}

/**
 * Merge raw insights from AI with code signals:
 * Attach subscriptionIds and savings when signalId matches.
 * Drop unknown signalIds to null, keep the item.
 */
export function mergeInsights(
  rawInsights: RawAiInsightItem[],
  signals: InsightSignal[],
): MergedInsight[] {
  const signalMap = new Map(signals.map((s) => [s.id, s]));
  const merged: MergedInsight[] = [];

  for (const raw of rawInsights) {
    const signal = raw.signalId ? signalMap.get(raw.signalId) : undefined;
    merged.push({
      signalId: signal ? signal.id : null,
      title: raw.title.slice(0, 60),
      detail: raw.detail.slice(0, 180),
      subscriptionIds: signal ? signal.subscriptionIds : [],
      savings: signal ? signal.savings : null,
    });
  }

  return merged.slice(0, 4);
}

/**
 * Build rule-based insights using templates for signals.
 * Fallback when AI is unavailable or quota reached.
 */
export function buildFallbackInsights(facts: InsightFactsWithHash): MergedInsight[] {
  const insights: MergedInsight[] = [];

  for (const sig of facts.signals.slice(0, 4)) {
    if (sig.type === "OVERLAP") {
      const names = sig.names && sig.names.length > 0 ? sig.names : ["Subscriptions"];
      const prefix = names.length === 2 ? "Two" : String(names.length);
      const catLabel = toTitleCase(sig.category ?? "Streaming");
      const title = `${prefix} ${catLabel.toLowerCase()} services: ${names.join(" + ")}`.slice(0, 60);
      const sum = sig.combinedMonthly?.toLocaleString("en-IN") ?? "0";
      const yr = sig.yearly?.toLocaleString("en-IN") ?? "0";
      const detail = `Together ₹${sum}/mo (₹${yr}/yr). Do you use ${names.length === 2 ? "both" : "all of them"}?`.slice(0, 180);

      insights.push({
        signalId: sig.id,
        title,
        detail,
        subscriptionIds: sig.subscriptionIds,
        savings: sig.savings,
      });
    } else if (sig.type === "CLUSTER") {
      const count = sig.count ?? sig.names?.length ?? 3;
      const title = `${count} renewals on ${sig.date}`.slice(0, 60);
      const total = sig.total?.toLocaleString("en-IN") ?? "0";
      const detail = `₹${total} leaves your account that day. Make sure it is covered.`.slice(0, 180);

      insights.push({
        signalId: sig.id,
        title,
        detail,
        subscriptionIds: sig.subscriptionIds,
        savings: null,
      });
    } else if (sig.type === "CONCENTRATION") {
      const name = sig.subjectName ? toTitleCase(sig.subjectName) : "One service";
      const title = `${name} is ${sig.share}% of your bill`.slice(0, 60);
      const mo = sig.monthlyAmount?.toLocaleString("en-IN") ?? "0";
      const yr = sig.yearly?.toLocaleString("en-IN") ?? "0";
      const detail = `Costs ₹${mo}/mo (₹${yr}/yr). Is the plan size right for you?`.slice(0, 180);

      insights.push({
        signalId: sig.id,
        title,
        detail,
        subscriptionIds: sig.subscriptionIds,
        savings: null,
      });
    } else if (sig.type === "RENEWAL_SOON") {
      const name = sig.subjectName ?? "A subscription";
      const title = `${name} renews on ${sig.date}`.slice(0, 60);
      const mo = sig.monthlyAmount?.toLocaleString("en-IN") ?? "0";
      const detail = `₹${mo} due soon (~₹${sig.perDay}/day). Still actively using it?`.slice(0, 180);

      insights.push({
        signalId: sig.id,
        title,
        detail,
        subscriptionIds: sig.subscriptionIds,
        savings: null,
      });
    }
  }

  // Add top category or overall spend if fewer than 2 insights
  if (insights.length < 2 && facts.categories.length > 0) {
    const topCat = facts.categories[0];
    if (topCat && !insights.some((i) => i.title.toLowerCase().includes(topCat.category.toLowerCase()))) {
      const catLabel = toTitleCase(topCat.category);
      insights.push({
        signalId: null,
        title: `${catLabel} is ${topCat.share}% of your spend`.slice(0, 60),
        detail: `₹${topCat.monthly.toLocaleString("en-IN")}/mo across ${topCat.items.length} service${topCat.items.length > 1 ? "s" : ""}.`.slice(0, 180),
        subscriptionIds: [],
        savings: null,
      });
    }
  }

  if (insights.length === 0 && facts.activeCount > 0) {
    insights.push({
      signalId: null,
      title: `${facts.activeCount} active subscriptions`.slice(0, 60),
      detail: `Total spend is ₹${facts.monthlyTotal.toLocaleString("en-IN")}/mo (₹${facts.yearlyTotal.toLocaleString("en-IN")}/yr, ~₹${facts.perDayTotal}/day).`.slice(0, 180),
      subscriptionIds: [],
      savings: null,
    });
  }

  return insights.slice(0, 4);
}

export function buildFallbackResult(
  facts: InsightFactsWithHash,
  refreshesLeft: number,
  updatedAt: string = new Date().toISOString(),
  fallbackReason?: string,
): InsightResult {
  if (fallbackReason) {
    console.info(`[AI Insights] Using rule summary — reason: ${fallbackReason}`);
  }
  const base: InsightResult = {
    statLine: buildStatLine(facts),
    insights: facts.activeCount < 2 ? [] : buildFallbackInsights(facts),
    aiGenerated: false,
    cached: false,
    updatedAt,
    refreshesLeft,
    dataHash: facts.dataHash,
  };
  if (fallbackReason !== undefined) base.fallbackReason = fallbackReason;
  return base;
}

/** Detect if cached content is old schema (points/tips or summary/highlights) */
function isOldFormat(content: Record<string, unknown>): boolean {
  return (
    !Array.isArray(content.insights) ||
    typeof content.summary === "string" ||
    Array.isArray(content.points)
  );
}

export async function getInsights(userId: string): Promise<InsightResult> {
  const facts = await buildFacts(userId);

  const cached = await prisma.aiInsight.findUnique({ where: { userId } });
  const today = todayDateString();
  const cachedContent = (cached?.content as Record<string, unknown>) ?? {};
  const isToday = cachedContent.date === today;
  const autoGenerationsToday = isToday ? Number(cachedContent.autoGenerationsToday ?? 0) : 0;
  const manualRefreshesToday = isToday ? Number(cachedContent.manualRefreshesToday ?? 0) : 0;

  const globalCount = await getDailyCount();
  const refreshesLeft = globalCount >= DAILY_LIMIT
    ? 0
    : Math.max(0, MAX_MANUAL_REFRESHES - manualRefreshesToday);

  // Return cached result if fresh, dataHash matches, new format, AND it was actually AI-generated
  if (cached && cached.aiGenerated && !isOldFormat(cachedContent)) {
    const age = Date.now() - cached.updatedAt.getTime();
    if (cached.dataHash === facts.dataHash && age < CACHE_TTL_MS) {
      const cachedInsights = cachedContent.insights as MergedInsight[] | undefined;
      return {
        statLine: buildStatLine(facts),
        insights:
          Array.isArray(cachedInsights) && cachedInsights.length > 0
            ? cachedInsights
            : buildFallbackInsights(facts),
        aiGenerated: true,
        cached: true,
        updatedAt: cached.updatedAt.toISOString(),
        refreshesLeft,
        dataHash: facts.dataHash,
      };
    }
  }

  // Skip AI call if fewer than 2 active subscriptions or no signals
  if (facts.activeCount < 2 || facts.signals.length === 0) {
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), "no_signals");
  }

  if (!AI_ENABLED) {
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), "ai_disabled");
  }

  // Per user: max 1 automatic AI generation per day
  if (autoGenerationsToday >= 1) {
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), "user_limit");
  }

  // App-wide daily cap
  if (globalCount >= DAILY_LIMIT) {
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), "quota_cap");
  }

  // Count every attempt against cap, including failures
  await incrementDailyCount();

  try {
    const aiResult = await callGemini(facts);
    const mergedInsights = mergeInsights(aiResult.insights, facts.signals);

    const result: InsightResult = {
      statLine: buildStatLine(facts),
      insights: mergedInsights,
      aiGenerated: true,
      cached: false,
      updatedAt: new Date().toISOString(),
      refreshesLeft,
      dataHash: facts.dataHash,
    };

    const persistedContent = {
      ...result,
      date: today,
      autoGenerationsToday: 1,
      manualRefreshesToday,
    };

    await prisma.aiInsight.upsert({
      where: { userId },
      update: {
        dataHash: facts.dataHash,
        content: persistedContent as unknown as object,
        aiGenerated: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        dataHash: facts.dataHash,
        content: persistedContent as unknown as object,
        aiGenerated: true,
      },
    });

    return result;
  } catch (err) {
    const reason = err instanceof AiError ? err.reason : "provider_error";
    console.error(`[AI Insights] AI call failed (${reason}):`, (err as Error).message);
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), reason);
  }
}

export async function refreshInsights(userId: string): Promise<InsightResult> {
  const facts = await buildFacts(userId);

  const cached = await prisma.aiInsight.findUnique({ where: { userId } });
  const today = todayDateString();
  const cachedContent = (cached?.content as Record<string, unknown>) ?? {};
  const isToday = cachedContent.date === today;
  const autoGenerationsToday = isToday ? Number(cachedContent.autoGenerationsToday ?? 0) : 0;
  const manualRefreshesToday = isToday ? Number(cachedContent.manualRefreshesToday ?? 0) : 0;

  const globalCount = await getDailyCount();
  const refreshesLeft = globalCount >= DAILY_LIMIT
    ? 0
    : Math.max(0, MAX_MANUAL_REFRESHES - manualRefreshesToday);

  // Per user: max manual refreshes per day
  if (manualRefreshesToday >= MAX_MANUAL_REFRESHES || refreshesLeft === 0) {
    if (cached && cached.aiGenerated && !isOldFormat(cachedContent)) {
      const cachedInsights = cachedContent.insights as MergedInsight[] | undefined;
      return {
        statLine: buildStatLine(facts),
        insights:
          Array.isArray(cachedInsights) && cachedInsights.length > 0
            ? cachedInsights
            : buildFallbackInsights(facts),
        aiGenerated: true,
        cached: true,
        updatedAt: cached.updatedAt.toISOString(),
        refreshesLeft: 0,
        dataHash: facts.dataHash,
      };
    }
    return buildFallbackResult(facts, 0, new Date().toISOString(), globalCount >= DAILY_LIMIT ? "quota_cap" : "user_limit");
  }

  if (facts.activeCount < 2 || facts.signals.length === 0) {
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), "no_signals");
  }

  if (!AI_ENABLED) {
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), "ai_disabled");
  }

  if (globalCount >= DAILY_LIMIT) {
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), "quota_cap");
  }

  // Count every attempt
  await incrementDailyCount();

  try {
    const aiResult = await callGemini(facts);
    const mergedInsights = mergeInsights(aiResult.insights, facts.signals);
    const newManualRefreshes = manualRefreshesToday + 1;
    const remainingRefreshes = Math.max(0, MAX_MANUAL_REFRESHES - newManualRefreshes);

    const result: InsightResult = {
      statLine: buildStatLine(facts),
      insights: mergedInsights,
      aiGenerated: true,
      cached: false,
      updatedAt: new Date().toISOString(),
      refreshesLeft: remainingRefreshes,
      dataHash: facts.dataHash,
    };

    const persistedContent = {
      ...result,
      date: today,
      autoGenerationsToday,
      manualRefreshesToday: newManualRefreshes,
    };

    await prisma.aiInsight.upsert({
      where: { userId },
      update: {
        dataHash: facts.dataHash,
        content: persistedContent as unknown as object,
        aiGenerated: true,
        lastRefreshAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId,
        dataHash: facts.dataHash,
        content: persistedContent as unknown as object,
        aiGenerated: true,
      },
    });

    return result;
  } catch (err) {
    const reason = err instanceof AiError ? err.reason : "provider_error";
    console.error(`[AI Insights] Refresh AI call failed (${reason}):`, (err as Error).message);
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), reason);
  }
}
