import { Request, Response } from "express";
import { subscriptionIdSchema } from "../../validations/subscriptionValidation";
import prisma from "../../lib/prisma";
import { AuditEntityType, Role, SubscriptionStatus } from "@prisma/client";

export const cancelSubscription = async (req: Request, res: Response) => {
  const parsedId = subscriptionIdSchema.safeParse({ id: req.params.id });
  if (!parsedId.success) {
    return res.status(400).json({
      message: "Invalid subscription ID",
      errors: parsedId.error.issues,
    });
  }

  const { id } = parsedId.data;
  const isAdmin = req.userRole === Role.ADMIN;

  try {
    const subscription = await prisma.subscription.findUnique({ where: { id } });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (!isAdmin && subscription.ownerId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      return res.status(400).json({ message: "Subscription is already cancelled" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedSubscription = await tx.subscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelAt: null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.userId,
          entityType: AuditEntityType.SUBSCRIPTION,
          entityId: id,
          action: isAdmin ? "SUBSCRIPTION_FORCE_CANCELLED" : "SUBSCRIPTION_CANCELLED",
          before: subscription,
          after: updatedSubscription,
        },
      });

      return updatedSubscription;
    });

    return res.status(200).json({
      message: "Subscription cancelled successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
