import { api } from "../axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserType } from "@/lib/types/user-types";

export const userKeys = {
  me: ["users", "me"] as const,
};

async function fetchMe(): Promise<{ data: UserType }> {
  const res = await api.get("/api/users/me");
  return res.data;
}

async function updateMeApi(data: { name: string }) {
  const res = await api.patch("/api/users/me", data);
  return res.data;
}

export function useMe() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: fetchMe,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMeApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}
