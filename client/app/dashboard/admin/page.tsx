"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useAdminAnalytics } from "@/apis/admin/admin-api";
import {
  ADMIN_QUICK_LINKS,
  USER_BREAKDOWN_ITEMS,
  greeting,
} from "@/lib/data/admin-dashboard";

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading } = useAdminAnalytics();

  useEffect(() => {
    if (!authLoading && user?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const stats = data?.data;

  const STAT_CARDS = [
    {
      label: "Total Users",
      value: stats?.users.total ?? 0,
      sub: `${stats?.users.active ?? 0} active · ${stats?.users.suspended ?? 0} suspended`,
      color: "text-blue-400",
    },
    {
      label: "Total Subscriptions",
      value: stats?.subscriptions.total ?? 0,
      sub: `${stats?.subscriptions.active ?? 0} active · ${stats?.subscriptions.cancelled ?? 0} cancelled`,
      color: "text-emerald-400",
    },
    {
      label: "Audit Events (24 h)",
      value: stats?.security.auditEventsLast24h ?? 0,
      sub: "across all users",
      color: "text-amber-400",
    },
  ];

  const userBreakdownValues: Record<string, number> = {
    active: stats?.users.active ?? 0,
    suspended: stats?.users.suspended ?? 0,
    auditEventsLast24h: stats?.security.auditEventsLast24h ?? 0,
    activeSubscriptions: stats?.subscriptions.active ?? 0,
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1.5">
          Admin Overview
        </p>
        <h1 className="text-[1.4rem] font-bold tracking-tight text-white/90 leading-tight">
          {greeting()}
          {user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
        </h1>
        <p className="text-[12px] text-white/30 font-mono mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/6 rounded-xl overflow-hidden border border-white/6">
        {STAT_CARDS.map(({ label, value, sub, color }) => (
          <div key={label} className="bg-[#0d1525] px-5 py-4">
            <div className="text-[9px] font-mono text-white/25 uppercase tracking-wider mb-2">
              {label}
            </div>
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
            ) : (
              <>
                <div
                  className={`text-[1.5rem] font-bold leading-none tracking-tight mb-1.5 ${color}`}
                >
                  {value}
                </div>
                <div className="text-[10px] font-mono text-white/25">{sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Two-column: quick links + user breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick links */}
        <div>
          <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em] mb-3">
            Quick access
          </p>
          <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
            {ADMIN_QUICK_LINKS.map(({ icon: Icon, label, sub, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 bg-[#0d1525] hover:bg-white/4 px-5 py-3.5 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/8 flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[12px] font-medium text-white/75 group-hover:text-white/90 transition-colors block">
                    {label}
                  </span>
                  <span className="text-[10px] font-mono text-white/25 mt-0.5 block truncate">
                    {sub}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* User status breakdown */}
        <div>
          <p className="text-[9px] font-mono text-white/25 uppercase tracking-[0.15em] mb-3">
            User status
          </p>
          <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
            {USER_BREAKDOWN_ITEMS.map(({ icon: Icon, label, color, valueKey }) => (
              <div
                key={label}
                className="flex items-center gap-4 bg-[#0d1525] px-5 py-3.5"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white/40" />
                </div>
                <div className="flex-1">
                  <span className="text-[12px] font-medium text-white/60 block">
                    {label}
                  </span>
                </div>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-white/20 animate-spin shrink-0" />
                ) : (
                  <span className={`text-[14px] font-mono font-bold ${color} shrink-0`}>
                    {userBreakdownValues[valueKey]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
