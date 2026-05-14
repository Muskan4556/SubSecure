import { Request, Response } from "express";
import { subscriptionIdSchema } from "../../validations/subscriptionValidation";
import prisma from "../../lib/prisma";
import { AuditEntityType, Prisma } from "@prisma/client";

export const deleteSubscription = async (req: Request, res: Response) => {
  const parsedId = subscriptionIdSchema.safeParse({ id: req.params.id });
  if (!parsedId.success) {
    return res.status(400).json({
      message: "Invalid subscription ID",
      errors: parsedId.error.issues,
    });
  }

  const { id } = parsedId.data;

  try {
    const subscription = await prisma.subscription.findUnique({ where: { id } });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          actorId: req.userId,
          entityType: AuditEntityType.SUBSCRIPTION,
          entityId: id,
          action: "SUBSCRIPTION_DELETED",
          before: subscription,
          after: Prisma.JsonNull,
        },
      });

      await tx.subscription.delete({ where: { id } });
    });

    return res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
