"use client";

import { useState } from "react";
import { Loader2, Users } from "lucide-react";
import {
  useAdminUsers,
  useSuspendUser,
  useUnsuspendUser,
} from "@/apis/admin/admin-api";
import { toast } from "sonner";
import { UserRow } from "@/components/admin/UserRow";

type StatusFilter = "ALL" | "ACTIVE" | "SUSPENDED";

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const { data, isLoading } = useAdminUsers();
  const { mutate: suspend, isPending: suspending } = useSuspendUser();
  const { mutate: unsuspend, isPending: unsuspending } = useUnsuspendUser();

  const allUsers = data?.data ?? [];
  const users =
    filter === "ALL" ? allUsers : allUsers.filter((u) => u.status === filter);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">
            Admin
          </p>
          <h1 className="text-[1.25rem] font-bold tracking-tight text-white/90">
            User Management
          </h1>
        </div>
        {!isLoading && (
          <p className="text-[10px] font-mono text-white/25 shrink-0">
            {allUsers.length} total ·{" "}
            {allUsers.filter((u) => u.status === "ACTIVE").length} active ·{" "}
            {allUsers.filter((u) => u.status === "SUSPENDED").length} suspended
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {(["ALL", "ACTIVE", "SUSPENDED"] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] font-mono px-3 py-1.5 rounded-lg transition-colors ${
              filter === f
                ? "bg-white/10 text-white/80"
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-px bg-white/5 rounded-xl overflow-hidden border border-white/6">
        {isLoading ? (
          <div className="bg-[#0d1525] px-5 py-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-[#0d1525] px-5 py-10 text-center">
            <Users className="w-6 h-6 text-white/10 mx-auto mb-2" />
            <p className="text-[12px] font-mono text-white/25">
              No users found
            </p>
          </div>
        ) : (
          users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onSuspend={handleSuspend}
              onUnsuspend={handleUnsuspend}
              isPending={isPending}
            />
          ))
        )}
      </div>

      {users.length > 0 && (
        <p className="text-[10px] font-mono text-white/25">
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
