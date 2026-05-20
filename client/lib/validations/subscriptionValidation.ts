import { z } from "zod";

export const editSubscriptionSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  category: z.string().trim().max(50).optional(),
  amount: z.number().positive().optional(),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional(),
  renewalDate: z.string().optional(),
});

export type EditSubscriptionValues = z.infer<typeof editSubscriptionSchema>;
