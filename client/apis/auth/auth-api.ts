import { LoginRequest, SignupRequest } from "@/lib/types/auth-types";
import { api } from "../axios";
import { useAuth } from "@/context/authContext";
import { useMutation } from "@tanstack/react-query";
import { setAccessToken } from "../axios-interceptor";
import { useRouter } from "next/navigation";

async function loginApi(data: LoginRequest) {
  const res = await api.post("/api/auth/signin", data);
  return res.data;
}

export function useLogin() {
  const { setAuth } = useAuth();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      const { accessToken, user } = data;
      // Store token for interceptor
      setAccessToken(accessToken);
      // Update React auth state
      setAuth(accessToken, user);
    },
  });
}

async function signupApi(data: SignupRequest) {
  const res = await api.post("/api/auth/signup", data);
  return res.data;
}

export function useSignup() {
  const { setAuth } = useAuth();

  return useMutation({
    mutationFn: signupApi,
    onSuccess: (data) => {
      const { accessToken, user } = data;
      setAccessToken(accessToken);
      setAuth(accessToken, user);
    },
  });
}

async function logoutApi() {
  await api.post("/api/auth/logout");
}

export function useLogout() {
  const { logout } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      // Clear in-memory token and auth state regardless of server response
      setAccessToken(null);
      logout();
      router.replace("/login");
    },
  });
}
