import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { getAuditLogsQuerySchema } from "../../validations/auditLogValidation";

export const getAuditLogs = async (req: Request, res: Response) => {
  const parsed = getAuditLogsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors: parsed.error.issues,
    });
  }

  const { userId, action, entityType } = parsed.data;

  try {
    const where = {
      ...(userId && { userId }),
      ...(action && { action }),
      ...(entityType && { entityType }),
    };

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return res.status(200).json({
      message: "Audit logs fetched successfully",
      data: logs,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
