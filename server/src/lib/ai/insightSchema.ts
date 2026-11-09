import { z } from "zod";

export const rawInsightItemSchema = z.object({
  signalId: z.string().nullable().optional(),
  title: z.string().max(60),
  detail: z.string().max(180),
});

export const insightResponseSchema = z.object({
  insights: z.array(rawInsightItemSchema).min(1).max(4),
});

export type RawAiInsightItem = z.infer<typeof rawInsightItemSchema>;
export type AiInsightResponse = z.infer<typeof insightResponseSchema>;
