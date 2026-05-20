"use client";

import { useAuth } from "@/context/authContext";
import { AdminSubscriptionsView } from "@/components/subscriptions/AdminSubscriptionsView";
import { UserSubscriptionsView } from "@/components/subscriptions/UserSubscriptionsView";

export default function SubscriptionsPage() {
  const { user } = useAuth();
  return user?.role === "ADMIN" ? (
    <AdminSubscriptionsView />
  ) : (
    <UserSubscriptionsView />
  );
}
