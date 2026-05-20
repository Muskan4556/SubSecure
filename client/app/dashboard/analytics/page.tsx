"use client";

import Link from "next/link";
import { Loader2, BarChart3, TrendingUp, ArrowUpRight } from "lucide-react";
import { useSubscriptionStats, useSubscriptions, useUpcomingRenewals } from "@/apis/subscriptions/subscriptions-api";
import { useAuth } from "@/context/authContext";
import { useAdminAnalytics } from "@/apis/admin/admin-api";
import { formatAmount } from "@/lib/utils/format";

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: "green" | "red" | "amber" }) {
  const valueColor = accent === "green" ? "text-emerald-400" : accent === "red" ? "text-red-400" : accent === "amber" ? "text-amber-400" : "text-white/90";
  return (
    <div className="bg-[#0d1525] px-5 py-4">
      <div className="text-[11px] font-mono text-white/25 uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-[1.35rem] sm:text-[1.6rem] font-bold leading-none tracking-tight mb-1.5 ${valueColor}`}>{value}</div>
      {sub && <div className="text-[11px] font-mono text-white/25">{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const { data: statsData, isLoading: statsLoading } = useSubscriptionStats();
  const { data: renewals7 } = useUpcomingRenewals(7);
  const { data: allSubs } = useSubscriptions({ status: "ACTIVE" });
  const { data: adminData } = useAdminAnalytics();

  const stats = statsData?.data;

  const yearlyTotal = allSubs?.data
    ?.filter((s) => s.billingCycle === "YEARLY")
    .reduce((acc, s) => acc + Number(s.amount), 0) ?? 0;

  const monthlyTotal = allSubs?.data
    ?.filter((s) => s.billingCycle === "MONTHLY")
    .reduce((acc, s) => acc + Number(s.amount), 0) ?? 0;

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">
          Analytics
        </p>
        <h1 className="text-[1.1rem] sm:text-[1.25rem] font-bold tracking-tight text-white/90">
          Spending overview
        </h1>
      </div>

      {/* User stats */}
      <div>
        <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.12em] mb-3">
          Your subscriptions
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/6 rounded-xl overflow-hidden border border-white/6">
          <StatCard label="Monthly spend" value={formatAmount(stats?.totalMonthlySpend ?? 0)} sub="across active plans" accent="green" />
          <StatCard label="Active" value={stats?.totalActive ?? 0} sub="subscriptions" />
          <StatCard label="Cancelled" value={stats?.totalCancelled ?? 0} sub="historical" />
          <StatCard label="Due in 7 days" value={renewals7?.data?.length ?? 0} sub="upcoming renewals" accent={((renewals7?.data?.length ?? 0) > 0) ? "amber" : undefined} />
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Billing cycle breakdown */}
        <div>
          <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.12em] mb-3">
            Billing cycle breakdown
          </p>
          <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
            <div className="flex items-center justify-between bg-[#0d1525] px-5 py-3.5">
              <div>
                <p className="text-[13px] font-medium text-white/70">Monthly plans</p>
                <p className="text-[11px] font-mono text-white/25 mt-0.5">
                  {allSubs?.data?.filter((s) => s.billingCycle === "MONTHLY").length ?? 0} subscriptions
                </p>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-mono text-white/80">{formatAmount(monthlyTotal)}<span className="text-[11px] text-white/25">/mo</span></p>
                <p className="text-[11px] font-mono text-white/25">{formatAmount(monthlyTotal * 12)}/yr</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#0d1525] px-5 py-3.5">
              <div>
                <p className="text-[13px] font-medium text-white/70">Yearly plans</p>
                <p className="text-[11px] font-mono text-white/25 mt-0.5">
                  {allSubs?.data?.filter((s) => s.billingCycle === "YEARLY").length ?? 0} subscriptions
                </p>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-mono text-white/80">{formatAmount(yearlyTotal)}<span className="text-[11px] text-white/25">/yr</span></p>
                <p className="text-[11px] font-mono text-white/25">{formatAmount(Math.round(yearlyTotal / 12))}/mo equiv.</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-white/4 px-5 py-3.5">
              <p className="text-[13px] font-medium text-white/50">Total annual commitment</p>
              <p className="text-[14px] font-mono text-white/80">
                {formatAmount(Math.round(monthlyTotal * 12 + yearlyTotal))}
              </p>
            </div>
          </div>
        </div>

        {/* Recent active subscriptions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.12em]">
              Active subscriptions
            </p>
            <Link
              href="/dashboard/subscriptions"
              className="text-[11px] font-mono text-white/20 hover:text-white/50 flex items-center gap-1 transition-colors"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
            {(allSubs?.data ?? []).slice(0, 6).map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 bg-[#0d1525] px-5 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-white/65 truncate">{sub.name}</p>
                  {sub.category && <p className="text-[11px] font-mono text-white/25">{sub.category}</p>}
                </div>
                <p className="text-[12px] font-mono text-white/55 shrink-0">
                  {formatAmount(sub.amount)}<span className="text-[11px] text-white/25">/{sub.billingCycle === "MONTHLY" ? "mo" : "yr"}</span>
                </p>
              </div>
            ))}
            {(allSubs?.data?.length ?? 0) === 0 && (
              <div className="bg-[#0d1525] px-5 py-6 text-center">
                <p className="text-[12px] font-mono text-white/25">No active subscriptions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin platform stats */}
      {isAdmin && adminData && (
        <div>
          <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.12em] mb-3">
            Platform analytics
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/6 rounded-xl overflow-hidden border border-white/6">
            <StatCard label="Total users" value={adminData.data.users.total} sub={`${adminData.data.users.active} active`} />
            <StatCard label="Suspended" value={adminData.data.users.suspended} sub="accounts" accent={adminData.data.users.suspended > 0 ? "red" : undefined} />
            <StatCard label="Total subscriptions" value={adminData.data.subscriptions.total} sub={`${adminData.data.subscriptions.active} active`} />
            <StatCard label="Audit events (24h)" value={adminData.data.security.auditEventsLast24h} sub="recent activity" accent="amber" />
          </div>
        </div>
      )}

      {/* Insight hint */}
      <div className="flex items-center gap-2 text-[11px] font-mono text-white/20">
        <TrendingUp className="w-3.5 h-3.5" />
        <BarChart3 className="w-3.5 h-3.5" />
        <span>Spend is calculated based on active subscriptions. Yearly plans are normalised to monthly equivalents.</span>
      </div>
    </div>
  );
}
