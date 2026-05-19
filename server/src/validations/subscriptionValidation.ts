import { z } from "zod";
import { BillingCycle, SubscriptionStatus } from "@prisma/client";

export const createSubscriptionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  category: z.string().trim().max(50).optional(),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  billingCycle: z.nativeEnum(BillingCycle, {
    message: "billingCycle must be MONTHLY or YEARLY",
  }),
  startDate: z.coerce
    .date()
    .refine((d) => d <= new Date(), "Start date cannot be in the future"),
});

export const updateSubscriptionSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    category: z.string().trim().max(50).optional(),
    amount: z.coerce
      .number()
      .positive("Amount must be a positive number")
      .optional(),
    billingCycle: z.nativeEnum(BillingCycle).optional(),
    renewalDate: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const subscriptionIdSchema = z.object({
  id: z.string().cuid("Invalid subscription ID").trim(),
});

export const getSubscriptionsQuerySchema = z.object({
  status: z.nativeEnum(SubscriptionStatus).optional(),
});

export const getUpcomingRenewalsQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type GetSubscriptionsQuery = z.infer<typeof getSubscriptionsQuerySchema>;
export type GetUpcomingRenewalsQuery = z.infer<
  typeof getUpcomingRenewalsQuerySchema
>;
