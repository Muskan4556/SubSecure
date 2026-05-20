"use client";

import { useState } from "react";
import { Loader2, Activity, Lock } from "lucide-react";
import { useAuditLogs } from "@/apis/admin/admin-api";
import { useAuth } from "@/context/authContext";
import { ACTION_COLORS, ACTION_FILTERS, timeAgo } from "@/lib/data/audit-logs";

export default function ActivityPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [actionFilter, setActionFilter] = useState("");

  const { data, isLoading } = useAuditLogs({
    ...(actionFilter ? { action: actionFilter } : {}),
  });

  const logs = data?.data ?? [];

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Lock className="w-8 h-8 text-white/10" />
        <p className="text-[13px] font-mono text-white/25">
          Activity logs are only accessible to admins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">
          Security
        </p>
        <h1 className="text-[1.1rem] sm:text-[1.25rem] font-bold tracking-tight text-white/90">
          Audit log
        </h1>
      </div>

      {/* Action filter */}
      <div className="flex flex-wrap gap-1">
        {ACTION_FILTERS.map((a) => (
          <button
            key={a || "all"}
            onClick={() => setActionFilter(a)}
            className={`text-[11px] font-mono px-3 py-1.5 rounded-lg transition-colors ${
              actionFilter === a
                ? "bg-white/10 text-white/80"
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            {a || "All events"}
          </button>
        ))}
      </div>

      {/* Log list */}
      <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
        {isLoading ? (
          <div className="bg-[#0d1525] px-5 py-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-[#0d1525] px-5 py-10 text-center">
            <p className="text-[12px] font-mono text-white/25">
              No audit events found
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 bg-[#0d1525] px-5 py-3.5"
            >
              <Activity className="w-3 h-3 text-white/15 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[12px] font-mono ${ACTION_COLORS[log.action] ?? "text-white/40"}`}
                  >
                    {log.action}
                  </span>
                  {log.entityType && (
                    <span className="text-[11px] font-mono text-white/20 bg-white/5 px-1.5 py-px rounded">
                      {log.entityType}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {log.user && (
                    <span className="text-[11px] font-mono text-blue-400/50 truncate">
                      {log.user.email}
                    </span>
                  )}
                  {log.entityId && (
                    <span className="text-[11px] font-mono text-white/15">
                      {log.entityId.slice(0, 16)}…
                    </span>
                  )}
                  {log.ipAddress && (
                    <span className="text-[11px] font-mono text-white/15">
                      {log.ipAddress}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-mono text-white/20 shrink-0 mt-0.5">
                {timeAgo(log.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>

      {logs.length > 0 && (
        <p className="text-[11px] font-mono text-white/25">
          {logs.length} events
        </p>
      )}
    </div>
  );
}
