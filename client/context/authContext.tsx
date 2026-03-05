"use client";

import { useAuthInit } from "@/apis/auth/useAuthInit";
import { AuthContextType } from "@/lib/types/auth-types";
import { UserType } from "@/lib/types/user-types";
import { useState, useContext, createContext, useCallback } from "react";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Access token stored in memory (not localStorage)
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [user, setUser] = useState<UserType | null>(null);

  // True until the silent refresh on mount settles — prevents protected
  // routes from flashing a redirect before we know if the user is logged in
  const [isLoading, setIsLoading] = useState(true);

  const setAuth = useCallback((token: string | null, user: UserType | null) => {
    setAccessToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  useAuthInit(setAuth, logout, setLoading);

  return (
    <AuthContext.Provider
      value={{ accessToken, user, isLoading, setAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easier usage of AuthContext
export function useAuth() {
  const ctx = useContext(AuthContext);

  // Prevent using hook outside provider
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");

  return ctx;
}
