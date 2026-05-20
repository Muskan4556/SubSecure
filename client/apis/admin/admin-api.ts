import { api } from "../axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AnalyticsResponse,
  AuditLogListResponse,
  UserListResponse,
} from "@/lib/types/admin-types";

export const adminKeys = {
  auditLogs: (params?: object) => ["admin", "audit-logs", params] as const,
  analytics: () => ["admin", "analytics"] as const,
  users: () => ["admin", "users"] as const,
};

async function fetchAuditLogs(params?: {
  userId?: string;
  action?: string;
  entityType?: string;
}): Promise<AuditLogListResponse> {
  const res = await api.get("/api/admin/audit-logs", { params });
  return res.data;
}

async function fetchAnalytics(): Promise<AnalyticsResponse> {
  const res = await api.get("/api/admin/analytics");
  return res.data;
}

async function fetchUsers(): Promise<UserListResponse> {
  const res = await api.get("/api/admin/users");
  return res.data;
}

async function suspendUserApi(userId: string) {
  const res = await api.patch(`/api/admin/users/${userId}/suspend`);
  return res.data;
}

async function unsuspendUserApi(userId: string) {
  const res = await api.patch(`/api/admin/users/${userId}/unsuspend`);
  return res.data;
}

export function useAuditLogs(params?: {
  userId?: string;
  action?: string;
  entityType?: string;
}) {
  return useQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: () => fetchAuditLogs(params),
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics(),
    queryFn: fetchAnalytics,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: fetchUsers,
  });
}

export function useSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: suspendUserApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.users() });
      qc.invalidateQueries({ queryKey: adminKeys.analytics() });
    },
  });
}

export function useUnsuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unsuspendUserApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.users() });
      qc.invalidateQueries({ queryKey: adminKeys.analytics() });
    },
  });
}
