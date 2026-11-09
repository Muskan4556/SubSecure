import test from "node:test";
import assert from "node:assert/strict";
import { BillingCycle } from "@prisma/client";
import { detectCategory } from "../lib/categorization/rules";
import { validateAiConfig } from "../lib/ai/configValidator";
import { insightResponseSchema } from "../lib/ai/insightSchema";
import {
  computeSignals,
  toMonthly,
  type SubscriptionInput,
  type InsightSignal,
} from "../lib/ai/factsBuilder";
import {
  mergeTips,
  buildFallbackTips,
  buildFallbackPoints,
} from "../lib/ai/insightService";

test("Rule Categorizer - maps known services accurately", () => {
  assert.equal(detectCategory("Netflix"), "ENTERTAINMENT");
  assert.equal(detectCategory("Disney+ Hotstar"), "ENTERTAINMENT");
  assert.equal(detectCategory("Spotify Premium"), "MUSIC");
  assert.equal(detectCategory("Apple Music"), "MUSIC");
  assert.equal(detectCategory("Notion Team"), "PRODUCTIVITY");
  assert.equal(detectCategory("Slack Pro"), "PRODUCTIVITY");
  assert.equal(detectCategory("Dropbox Plus"), "CLOUD_STORAGE");
  assert.equal(detectCategory("Google One 100GB"), "CLOUD_STORAGE");
  assert.equal(detectCategory("GitHub Copilot"), "DEVELOPMENT");
  assert.equal(detectCategory("Figma Professional"), "DEVELOPMENT");
  assert.equal(detectCategory("Duolingo Super"), "EDUCATION");
  assert.equal(detectCategory("New York Times All Access"), "NEWS_READING");
  assert.equal(detectCategory("Xbox Game Pass Ultimate"), "GAMING");
  assert.equal(detectCategory("Headspace Yearly"), "HEALTH_FITNESS");
  assert.equal(detectCategory("1Password Family"), "UTILITIES");
  assert.equal(detectCategory("Zerodha Kite"), "FINANCE");
});

test("Rule Categorizer - defaults unknown service to OTHER", () => {
  assert.equal(detectCategory("Random Unknown SaaS 123"), "OTHER");
  assert.equal(detectCategory("My Custom App"), "OTHER");
});

test("Config Validator - enforces AI_ALLOW_PAID_FALLBACK=false", () => {
  const origAllow = process.env.AI_ALLOW_PAID_FALLBACK;
  const origModel = process.env.AI_MODEL;
  const origAllowed = process.env.AI_ALLOWED_MODELS;

  try {
    process.env.AI_ALLOW_PAID_FALLBACK = "true";
    assert.throws(
      () => validateAiConfig(),
      /AI_ALLOW_PAID_FALLBACK must be "false"/,
    );

    process.env.AI_ALLOW_PAID_FALLBACK = "false";
    process.env.AI_MODEL = "unapproved-gpt-model";
    process.env.AI_ALLOWED_MODELS = "gemini-3.8-flash";
    assert.throws(() => validateAiConfig(), /is not in AI_ALLOWED_MODELS/);

    // Valid configuration must not throw
    process.env.AI_ALLOW_PAID_FALLBACK = "false";
    process.env.AI_MODEL = "gemini-3.8-flash";
    process.env.AI_ALLOWED_MODELS = "gemini-3.8-flash";
    assert.doesNotThrow(() => validateAiConfig());
  } finally {
    process.env.AI_ALLOW_PAID_FALLBACK = origAllow;
    process.env.AI_MODEL = origModel;
    process.env.AI_ALLOWED_MODELS = origAllowed;
  }
});

test("Insight Schema - validates new contract with points and tips", () => {
  const valid = {
    points: [
      "Netflix + Prime = ₹948/mo in Entertainment, 41% of your bill",
      "Notion: ₹800/mo — Productivity at 35% of your bill",
    ],
    tips: [
      {
        signalId: "overlap-ENTERTAINMENT",
        reason: "Both are streaming. Do you use both?",
      },
    ],
  };

  const parsed = insightResponseSchema.safeParse(valid);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.points.length, 2);
    assert.equal(parsed.data.tips.length, 1);
  }
});

test("Insight Schema - rejects missing points or reason > 120", () => {
  // Missing points array
  const missingPoints = {
    tips: [],
  };
  assert.equal(insightResponseSchema.safeParse(missingPoints).success, false);

  // reason > 120 chars
  const tooLongReason = {
    points: ["Valid point"],
    tips: [{ signalId: "sig_1", reason: "B".repeat(121) }],
  };
  assert.equal(insightResponseSchema.safeParse(tooLongReason).success, false);

  // point > 120 chars
  const tooLongPoint = {
    points: ["A".repeat(121)],
    tips: [],
  };
  assert.equal(insightResponseSchema.safeParse(tooLongPoint).success, false);

  // too many tips
  const tooManyTips = {
    points: ["Valid point"],
    tips: [
      { signalId: "s1", reason: "r1" },
      { signalId: "s2", reason: "r2" },
      { signalId: "s3", reason: "r3" },
      { signalId: "s4", reason: "r4" },
    ],
  };
  assert.equal(insightResponseSchema.safeParse(tooManyTips).success, false);
});

test("Signal Builder - creates OVERLAP only for ENTERTAINMENT, MUSIC, CLOUD_STORAGE", () => {
  const now = new Date("2026-11-09T00:00:00Z");
  const subs: SubscriptionInput[] = [
    // Entertainment overlap (2 subs)
    {
      id: "sub_1",
      name: "Netflix",
      amount: 499,
      billingCycle: BillingCycle.MONTHLY,
      category: "ENTERTAINMENT",
      renewalDate: new Date("2026-12-01T00:00:00Z"),
    },
    {
      id: "sub_2",
      name: "Amazon Prime",
      amount: 299,
      billingCycle: BillingCycle.MONTHLY,
      category: "ENTERTAINMENT",
      renewalDate: new Date("2026-12-05T00:00:00Z"),
    },
    // Productivity (2 subs - must NOT create overlap)
    {
      id: "sub_3",
      name: "Notion",
      amount: 800,
      billingCycle: BillingCycle.MONTHLY,
      category: "PRODUCTIVITY",
      renewalDate: new Date("2026-12-10T00:00:00Z"),
    },
    {
      id: "sub_4",
      name: "Slack",
      amount: 600,
      billingCycle: BillingCycle.MONTHLY,
      category: "PRODUCTIVITY",
      renewalDate: new Date("2026-12-15T00:00:00Z"),
    },
    // Development (2 subs - must NOT create overlap)
    {
      id: "sub_5",
      name: "GitHub",
      amount: 400,
      billingCycle: BillingCycle.MONTHLY,
      category: "DEVELOPMENT",
      renewalDate: new Date("2026-12-20T00:00:00Z"),
    },
    {
      id: "sub_6",
      name: "Cursor",
      amount: 1600,
      billingCycle: BillingCycle.MONTHLY,
      category: "DEVELOPMENT",
      renewalDate: new Date("2026-12-25T00:00:00Z"),
    },
  ];

  const { signals } = computeSignals(subs, now);

  const overlapSignals = signals.filter((s) => s.type === "OVERLAP");
  assert.equal(overlapSignals.length, 1);
  assert.equal(overlapSignals[0]!.id, "overlap-ENTERTAINMENT");
  assert.equal(overlapSignals[0]!.savings?.monthlyMin, 299);
  assert.equal(overlapSignals[0]!.savings?.monthlyMax, 499);
  assert.equal(overlapSignals[0]!.savings?.yearlyMin, 299 * 12);
  assert.equal(overlapSignals[0]!.savings?.yearlyMax, 499 * 12);

  // Ensure NO productivity or development overlap
  assert.equal(
    signals.some((s) => s.id === "overlap-PRODUCTIVITY"),
    false,
  );
  assert.equal(
    signals.some((s) => s.id === "overlap-DEVELOPMENT"),
    false,
  );
});

test("Signal Builder - normalizes yearly plans to monthly for savings & total", () => {
  const now = new Date("2026-11-09T00:00:00Z");
  const subs: SubscriptionInput[] = [
    {
      id: "cloud_1",
      name: "Google One Yearly",
      amount: 1200, // ₹1,200/yr = ₹100/mo
      billingCycle: BillingCycle.YEARLY,
      category: "CLOUD_STORAGE",
      renewalDate: new Date("2026-12-01T00:00:00Z"),
    },
    {
      id: "cloud_2",
      name: "Dropbox Monthly",
      amount: 800, // ₹800/mo
      billingCycle: BillingCycle.MONTHLY,
      category: "CLOUD_STORAGE",
      renewalDate: new Date("2026-12-05T00:00:00Z"),
    },
  ];

  const { monthlyTotal, yearlyTotal, signals } = computeSignals(subs, now);
  assert.equal(monthlyTotal, 900); // 100 + 800
  assert.equal(yearlyTotal, 10800);

  const overlap = signals.find((s) => s.id === "overlap-CLOUD_STORAGE");
  assert.ok(overlap);
  assert.equal(overlap?.savings?.monthlyMin, 100);
  assert.equal(overlap?.savings?.monthlyMax, 800);
  assert.equal(overlap?.savings?.yearlyMin, 1200);
  assert.equal(overlap?.savings?.yearlyMax, 9600);
});

test("Signal Builder - enforces CONCENTRATION and RENEWAL_SOON thresholds", () => {
  const now = new Date("2026-11-09T00:00:00Z");
  // Total spend = 1000.
  // Sub 1 = 600 (60% category, 60% sub) -> concentration
  // Sub 2 = 250 (25% sub, renews in 3 days) -> renewal soon (<= 7 days and >= 20%)
  // Sub 3 = 150 (15% sub, renews in 2 days) -> NOT renewal soon (< 20%)
  const subs: SubscriptionInput[] = [
    {
      id: "sub_big",
      name: "Enterprise Tool",
      amount: 600,
      billingCycle: BillingCycle.MONTHLY,
      category: "PRODUCTIVITY",
      renewalDate: new Date("2026-11-25T00:00:00Z"),
    },
    {
      id: "sub_urgent",
      name: "Cloud Pro",
      amount: 250,
      billingCycle: BillingCycle.MONTHLY,
      category: "UTILITIES",
      renewalDate: new Date("2026-11-12T00:00:00Z"), // 3 days from now
    },
    {
      id: "sub_small_urgent",
      name: "Small Addon",
      amount: 150,
      billingCycle: BillingCycle.MONTHLY,
      category: "OTHER",
      renewalDate: new Date("2026-11-11T00:00:00Z"), // 2 days from now, but 15% < 20%
    },
  ];

  const { signals } = computeSignals(subs, now);

  const concentration = signals.filter((s) => s.type === "CONCENTRATION");
  assert.ok(concentration.length > 0);
  assert.equal(concentration.every((c) => c.savings === null), true);

  const renewalSignals = signals.filter((s) => s.type === "RENEWAL_SOON");
  assert.equal(renewalSignals.length, 1);
  assert.equal(renewalSignals[0]!.id, "renewal-sub_urgent");
  assert.equal(renewalSignals[0]!.savings, null);
});

test("Signal Builder - priority ordering and cap at 5 signals", () => {
  const now = new Date("2026-11-09T00:00:00Z");
  const subs: SubscriptionInput[] = [
    {
      id: "e1",
      name: "Netflix",
      amount: 500,
      billingCycle: BillingCycle.MONTHLY,
      category: "ENTERTAINMENT",
      renewalDate: new Date("2026-11-12T00:00:00Z"),
    },
    {
      id: "e2",
      name: "Prime",
      amount: 500,
      billingCycle: BillingCycle.MONTHLY,
      category: "ENTERTAINMENT",
      renewalDate: new Date("2026-11-13T00:00:00Z"),
    },
    {
      id: "m1",
      name: "Spotify",
      amount: 200,
      billingCycle: BillingCycle.MONTHLY,
      category: "MUSIC",
      renewalDate: new Date("2026-11-14T00:00:00Z"),
    },
    {
      id: "m2",
      name: "Apple Music",
      amount: 200,
      billingCycle: BillingCycle.MONTHLY,
      category: "MUSIC",
      renewalDate: new Date("2026-11-15T00:00:00Z"),
    },
    {
      id: "c1",
      name: "Dropbox",
      amount: 300,
      billingCycle: BillingCycle.MONTHLY,
      category: "CLOUD_STORAGE",
      renewalDate: new Date("2026-11-14T00:00:00Z"),
    },
    {
      id: "c2",
      name: "Google One",
      amount: 300,
      billingCycle: BillingCycle.MONTHLY,
      category: "CLOUD_STORAGE",
      renewalDate: new Date("2026-11-15T00:00:00Z"),
    },
  ];

  const { signals } = computeSignals(subs, now);
  assert.ok(signals.length <= 5);
  // OVERLAP signals must be prioritized first
  assert.equal(signals[0]!.type, "OVERLAP");
  assert.equal(signals[1]!.type, "OVERLAP");
  assert.equal(signals[2]!.type, "OVERLAP");
});

test("Backend Tip Merge - drops unknown signalIds and attaches code savings", () => {
  const signals: InsightSignal[] = [
    {
      id: "overlap-ENTERTAINMENT",
      type: "OVERLAP",
      subscriptionIds: ["sub_1", "sub_2"],
      names: ["Netflix", "Prime"],
      savings: {
        monthlyMin: 299,
        monthlyMax: 499,
        yearlyMin: 3588,
        yearlyMax: 5988,
      },
    },
    {
      id: "concentration-PRODUCTIVITY",
      type: "CONCENTRATION",
      subjectName: "PRODUCTIVITY",
      subscriptionIds: ["sub_3"],
      savings: null,
    },
  ];

  const rawTipsFromAi = [
    {
      signalId: "overlap-ENTERTAINMENT",
      reason: "You pay for Netflix and Prime. Do you use both?",
    },
    {
      signalId: "fake-signal-hallucinated-by-ai",
      reason: "Cancel your gym membership right now.",
    },
    {
      signalId: "concentration-PRODUCTIVITY",
      reason: "Productivity makes up over half your monthly spend.",
    },
  ];

  const merged = mergeTips(rawTipsFromAi, signals);

  // Fake signal must be dropped
  assert.equal(merged.length, 2);
  assert.equal(merged[0]!.signalId, "overlap-ENTERTAINMENT");
  assert.deepEqual(merged[0]!.subscriptionIds, ["sub_1", "sub_2"]);
  assert.deepEqual(merged[0]!.savings, {
    monthlyMin: 299,
    monthlyMax: 499,
    yearlyMin: 3588,
    yearlyMax: 5988,
  });

  assert.equal(merged[1]!.signalId, "concentration-PRODUCTIVITY");
  assert.deepEqual(merged[1]!.subscriptionIds, ["sub_3"]);
  assert.equal(merged[1]!.savings, null);
});

test("Rule Fallback - produces valid tips using fixed templates", () => {
  const signals: InsightSignal[] = [
    {
      id: "overlap-MUSIC",
      type: "OVERLAP",
      subscriptionIds: ["m1", "m2"],
      names: ["Spotify", "Apple Music"],
      savings: {
        monthlyMin: 119,
        monthlyMax: 119,
        yearlyMin: 1428,
        yearlyMax: 1428,
      },
    },
  ];

  const fallbackTips = buildFallbackTips(signals);
  assert.equal(fallbackTips.length, 1);
  assert.equal(
    fallbackTips[0]!.reason,
    "You pay for Spotify and Apple Music. Do you use both?",
  );
  assert.deepEqual(fallbackTips[0]!.subscriptionIds, ["m1", "m2"]);
  assert.equal(fallbackTips[0]!.savings?.monthlyMin, 119);
});
