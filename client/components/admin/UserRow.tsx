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

export const USER_TABLE_COLS = "grid-cols-[1fr_80px_100px_130px_110px]";

function StatusBadge({ status }: { status: AdminUser["status"] }) {
  return status === "ACTIVE" ? (
    <span className="text-[10px] font-mono bg-emerald-500/12 text-emerald-400 px-1.5 py-0.5 rounded-full">
      Active
    </span>
  ) : (
    <span className="text-[10px] font-mono bg-red-500/12 text-red-400 px-1.5 py-0.5 rounded-full">
      Suspended
    </span>
  );
}

function RoleBadge({ role }: { role: AdminUser["role"] }) {
  return role === "ADMIN" ? (
    <span className="text-[10px] font-mono bg-violet-500/12 text-violet-400 px-1.5 py-0.5 rounded-full">
      Admin
    </span>
  ) : (
    <span className="text-[10px] font-mono text-white/25">User</span>
  );
}

function dotColor(status: AdminUser["status"]) {
  return status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500/70";
}

export function UserRow({
  user,
  onSuspend,
  onUnsuspend,
  isPending,
  index,
}: {
  user: AdminUser;
  onSuspend: (id: string) => void;
  onUnsuspend: (id: string) => void;
  isPending: boolean;
  index: number;
}) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const rowBg = index % 2 === 0 ? "bg-[#0d1525]" : "bg-white/[0.012]";

  const actionButton =
    user.role !== "ADMIN" ? (
      user.status === "ACTIVE" ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={isPending}
              className="flex items-center gap-1 text-[11px] font-mono text-red-400/40 hover:text-red-400 transition-colors disabled:opacity-30"
            >
              <ShieldAlert className="w-3 h-3" /> Suspend
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
          className="flex items-center gap-1 text-[11px] font-mono text-emerald-400/40 hover:text-emerald-400 transition-colors disabled:opacity-30"
        >
          <ShieldCheck className="w-3 h-3" /> Unsuspend
        </button>
      )
    ) : null;

  return (
    <div className={`${rowBg} border-b border-white/4 last:border-0`}>
      {/* Desktop */}
      <div
        className={`hidden md:grid ${USER_TABLE_COLS} items-center px-5 py-2.5 gap-4 sm:gap-6`}
      >
        {/* User */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(user.status)}`}
          />
          <div className="w-6 h-6 rounded-full bg-linear-to-br from-violet-400 to-blue-500 flex items-center justify-center text-[10px] font-semibold text-white shrink-0 select-none">
            {initials}
          </div>
          <div className="min-w-0">
            <span className="text-[13px] font-medium text-white/75 truncate block">
              {user.name}
            </span>
            <span className="text-[11px] font-mono text-white/25 truncate block">
              {user.email}
            </span>
          </div>
        </div>

        {/* Role */}
        <div>
          <RoleBadge role={user.role} />
        </div>

        {/* Status */}
        <div className="flex justify-end">
          <StatusBadge status={user.status} />
        </div>

        {/* Joined */}
        <span className="text-[12px] font-mono text-white/30 text-right">
          {formatDate(user.createdAt)}
        </span>

        {/* Actions */}
        <div className="flex items-center justify-end">{actionButton}</div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-start justify-between px-4 py-3 gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${dotColor(user.status)}`}
          />
          <div className="w-7 h-7 rounded-full bg-linear-to-br from-violet-400 to-blue-500 flex items-center justify-center text-[11px] font-semibold text-white shrink-0 select-none">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-medium text-white/75 truncate">
                {user.name}
              </span>
              <RoleBadge role={user.role} />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-white/25 truncate">
                {user.email}
              </span>
            </div>
            <span className="text-[11px] font-mono text-white/20">
              {user._count.subscriptions} sub
              {user._count.subscriptions !== 1 ? "s" : ""} · joined{" "}
              {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={user.status} />
          {actionButton}
        </div>
      </div>
    </div>
  );
}
