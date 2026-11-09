import { z } from "zod";

export const SUBSCRIPTION_CATEGORIES = [
  "ENTERTAINMENT",
  "MUSIC",
  "PRODUCTIVITY",
  "CLOUD_STORAGE",
  "DEVELOPMENT",
  "EDUCATION",
  "HEALTH_FITNESS",
  "NEWS_READING",
  "GAMING",
  "UTILITIES",
  "FINANCE",
  "OTHER",
] as const;

export type SubscriptionCategoryEnum = (typeof SUBSCRIPTION_CATEGORIES)[number];

export const editSubscriptionSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  category: z.enum(SUBSCRIPTION_CATEGORIES).optional(),
  amount: z.number().positive().optional(),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional(),
  renewalDate: z.string().optional(),
});

export type EditSubscriptionValues = z.infer<typeof editSubscriptionSchema>;
