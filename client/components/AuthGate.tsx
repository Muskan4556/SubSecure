"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import PageLoader from "@/components/PageLoader";

const PROTECTED = ["/dashboard", "/settings", "/profile"];
const GUEST_ONLY = ["/login", "/signup"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { accessToken, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isLoading) return;
    if (isProtected && !accessToken) router.replace("/login");
    if (isGuestOnly && accessToken) router.replace("/dashboard");
  }, [isLoading, accessToken, isProtected, isGuestOnly, router]);

  // Auth check still in progress — block render to prevent any flash
  if (isLoading) return <PageLoader />;

  // Redirect queued — render nothing while navigation happens
  if (isProtected && !accessToken) return null;
  if (isGuestOnly && accessToken) return null;

  return <>{children}</>;
}
