import { z } from "zod";

export const tipSchema = z.object({
  signalId: z.string(),
  reason: z.string().max(120),
});

export const insightResponseSchema = z.object({
  points: z.array(z.string().max(120)).min(1).max(4),
  tips: z.array(tipSchema).max(3),
});

export type AiInsightResponse = z.infer<typeof insightResponseSchema>;
export type AiTip = z.infer<typeof tipSchema>;
