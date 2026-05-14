import { z } from "zod";
import { AuditEntityType } from "@prisma/client";

export const getAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  entityType: z.nativeEnum(AuditEntityType).optional(),
  actorId: z.string().uuid().optional(),
});

export type GetAuditLogsQuery = z.infer<typeof getAuditLogsQuerySchema>;
