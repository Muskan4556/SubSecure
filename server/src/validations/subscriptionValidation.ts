import { z } from "zod";
import { SubscriptionStatus } from "@prisma/client";

export const createSubscriptionSchema = z.object({
  toolName: z.string().min(1, "Tool name is required").max(100),
  cost: z.coerce.number().positive("Cost must be a positive number"),
  renewalDate: z.coerce
    .date()
    .refine((d) => d > new Date(), "Renewal date must be in the future"),
});

export const updateSubscriptionSchema = z
  .object({
    toolName: z.string().min(1, "Tool name is required").max(100).optional(),
    cost: z.coerce.number().positive("Cost must be a positive number").optional(),
    renewalDate: z.coerce.date().refine((d) => d > new Date(), "Renewal date must be in the future").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const subscriptionIdSchema = z.object({
  id: z.string().uuid("Invalid subscription ID").trim(),
});

export const getSubscriptionsQuerySchema = z.object({
  status: z.nativeEnum(SubscriptionStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
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
