"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { AdminUser } from "@/lib/types/admin-types";
import { formatDate } from "@/lib/utils/format";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function StatusBadge({ status }: { status: AdminUser["status"] }) {
  return status === "ACTIVE" ? (
    <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
      Active
    </span>
  ) : (
    <span className="text-[11px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
      Suspended
    </span>
  );
}

export function UserRow({
  user,
  onSuspend,
  onUnsuspend,
  isPending,
}: {
  user: AdminUser;
  onSuspend: (id: string) => void;
  onUnsuspend: (id: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center gap-4 bg-[#0d1525] px-5 py-3.5 group">
      {/* Avatar initials */}
      <div className="w-7 h-7 rounded-full bg-linear-to-br from-violet-400 to-blue-500 flex items-center justify-center text-[11px] font-semibold text-white shrink-0 select-none">
        {user.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-medium text-white/75 truncate">
            {user.name}
          </span>
          {user.role === "ADMIN" && (
            <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 px-1.5 py-px rounded-full uppercase tracking-wide shrink-0">
              Admin
            </span>
          )}
          <StatusBadge status={user.status} />
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[11px] font-mono text-white/30 truncate">
            {user.email}
          </span>
          <span className="text-[11px] font-mono text-white/20 shrink-0">
            {user._count.subscriptions} sub
            {user._count.subscriptions !== 1 ? "s" : ""}
          </span>
          <span className="text-[11px] font-mono text-white/15 shrink-0">
            joined{" "}
            {formatDate(user.createdAt)}
          </span>
        </div>
      </div>

      {/* Action — only for non-admin users */}
      {user.role !== "ADMIN" && (
        <div className="shrink-0">
          {user.status === "ACTIVE" ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-red-400/50 hover:text-red-400 transition-colors disabled:opacity-30"
                >
                  <ShieldAlert className="w-3 h-3" />
                  Suspend
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Suspend user?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <strong>{user.name}</strong> will lose access immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => onSuspend(user.id)}
                  >
                    Yes, suspend
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <button
              disabled={isPending}
              onClick={() => onUnsuspend(user.id)}
              className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/50 hover:text-emerald-400 transition-colors disabled:opacity-30"
            >
              <ShieldCheck className="w-3 h-3" />
              Unsuspend
            </button>
          )}
        </div>
      )}
    </div>
  );
}
