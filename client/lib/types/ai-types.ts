export type SignalSavings = {
  monthlyMin: number;
  monthlyMax: number;
  yearlyMin: number;
  yearlyMax: number;
};

export type InsightTip = {
  signalId: string;
  reason: string;
  subscriptionIds: string[];
  savings: SignalSavings | null;
};

export type InsightResponse = {
  /** Code-built headline e.g. "₹2,322/mo · ₹27,860/yr · 5 subscriptions" */
  statLine: string;
  /** AI or rule-based scannable bullet points (3-4 items) */
  points: string[];
  tips: InsightTip[];
  aiGenerated: boolean;
  cached: boolean;
  updatedAt: string;
  refreshesLeft: number;
  dataHash: string;
  /** Why rule summary was used (quota_cap | user_limit | no_signals | ai_disabled | timeout | quota | invalid_response | provider_error) */
  fallbackReason?: string;
};

export type InsightApiResponse = {
  data: InsightResponse;
};

export type CategorySpend = {
  category: string;
  monthlyAmount: number;
  share: number;
};

export type CategoryStatsResponse = {
  message: string;
  data: CategorySpend[];
  monthlyTotal: number;
};
