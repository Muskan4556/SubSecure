export type BillingCycle = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED";
export type BillingStatus = "PAID" | "PENDING" | "FAILED";

export type Subscription = {
  id: string;
  userId: string;
  name: string;
  category: string | null;
  amount: string; // Decimal from Prisma serialises as string in JSON
  billingCycle: BillingCycle;
  renewalDate: string;
  status: SubscriptionStatus;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BillingHistory = {
  id: string;
  subscriptionId: string;
  amount: string;
  billingDate: string;
  status: BillingStatus;
  createdAt: string;
};

export type BillingHistoryWithSubscription = BillingHistory & {
  subscription: {
    id: string;
    name: string;
    billingCycle: BillingCycle;
  };
};

//  Request shapes 

export type CreateSubscriptionRequest = {
  name: string;
  category?: string;
  amount: number;
  billingCycle: BillingCycle;
  startDate: string; // ISO date string 
};

export type UpdateSubscriptionRequest = Partial<CreateSubscriptionRequest>;

//  Response shapes 

export type SubscriptionListResponse = {
  message: string;
  data: Subscription[];
};

export type SubscriptionStatsResponse = {
  data: {
    totalActive: number;
    totalCancelled: number;
    totalMonthlySpend: number;
  };
};

export type UpcomingRenewalsResponse = {
  message: string;
  data: Subscription[];
};

export type BillingHistoryResponse = {
  message: string;
  data: BillingHistory[];
};

export type AllBillingHistoryResponse = {
  message: string;
  data: BillingHistoryWithSubscription[];
};
