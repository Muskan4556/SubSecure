import prisma from "../prisma";
import { buildFacts } from "./factsBuilder";
import { callGemini, AiError } from "./geminiWrapper";
import { getDailyCount, incrementDailyCount } from "./dailyCounter";
import type { InsightFactsWithHash, InsightSignal, SignalSavings } from "./factsBuilder";

const AI_ENABLED = process.env.AI_ENABLED !== "false";
const DAILY_LIMIT = Number(process.env.AI_DAILY_REQUEST_LIMIT ?? 12);
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

function formatRenewalDate(isoDate?: string): string {
  if (!isoDate) return "soon";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); // e.g. "1 Dec"
}

export interface MergedTip {
  signalId: string;
  reason: string;
  subscriptionIds: string[];
  savings: SignalSavings | null;
}

export interface InsightResult {
  /** Code-built headline: "₹2,322/mo · ₹27,860/yr · 5 subscriptions" */
  statLine: string;
  /** AI or rule-based scannable bullet points */
  points: string[];
  tips: MergedTip[];
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

export function mergeTips(
  rawTips: Array<{ signalId: string; reason: string }>,
  signals: InsightSignal[],
): MergedTip[] {
  const signalMap = new Map(signals.map((s) => [s.id, s]));
  const merged: MergedTip[] = [];

  for (const raw of rawTips) {
    const signal = signalMap.get(raw.signalId);
    if (!signal) {
      console.warn(`[AI Insights] Dropping tip with unknown signalId: ${raw.signalId}`);
      continue;
    }
    merged.push({
      signalId: signal.id,
      reason: raw.reason,
      subscriptionIds: signal.subscriptionIds,
      savings: signal.savings,
    });
  }

  return merged.slice(0, 3);
}

/**
 * Build rule-based bullet points from facts.
 * Includes: (a) every overlap group, (b) any single sub or category with share >= 30%,
 * (c) a total fallback line if fewer than 2 points qualify. Max 4 points.
 */
export function buildFallbackPoints(facts: InsightFactsWithHash): string[] {
  const points: string[] = [];
  const coveredCategories = new Set<string>();

  // (a) Overlap groups — always include, one point per group
  for (const sig of facts.signals) {
    if (sig.type !== "OVERLAP" || points.length >= 4) continue;
    const catLabel = toTitleCase(sig.category ?? "");
    const names = (sig.names ?? []).join(" + ");
    const catDetail = facts.categories.find((c) => c.category === sig.category);
    const share = catDetail?.share ?? 0;
    const combined = sig.combinedMonthly?.toLocaleString("en-IN") ?? "";
    const p = `${names} = ₹${combined}/mo in ${catLabel} (${share}% of your bill)`;
    points.push(p.slice(0, 120));
    if (sig.category) coveredCategories.add(sig.category);
  }

  // (b) Single subscription or category with share >= 30%, not already covered
  for (const cat of facts.categories) {
    if (points.length >= 4) break;
    if (coveredCategories.has(cat.category)) continue;
    if (cat.share < 30) continue; // skip low-share items (e.g. Github at 16%)

    const catLabel = toTitleCase(cat.category);
    let p: string;
    if (cat.items.length >= 2) {
      const names = cat.items.map((i) => i.name).join(" + ");
      p = `${names} = ₹${cat.monthly.toLocaleString("en-IN")}/mo in ${catLabel} (${cat.share}% of your bill)`;
    } else if (cat.items[0]) {
      p = `${cat.items[0].name}: ₹${cat.monthly.toLocaleString("en-IN")}/mo — ${catLabel} at ${cat.share}% of your bill`;
    } else {
      continue;
    }
    points.push(p.slice(0, 120));
    coveredCategories.add(cat.category);
  }

  // (c) Total fallback if fewer than 2 points qualify
  if (points.length < 2 && facts.activeCount > 0) {
    points.push(
      `₹${facts.monthlyTotal.toLocaleString("en-IN")}/mo across ${facts.activeCount} subscription${facts.activeCount !== 1 ? "s" : ""}`,
    );
  }

  return points.slice(0, 4);
}

/** Build rule-based tips from signals with question-style templates */
export function buildFallbackTips(signals: InsightSignal[]): MergedTip[] {
  return signals.slice(0, 3).map((sig) => {
    let reason = "";

    if (sig.type === "OVERLAP") {
      const names = sig.names && sig.names.length > 0 ? sig.names : ["these services"];
      if (names.length === 2) {
        reason = `You pay for ${names[0]} and ${names[1]}. Do you use both?`;
      } else {
        reason = `You pay for ${names.join(", ")}. Do you use all of them?`;
      }
    } else if (sig.type === "CONCENTRATION") {
      // "concentration-sub-{uuid}" is subscription-level; "concentration-{CATEGORY}" is category-level
      const isCategoryLevel =
        sig.id.startsWith("concentration-") && !sig.id.startsWith("concentration-sub-");
      const name = isCategoryLevel
        ? toTitleCase(sig.subjectName ?? "")
        : (sig.subjectName ?? "This subscription");
      reason = `${name} is ${sig.share}% of your bill. Is the plan size right for you?`;
    } else if (sig.type === "RENEWAL_SOON") {
      const name = sig.subjectName ?? "A subscription";
      const date = formatRenewalDate(sig.renewalDate);
      const amount = sig.monthlyAmount
        ? `₹${sig.monthlyAmount.toLocaleString("en-IN")}`
        : "";
      reason = amount
        ? `${name} renews on ${date} (${amount}). Still using it?`
        : `${name} renews on ${date}. Still using it?`;
    } else {
      reason = "Review your subscription to optimize spending.";
    }

    if (reason.length > 120) reason = reason.slice(0, 117) + "...";

    return {
      signalId: sig.id,
      reason,
      subscriptionIds: sig.subscriptionIds,
      savings: sig.savings,
    };
  });
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
    points: facts.activeCount < 2 ? [] : buildFallbackPoints(facts),
    tips: facts.activeCount < 2 ? [] : buildFallbackTips(facts.signals),
    aiGenerated: false,
    cached: false,
    updatedAt,
    refreshesLeft,
    dataHash: facts.dataHash,
  };
  if (fallbackReason !== undefined) base.fallbackReason = fallbackReason;
  return base;
}

/** Detect if cached content is old schema (had summary/highlights/suggestions, no points) */
function isOldFormat(content: Record<string, unknown>): boolean {
  return (
    typeof content.summary === "string" &&
    !Array.isArray(content.points) &&
    (Array.isArray(content.highlights) || Array.isArray(content.suggestions))
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
  const refreshesLeft = Math.max(0, 1 - manualRefreshesToday);

  // Return cached result if fresh, dataHash matches, new format, AND it was actually AI-generated
  if (cached && cached.aiGenerated && !isOldFormat(cachedContent)) {
    const age = Date.now() - cached.updatedAt.getTime();
    if (cached.dataHash === facts.dataHash && age < CACHE_TTL_MS) {
      const cachedPoints = cachedContent.points as string[] | undefined;
      const cachedTips = cachedContent.tips as MergedTip[] | undefined;
      return {
        statLine: buildStatLine(facts),
        points:
          Array.isArray(cachedPoints) && cachedPoints.length > 0
            ? cachedPoints
            : buildFallbackPoints(facts),
        tips: Array.isArray(cachedTips) ? cachedTips : [],
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
  const count = await getDailyCount();
  if (count >= DAILY_LIMIT) {
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), "quota_cap");
  }

  // Count every attempt against cap, including failures
  await incrementDailyCount();

  try {
    const aiResult = await callGemini(facts);
    const mergedTips = mergeTips(aiResult.tips, facts.signals);

    const result: InsightResult = {
      statLine: buildStatLine(facts),
      points: aiResult.points,
      tips: mergedTips,
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
  const refreshesLeft = Math.max(0, 1 - manualRefreshesToday);

  // Per user: max 1 manual refresh per day
  if (manualRefreshesToday >= 1) {
    // If the user already used their manual refresh today, return the cached result if available
    if (cached && cached.aiGenerated && !isOldFormat(cachedContent)) {
      const cachedPoints = cachedContent.points as string[] | undefined;
      const cachedTips = cachedContent.tips as MergedTip[] | undefined;
      return {
        statLine: buildStatLine(facts),
        points:
          Array.isArray(cachedPoints) && cachedPoints.length > 0
            ? cachedPoints
            : buildFallbackPoints(facts),
        tips: Array.isArray(cachedTips) ? cachedTips : [],
        aiGenerated: true,
        cached: true,
        updatedAt: cached.updatedAt.toISOString(),
        refreshesLeft: 0,
        dataHash: facts.dataHash,
      };
    }
    return buildFallbackResult(facts, 0, new Date().toISOString(), "user_limit");
  }

  if (facts.activeCount < 2 || facts.signals.length === 0) {
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), "no_signals");
  }

  if (!AI_ENABLED) {
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), "ai_disabled");
  }

  const count = await getDailyCount();
  if (count >= DAILY_LIMIT) {
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), "quota_cap");
  }

  // Count every attempt
  await incrementDailyCount();

  try {
    const aiResult = await callGemini(facts);
    const mergedTips = mergeTips(aiResult.tips, facts.signals);
    const newManualRefreshes = manualRefreshesToday + 1;

    const result: InsightResult = {
      statLine: buildStatLine(facts),
      points: aiResult.points,
      tips: mergedTips,
      aiGenerated: true,
      cached: false,
      updatedAt: new Date().toISOString(),
      refreshesLeft: 0,
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
    // Failed calls do not count against the user limit, so refreshesLeft remains unchanged
    return buildFallbackResult(facts, refreshesLeft, new Date().toISOString(), reason);
  }
}
