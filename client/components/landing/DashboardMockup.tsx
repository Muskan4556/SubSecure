"use client";

import { Shield, AlertCircle, Activity, Clock, RefreshCw } from "lucide-react";
import {
  DASHBOARD_ROWS,
  DASHBOARD_STATS,
  DASHBOARD_SIDEBAR_NAV,
} from "@/lib/data/landing";

export default function DashboardMockup() {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/7 shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
      {/* window chrome */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#0d1525] border-b border-white/6">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80" />
        </div>
        <span className="text-[11px] font-mono text-white/20 tracking-wider">
          subsecure.io / dashboard / subscriptions
        </span>
        <div className="flex items-center gap-1.5 text-white/20">
          <RefreshCw className="w-3 h-3" />
          <span className="text-[11px] font-mono">synced 1m ago</span>
        </div>
      </div>

      <div className="flex bg-[#0b1120]">
        {/* sidebar — hidden on small screens */}
        <div className="hidden lg:flex w-[150px] shrink-0 bg-[#080e1a] border-r border-white/5 px-3 py-5 flex-col gap-1">
          <div className="flex items-center gap-2 px-2 py-2 mb-4">
            <div className="w-5 h-5 rounded-md bg-emerald-500/90 flex items-center justify-center shrink-0">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="text-white/75 text-[12px] font-semibold">SubSecure</span>
          </div>

          {DASHBOARD_SIDEBAR_NAV.map(({ icon: Icon, label, active, badge }) => (
            <div
              key={label}
              className={`flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] font-sans ${
                active ? "bg-white/8 text-white/80" : "text-white/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-3 h-3 shrink-0" />
                {label}
              </div>
              {badge && (
                <span className="text-[10px] font-mono bg-white/10 text-white/40 px-1.5 rounded-full">
                  {badge}
                </span>
              )}
            </div>
          ))}

          <div className="mt-auto pt-4 border-t border-white/5 px-2">
            <div className="w-5 h-5 rounded-full bg-linear-to-br from-violet-400 to-blue-500 mb-1" />
            <div className="text-[11px] font-mono text-white/25">alex@acme.co</div>
            <div className="text-[10px] font-mono text-emerald-500/60">ADMIN</div>
          </div>
        </div>

        {/* main content */}
        <div className="flex-1 overflow-hidden">
          {/* top bar */}
          <div className="flex flex-wrap items-start sm:items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b border-white/5">
            <div>
              <div className="text-white/80 text-[13px] font-semibold">All Subscriptions</div>
              <div className="text-white/30 text-[11px] font-mono mt-0.5">
                5 active · 1 ending · $1,384/yr combined
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-lg px-2.5 py-1.5">
                <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-amber-300/80 text-[11px] font-sans">
                  Slack renewing in <strong>3 days</strong>
                </span>
              </div>
              <button className="bg-emerald-500/90 text-white text-[11px] font-sans px-2.5 py-1.5 rounded-lg">
                + Add new
              </button>
            </div>
          </div>

          {/* stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/5">
            {DASHBOARD_STATS.map((s) => (
              <div
                key={s.label}
                className="px-4 sm:px-5 py-3 border-r border-white/5 last:border-0 even:border-r-0 sm:even:border-r"
              >
                <div className="text-white/25 text-[10px] font-mono mb-1">{s.label}</div>
                <div className={`text-[14px] font-bold leading-none ${s.green ? "text-emerald-400" : "text-white/85"}`}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* table header */}
          <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto_auto] px-4 sm:px-6 py-2 border-b border-white/5 text-[10px] font-mono text-white/20 uppercase tracking-wider gap-4 sm:gap-6">
            <span>Service</span>
            <span className="hidden sm:block text-right">Plan</span>
            <span className="text-right">Cost</span>
            <span className="hidden sm:block text-right w-16">Next</span>
            <span className="text-right w-14">Status</span>
          </div>

          {/* table rows */}
          {DASHBOARD_ROWS.map((r, i) => (
            <div
              key={r.name}
              className={`grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto_auto] px-4 sm:px-6 py-2.5 gap-4 sm:gap-6 items-center border-b border-white/3 last:border-0 ${
                i % 2 === 0 ? "bg-white/1" : ""
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    r.status === "Active" ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                />
                <span className="text-white/70 text-[11px] font-sans truncate">{r.name}</span>
              </div>
              <span className="hidden sm:block text-white/30 text-[11px] font-mono whitespace-nowrap">
                {r.plan}
              </span>
              <span className="text-white/60 text-[11px] font-mono text-right">{r.cost}</span>
              <div className="hidden sm:flex items-center gap-1 text-white/25 text-[11px] font-mono w-16 justify-end">
                <Clock className="w-2.5 h-2.5 shrink-0" />
                {r.next}
              </div>
              <div className="w-14 text-right">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    r.status === "Active"
                      ? "bg-emerald-500/12 text-emerald-400"
                      : "bg-amber-400/12 text-amber-400"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </div>
          ))}

          {/* audit tail */}
          <div className="px-4 sm:px-6 py-2.5 border-t border-white/5 bg-white/1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-white/20 overflow-hidden">
              <Activity className="w-3 h-3 text-blue-400/50 shrink-0" />
              <span>
                <span className="text-blue-400/60">alex@acme.co</span> cancelled{" "}
                <span className="text-white/35">Notion Pro</span> · SUBSCRIPTION_CANCELLED · 14 min ago
              </span>
              <span className="ml-auto text-white/15 hidden sm:block shrink-0">
                view audit log →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
