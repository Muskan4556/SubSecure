"use client";

import { useState } from "react";
import { Loader2, Users } from "lucide-react";
import {
  useAdminUsers,
  useSuspendUser,
  useUnsuspendUser,
} from "@/apis/admin/admin-api";
import { toast } from "sonner";
import { UserRow, USER_TABLE_COLS } from "@/components/admin/UserRow";

type StatusFilter = "ALL" | "ACTIVE" | "SUSPENDED";

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const { data, isLoading } = useAdminUsers();
  const { mutate: suspend, isPending: suspending } = useSuspendUser();
  const { mutate: unsuspend, isPending: unsuspending } = useUnsuspendUser();

  const allUsers = data?.data ?? [];
  const users =
    filter === "ALL" ? allUsers : allUsers.filter((u) => u.status === filter);
  const activeCount = allUsers.filter((u) => u.status === "ACTIVE").length;
  const suspendedCount = allUsers.filter(
    (u) => u.status === "SUSPENDED",
  ).length;

  const isPending = suspending || unsuspending;

  function handleSuspend(id: string) {
    suspend(id, {
      onSuccess: () => toast.success("User suspended"),
      onError: () => toast.error("Failed to suspend user"),
    });
  }

  function handleUnsuspend(id: string) {
    unsuspend(id, {
      onSuccess: () => toast.success("User unsuspended"),
      onError: () => toast.error("Failed to unsuspend user"),
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">
            Admin
          </p>
          <h1 className="text-[1.1rem] sm:text-[1.25rem] font-bold tracking-tight text-white/90">
            User Management
          </h1>
          {!isLoading && (
            <p className="text-[11px] font-mono text-white/30 mt-1">
              {allUsers.length} total · {activeCount} active
              {suspendedCount > 0 && ` · ${suspendedCount} suspended`}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      {!isLoading && allUsers.length > 0 && (
        <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-white/6">
          {[
            { label: "Total Users", value: allUsers.length, green: false },
            { label: "Active", value: activeCount, green: true },
            { label: "Suspended", value: suspendedCount, green: false },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`bg-[#0d1525] px-4 sm:px-5 py-3 ${i < 2 ? "border-r border-white/5" : ""}`}
            >
              <div className="text-[10px] font-mono text-white/25 uppercase tracking-wider mb-1">
                {s.label}
              </div>
              <div
                className={`text-[14px] font-bold leading-none ${s.green ? "text-emerald-400" : "text-white/85"}`}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1">
        {(["ALL", "ACTIVE", "SUSPENDED"] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11px] font-mono px-3 py-1.5 rounded-lg transition-colors ${
              filter === f
                ? "bg-white/10 text-white/80"
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-white/6">
        {/* Column headers — desktop only */}
        <div
          className={`hidden md:grid ${USER_TABLE_COLS} px-5 py-2.5 gap-4 sm:gap-6 bg-white/3 border-b border-white/6`}
        >
          {[
            { label: "User", align: "text-left" },
            { label: "Role", align: "text-left" },
            { label: "Status", align: "text-right" },
            { label: "Joined", align: "text-right" },
            { label: "", align: "" },
          ].map(({ label, align }) => (
            <span
              key={label}
              className={`text-[10px] font-mono text-white/20 uppercase tracking-wider ${align}`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="bg-[#0d1525] px-5 py-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-[#0d1525] px-5 py-10 text-center">
            <Users className="w-6 h-6 text-white/10 mx-auto mb-2" />
            <p className="text-[13px] font-mono text-white/25">
              No users found
            </p>
          </div>
        ) : (
          users.map((user, i) => (
            <UserRow
              key={user.id}
              user={user}
              onSuspend={handleSuspend}
              onUnsuspend={handleUnsuspend}
              isPending={isPending}
              index={i}
            />
          ))
        )}
      </div>

      {users.length > 0 && (
        <p className="text-[11px] font-mono text-white/25">
          {users.length} user{users.length !== 1 ? "s" : ""}
        </p>
      )}

      {isPending && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
        </div>
      )}
    </div>
  );
}
