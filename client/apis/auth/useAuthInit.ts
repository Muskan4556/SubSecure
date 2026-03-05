import { useEffect } from "react";
import { api } from "../axios";
import { setAccessToken } from "../axios-interceptor";
import { UserType } from "@/lib/types/user-types";

/*
Runs when the app loads.

Purpose:
Restore authentication after page refresh or new tab.

*/

export function useAuthInit(
  setAuth: (token: string | null, user: UserType | null) => void,
  logout: () => void,
  setLoading: (loading: boolean) => void,
) {
  useEffect(() => {
    async function refresh() {
      try {
        const res = await api.post("/api/auth/refresh");

        const { accessToken, user } = res.data;

        // Store token for interceptor
        setAccessToken(accessToken);

        // Update React auth state
        setAuth(accessToken, user);
      } catch {
        // Refresh token missing or invalid 
        logout();
      } finally {
        // Auth check complete — unblock protected routes
        setLoading(false);
      }
    }

    refresh();
  }, [setAuth, logout, setLoading]);
}
