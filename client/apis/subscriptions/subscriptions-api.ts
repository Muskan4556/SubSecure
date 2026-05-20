import { api } from "../axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AllBillingHistoryResponse,
  BillingHistoryResponse,
  CreateSubscriptionRequest,
  SubscriptionListResponse,
  SubscriptionStatsResponse,
  UpdateSubscriptionRequest,
  UpcomingRenewalsResponse,
} from "@/lib/types/subscription-types";

//  Query keys

export const subscriptionKeys = {
  all: ["subscriptions"] as const,

  list: (params?: object) => [...subscriptionKeys.all, "list", params] as const,

  detail: (id: string) => [...subscriptionKeys.all, "detail", id] as const,

  stats: () => [...subscriptionKeys.all, "stats"] as const,

  renewals: (days?: number) =>
    [...subscriptionKeys.all, "renewals", days] as const,

  billing: (id: string) => [...subscriptionKeys.all, "billing", id] as const,

  allBilling: () => [...subscriptionKeys.all, "billing-history"] as const,
};

async function fetchSubscriptions(params?: {
  status?: "ACTIVE" | "CANCELLED";
}): Promise<SubscriptionListResponse> {
  const res = await api.get("/api/subscriptions", { params });
  return res.data;
}

async function fetchSubscriptionById(id: string) {
  const res = await api.get(`/api/subscriptions/${id}`);
  return res.data.data;
}

async function fetchSubscriptionStats(): Promise<SubscriptionStatsResponse> {
  const res = await api.get("/api/subscriptions/stats");
  return res.data;
}

async function fetchUpcomingRenewals(
  days = 30,
): Promise<UpcomingRenewalsResponse> {
  const res = await api.get("/api/subscriptions/renewals", {
    params: { days },
  });
  return res.data;
}

async function fetchBillingHistory(
  subscriptionId: string,
): Promise<BillingHistoryResponse> {
  const res = await api.get(
    `/api/subscriptions/${subscriptionId}/billing-history`,
  );
  return res.data;
}

async function fetchAllMyBillingHistory(): Promise<AllBillingHistoryResponse> {
  const res = await api.get("/api/subscriptions/billing-history");
  return res.data;
}

async function createSubscriptionApi(data: CreateSubscriptionRequest) {
  const res = await api.post("/api/subscriptions", data);
  return res.data;
}

async function updateSubscriptionApi({
  id,
  data,
}: {
  id: string;
  data: UpdateSubscriptionRequest;
}) {
  const res = await api.patch(`/api/subscriptions/${id}`, data);
  return res.data;
}

async function cancelSubscriptionApi(id: string) {
  const res = await api.put(`/api/subscriptions/${id}/cancel`, {});
  return res.data;
}

// Hooks

export function useSubscriptions(params?: { status?: "ACTIVE" | "CANCELLED" }) {
  return useQuery({
    queryKey: subscriptionKeys.list(params),
    queryFn: () => fetchSubscriptions(params),
  });
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => fetchSubscriptionById(id),
    enabled: !!id,
  });
}

export function useSubscriptionStats() {
  return useQuery({
    queryKey: subscriptionKeys.stats(),
    queryFn: fetchSubscriptionStats,
  });
}

export function useUpcomingRenewals(days = 30) {
  return useQuery({
    queryKey: subscriptionKeys.renewals(days),
    queryFn: () => fetchUpcomingRenewals(days),
  });
}

export function useBillingHistory(subscriptionId: string) {
  return useQuery({
    queryKey: subscriptionKeys.billing(subscriptionId),
    queryFn: () => fetchBillingHistory(subscriptionId),
    enabled: !!subscriptionId,
  });
}

export function useAllMyBillingHistory() {
  return useQuery({
    queryKey: subscriptionKeys.allBilling(),
    queryFn: fetchAllMyBillingHistory,
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSubscriptionApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useUpdateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSubscriptionApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscriptionApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

/*
["subscriptions"]
["subscriptions", "list", { status: "ACTIVE" | "CANCELLED" }]
["subscriptions", "detail", "123"]
["subscriptions", "stats"]
["subscriptions", "renewals", { days: 30 }]
["subscriptions", "billing", { subscriptionId: "123" }]
["subscriptions", "billing-history"]

*/
