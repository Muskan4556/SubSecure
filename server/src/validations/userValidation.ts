import { z } from "zod";

export const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  profileImageUrl: z.string().url("Invalid URL").optional(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
