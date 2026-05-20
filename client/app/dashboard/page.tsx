"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  ArrowUpRight,
  RotateCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/authContext";
import {
  useSubscriptionStats,
  useUpcomingRenewals,
  useSubscriptions,
} from "@/apis/subscriptions/subscriptions-api";
import type { Subscription } from "@/lib/types/subscription-types";
import { formatAmount, formatDateShort } from "@/lib/utils/format";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role === "ADMIN") {
      router.replace("/dashboard/admin");
    }
  }, [user, isLoading, router]);

  const { data: statsData, isLoading: statsLoading } = useSubscriptionStats();
  const { data: renewalsData } = useUpcomingRenewals(7);
  const { data: subsData } = useSubscriptions({ status: "ACTIVE" });

  const stats = statsData?.data;
  const urgentRenewal = renewalsData?.data?.[0] ?? null;
  const recentSubs: Subscription[] = (subsData?.data ?? []).slice(0, 4);

  const QUICK_LINKS = [
    {
      icon: CreditCard,
      label: "All Subscriptions",
      sub: "View & manage every service",
      href: "/dashboard/subscriptions",
    },
    {
      icon: RotateCw,
      label: "Upcoming Renewals",
      sub: `${renewalsData?.data?.length ?? 0} renewing in 7 days`,
      href: "/dashboard/renewals",
      alert: (renewalsData?.data?.length ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1.5">
            Overview
          </p>
          <h1 className="text-[1.15rem] sm:text-[1.4rem] font-bold tracking-tight text-white/90 leading-tight">
            {greeting()}
            {user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
          <p className="text-[13px] text-white/30 font-mono mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {user?.role === "USER" && (
          <Link
            href="/dashboard/subscriptions/new"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-white border border-white/15 hover:border-white/30 hover:bg-white/5 px-4 py-2 rounded-lg transition-all shrink-0"
          >
            + Add subscription
          </Link>
        )}
      </div>

      {/* Renewal alert banner */}
      {urgentRenewal && (
        <div className="flex items-center gap-3 bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-[13px] text-amber-300/80 font-sans">
            <strong className="text-amber-300">{urgentRenewal.name}</strong>{" "}
            renews in{" "}
            <strong className="text-amber-300">
              {daysUntil(urgentRenewal.renewalDate)} day
              {daysUntil(urgentRenewal.renewalDate) !== 1 ? "s" : ""}
            </strong>{" "}
            — {formatAmount(urgentRenewal.amount)}/
            {urgentRenewal.billingCycle === "MONTHLY" ? "mo" : "yr"}.{" "}
            <Link
              href="/dashboard/renewals"
              className="underline underline-offset-4 hover:text-amber-200 transition-colors"
            >
              Review →
            </Link>
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-white/6 rounded-xl overflow-hidden border border-white/6">
        <div className="bg-[#0d1525] px-5 py-4">
          <div className="text-[11px] font-mono text-white/25 uppercase tracking-wider mb-2">
            Monthly Spend
          </div>
          {statsLoading ? (
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          ) : (
            <>
              <div className="text-[1.25rem] sm:text-[1.5rem] font-bold leading-none tracking-tight mb-1.5 text-white/90">
                {formatAmount(stats?.totalMonthlySpend ?? 0)}
              </div>
              <div className="text-[11px] font-mono text-white/25">
                across active plans
              </div>
            </>
          )}
        </div>

        <div className="bg-[#0d1525] px-5 py-4">
          <div className="text-[11px] font-mono text-white/25 uppercase tracking-wider mb-2">
            Active
          </div>
          {statsLoading ? (
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          ) : (
            <>
              <div className="text-[1.25rem] sm:text-[1.5rem] font-bold leading-none tracking-tight mb-1.5 text-emerald-400">
                {stats?.totalActive ?? 0}
              </div>
              <div className="text-[11px] font-mono text-white/25">
                subscriptions
              </div>
            </>
          )}
        </div>

        <div className="bg-[#0d1525] px-5 py-4 col-span-2 lg:col-span-1">
          <div className="text-[11px] font-mono text-white/25 uppercase tracking-wider mb-2">
            Cancelled
          </div>
          {statsLoading ? (
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          ) : (
            <>
              <div className="text-[1.25rem] sm:text-[1.5rem] font-bold leading-none tracking-tight mb-1.5 text-white/40">
                {stats?.totalCancelled ?? 0}
              </div>
              <div className="text-[11px] font-mono text-white/25">
                historical
              </div>
            </>
          )}
        </div>
      </div>

      {/* Two-column: quick links + recent active subs */}
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
        {/* Quick navigation */}
        <div>
          <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em] mb-3">
            Quick access
          </p>
          <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
            {QUICK_LINKS.map(({ icon: Icon, label, sub, href, alert }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 bg-[#0d1525] hover:bg-white/4 px-5 py-3.5 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/8 flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-white/75 group-hover:text-white/90 transition-colors">
                      {label}
                    </span>
                    {alert && (
                      <span className="text-[10px] font-mono bg-amber-400/15 text-amber-400 px-1.5 py-px rounded-full">
                        due soon
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-white/25 mt-0.5 truncate">
                    {sub}
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent active subscriptions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em]">
              Active subscriptions
            </p>
            <Link
              href="/dashboard/subscriptions"
              className="text-[11px] font-mono text-white/20 hover:text-white/50 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
            {recentSubs.length === 0 ? (
              <div className="bg-[#0d1525] px-5 py-6 text-center">
                <p className="text-[12px] font-mono text-white/25">
                  No active subscriptions
                </p>
                {user?.role === "USER" && (
                  <Link
                    href="/dashboard/subscriptions/new"
                    className="text-[12px] font-mono text-blue-400/60 hover:text-blue-400 mt-1 block transition-colors"
                  >
                    Add your first →
                  </Link>
                )}
              </div>
            ) : (
              recentSubs.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/dashboard/subscriptions/${sub.id}`}
                  className="flex items-center gap-3 bg-[#0d1525] hover:bg-white/4 px-5 py-3.5 group transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-white/75 group-hover:text-white/90 truncate transition-colors">
                      {sub.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {sub.category && (
                        <span className="text-[11px] font-mono text-white/25">
                          {sub.category}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-white/20">
                        renews {formatDateShort(sub.renewalDate)}
                      </span>
                    </div>
                  </div>
                  <div className="text-[13px] font-mono text-white/60 shrink-0">
                    {formatAmount(sub.amount)}
                    <span className="text-[11px] text-white/25">
                      /{sub.billingCycle === "MONTHLY" ? "mo" : "yr"}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
