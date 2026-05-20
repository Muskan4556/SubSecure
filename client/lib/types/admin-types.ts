import { UserType } from "./user-types";
import type { Subscription } from "./subscription-types";

export type AdminSubscription = Subscription & {
  user: { id: string; name: string; email: string };
};

export type AdminSubscriptionListResponse = {
  data: AdminSubscription[];
  stats: {
    totalMonthlyVolume: number;
    totalActive: number;
    totalCancelled: number;
  };
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  _count: { subscriptions: number };
};

export type UserListResponse = {
  message: string;
  data: AdminUser[];
};

export type AuditLog = {
  id: string;
  userId: string | null;
  user: Pick<UserType, "id" | "name" | "email" | "role"> | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
};

export type AuditLogListResponse = {
  message: string;
  data: AuditLog[];
};

export type AnalyticsResponse = {
  data: {
    users: {
      total: number;
      active: number;
      suspended: number;
    };
    subscriptions: {
      total: number;
      active: number;
      cancelled: number;
    };
    security: {
      auditEventsLast24h: number;
    };
  };
};
