import { api } from "../axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InsightApiResponse, CategoryStatsResponse } from "@/lib/types/ai-types";

export const aiKeys = {
  all: ["ai"] as const,
  insights: () => [...aiKeys.all, "insights"] as const,
};

async function fetchInsights(): Promise<InsightApiResponse> {
  const res = await api.get("/api/ai/insights");
  return res.data;
}

async function triggerRefresh(): Promise<InsightApiResponse> {
  const res = await api.post("/api/ai/insights/refresh");
  return res.data;
}

async function fetchCategoryStats(): Promise<CategoryStatsResponse> {
  const res = await api.get("/api/subscriptions/stats/by-category");
  return res.data;
}

export function useInsights() {
  return useQuery({
    queryKey: aiKeys.insights(),
    queryFn: fetchInsights,
    staleTime: 24 * 60 * 60 * 1000, // Stays fresh while idle; invalidated automatically when subscriptions are added/edited/cancelled
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useRefreshInsights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: triggerRefresh,
    onSuccess: (data) => {
      qc.setQueryData(aiKeys.insights(), data);
    },
  });
}

export const categoryKeys = {
  byCategory: () => ["subscriptions", "by-category"] as const,
};

export function useSpendByCategory() {
  return useQuery({
    queryKey: categoryKeys.byCategory(),
    queryFn: fetchCategoryStats,
    staleTime: 60 * 1000,
  });
}
