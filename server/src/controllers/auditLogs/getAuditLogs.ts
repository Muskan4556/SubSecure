import { Request, Response } from "express";
import { getAuditLogsQuerySchema } from "../../validations/auditLogValidation";
import prisma from "../../lib/prisma";

export const getAuditLogs = async (req: Request, res: Response) => {
  const parsed = getAuditLogsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors: parsed.error.issues,
    });
  }

  const { page, limit, entityType, actorId } = parsed.data;

  try {
    const where = {
      ...(entityType && { entityType }),
      ...(actorId && { actorId }),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          actor: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return res.status(200).json({
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
