"use client";

import { useState, useMemo } from "react";
import {
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Info,
  TrendingDown,
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useInsights, useRefreshInsights } from "@/apis/ai/ai-api";
import { useSubscriptions } from "@/apis/subscriptions/subscriptions-api";
import type { SignalSavings } from "@/lib/types/ai-types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function InsightsSkeleton() {
  return (
    <div className="px-5 py-4 space-y-3">
      <Skeleton className="h-4 w-56 bg-white/5" />
      <div className="pt-1 space-y-2">
        <Skeleton className="h-3 w-full bg-white/5" />
        <Skeleton className="h-3 w-5/6 bg-white/5" />
        <Skeleton className="h-3 w-4/5 bg-white/5" />
      </div>
      <div className="pt-1 space-y-2">
        <Skeleton className="h-9 w-full bg-white/5" />
        <Skeleton className="h-9 w-full bg-white/5" />
      </div>
    </div>
  );
}

function formatTimeAgo(isoString?: string): string {
  if (!isoString) return "";
  const diff = Math.max(0, Date.now() - new Date(isoString).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatSavingsText(savings: SignalSavings): string {
  const fmtM = (n: number) => Math.round(n).toLocaleString("en-IN");
  const fmtY = (n: number) => Math.round(n).toLocaleString("en-IN");
  if (savings.monthlyMin === savings.monthlyMax) {
    return `Saves ₹${fmtM(savings.monthlyMin)}/month (₹${fmtY(savings.yearlyMin)}/year)`;
  }
  return `Saves ₹${fmtM(savings.monthlyMin)}–₹${fmtM(savings.monthlyMax)}/month (₹${fmtY(savings.yearlyMin)}–₹${fmtY(savings.yearlyMax)}/year)`;
}

export function InsightsCard() {
  const { data, isLoading, isError, refetch } = useInsights();
  const { mutate: doRefresh, isPending: isRefreshing } = useRefreshInsights();
  const { data: subsData } = useSubscriptions({ status: "ACTIVE" });

  const [showWhatIf, setShowWhatIf] = useState(false);
  const [selectedSubIds, setSelectedSubIds] = useState<Set<string>>(new Set());

  const insight = data?.data;
  const activeSubs = subsData?.data ?? [];

  // What-if calculations — all client-side, no API call
  const { savedMonthly, savedYearly, newMonthly, newYearly } = useMemo(() => {
    let savedM = 0;
    let totalM = 0;
    for (const s of activeSubs) {
      const mo = s.billingCycle === "YEARLY" ? Number(s.amount) / 12 : Number(s.amount);
      totalM += mo;
      if (selectedSubIds.has(s.id)) savedM += mo;
    }
    return {
      savedMonthly: savedM,
      savedYearly: savedM * 12,
      newMonthly: Math.max(0, totalM - savedM),
      newYearly: Math.max(0, (totalM - savedM) * 12),
    };
  }, [activeSubs, selectedSubIds]);

  function toggleSub(id: string) {
    setSelectedSubIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleRefresh() {
    if (insight?.refreshesLeft === 0) {
      toast.info("Next refresh tomorrow.");
      return;
    }
    doRefresh(undefined, {
      onSuccess: () => toast.success("Insights refreshed"),
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        toast.error(msg ?? "Could not refresh insights");
      },
    });
  }

  const isRefreshDisabled = isRefreshing || isLoading || insight?.refreshesLeft === 0;
  const hasTips = (insight?.tips?.length ?? 0) > 0;
  const hasPoints = (insight?.points?.length ?? 0) > 0;
  const isEmpty = !insight?.aiGenerated && !hasPoints && !hasTips;

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400/80" />
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
            AI Spending Insights
          </span>
          {insight && (
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                insight.aiGenerated
                  ? "bg-blue-500/10 text-blue-400/90 border-blue-500/20"
                  : "bg-white/6 text-white/40 border-white/10"
              }`}
            >
              {insight.aiGenerated ? "AI" : "rule summary"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {insight?.updatedAt && (
            <span className="text-[10px] font-mono text-white/30 hidden sm:inline">
              {formatTimeAgo(insight.updatedAt)}
            </span>
          )}

          {insight?.refreshesLeft === 1 && (
            <span className="text-[10px] font-mono text-white/40 bg-white/4 border border-white/10 px-2 py-0.5 rounded">
              1 refresh left
            </span>
          )}
          {insight?.refreshesLeft === 0 && (
            <span className="text-[10px] font-mono text-amber-400/80 bg-amber-400/10 border border-amber-400/25 px-2 py-0.5 rounded">
              Next refresh tomorrow
            </span>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshDisabled}
            title={
              insight?.refreshesLeft === 0
                ? "Next refresh tomorrow"
                : insight?.refreshesLeft === 1
                ? "1 refresh left today"
                : "Refresh insights"
            }
            className="p-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Refresh AI insights"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      {isLoading ? (
        <InsightsSkeleton />
      ) : isError ? (
        <div className="px-5 py-6 flex flex-col items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400/70" />
          <p className="text-[12px] font-mono text-white/40 text-center">
            Couldn&apos;t load insights right now.
          </p>
          <button
            onClick={() => refetch()}
            className="text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors"
          >
            Try again →
          </button>
        </div>
      ) : !insight ? (
        <div className="px-5 py-6">
          <p className="text-[12px] font-mono text-white/30 text-center">No insights available</p>
        </div>
      ) : isEmpty ? (
        /* ── Empty state: < 2 subs ── */
        <div className="px-5 py-6 flex flex-col items-center gap-2">
          <Info className="w-5 h-5 text-blue-400/50" />
          <p className="text-[12px] font-mono text-white/45 text-center leading-relaxed max-w-sm">
            {insight.statLine || "Add at least 2 active subscriptions to see spending insights."}
          </p>
          <Link
            href="/dashboard/subscriptions/new"
            className="text-[11px] font-mono text-blue-400 hover:text-blue-300 mt-1 transition-colors"
          >
            + Add subscription
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {/* ── 1. Stat line ── */}
          <div className="px-5 py-3">
            <p className="text-[13px] font-mono font-semibold text-white/80 tracking-tight">
              {insight.statLine}
            </p>
          </div>

          {/* ── 2. KEY POINTS ── */}
          {hasPoints && (
            <div className="px-5 py-3.5">
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-2.5">
                Key Points
              </p>
              <ul className="space-y-2">
                {insight.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-blue-400/60 shrink-0 mt-0.5 text-[10px]">▪</span>
                    <span className="text-[12.5px] text-white/75 leading-snug font-sans">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── 3. WORTH A LOOK (tips) ── */}
          {hasTips && (
            <div className="px-5 py-3.5">
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-2.5">
                Worth a Look
              </p>
              <div className="space-y-2">
                {insight.tips.slice(0, 3).map((tip, idx) => {
                  const subIds = tip.subscriptionIds ?? [];
                  const href =
                    subIds.length === 1
                      ? `/dashboard/subscriptions/${subIds[0]}`
                      : `/dashboard/subscriptions`;
                  return (
                    <Link
                      key={tip.signalId || idx}
                      href={href}
                      className="flex items-center justify-between gap-3 bg-white/4 hover:bg-white/8 rounded-lg px-3.5 py-2.5 group transition-colors border border-white/5"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <TrendingDown className="w-3.5 h-3.5 text-blue-400/70 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[12px] text-white/80 group-hover:text-white/95 transition-colors leading-snug">
                            {tip.reason}
                          </p>
                          {tip.savings && (
                            <p className="text-[11px] font-mono text-emerald-400/90 mt-0.5">
                              {formatSavingsText(tip.savings)}
                            </p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 shrink-0 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 4. WHAT IF SIMULATOR (collapsed by default) ── */}
          <div>
            <button
              type="button"
              onClick={() => setShowWhatIf((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-2.5 text-left hover:bg-white/3 transition-colors"
            >
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-blue-400/80 hover:text-blue-300">
                <Calculator className="w-3.5 h-3.5" />
                What if simulator
              </span>
              <span className="text-white/30">
                {showWhatIf ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {showWhatIf && (
              <div className="px-5 pb-4 pt-2 space-y-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-mono text-white/40">
                    Tick subs to simulate cancelling:
                  </p>
                  {selectedSubIds.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedSubIds(new Set())}
                      className="text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors"
                    >
                      Clear ({selectedSubIds.size})
                    </button>
                  )}
                </div>

                {activeSubs.length === 0 ? (
                  <p className="text-[11px] font-mono text-white/30 text-center py-2">
                    No active subscriptions
                  </p>
                ) : (
                  /* Wrapping chip layout — no inner scrollbar */
                  <div className="flex flex-wrap gap-2">
                    {activeSubs.map((sub) => {
                      const mo =
                        sub.billingCycle === "YEARLY"
                          ? Number(sub.amount) / 12
                          : Number(sub.amount);
                      const isChecked = selectedSubIds.has(sub.id);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSub(sub.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                            isChecked
                              ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                              : "bg-white/4 border-white/8 text-white/60 hover:border-white/20 hover:text-white/80"
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded border flex items-center justify-center shrink-0 ${
                              isChecked
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-white/25 bg-transparent"
                            }`}
                          >
                            {isChecked && (
                              <svg
                                className="w-1.5 h-1.5 text-white"
                                fill="currentColor"
                                viewBox="0 0 12 12"
                              >
                                <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span>{sub.name}</span>
                          <span className="text-white/40">
                            ₹{Math.round(mo).toLocaleString("en-IN")}/mo
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Amount Saved block — only shown when at least one is ticked */}
                {selectedSubIds.size > 0 && (
                  <div className="p-3 rounded-lg bg-[#0d1525] border border-white/8 space-y-1.5">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-white/50 font-mono">Amount Saved:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ₹{Math.round(savedMonthly).toLocaleString("en-IN")}/mo
                        {" "}
                        <span className="text-[10px] font-normal text-emerald-400/70">
                          (₹{Math.round(savedYearly).toLocaleString("en-IN")}/yr)
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-1 border-t border-white/5">
                      <span>New Monthly:</span>
                      <span className="text-white/85 font-semibold">
                        ₹{Math.round(newMonthly).toLocaleString("en-IN")}/mo
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/40">
                      <span>New Yearly:</span>
                      <span className="text-white/85 font-semibold">
                        ₹{Math.round(newYearly).toLocaleString("en-IN")}/yr
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
