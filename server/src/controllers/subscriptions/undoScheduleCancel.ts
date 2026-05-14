import { Request, Response } from "express";
import { subscriptionIdSchema } from "../../validations/subscriptionValidation";
import prisma from "../../lib/prisma";
import { AuditEntityType, SubscriptionStatus } from "@prisma/client";

// USER: CANCEL_SCHEDULED → ACTIVE
// Clears the scheduled cancellation; only possible before renewalDate is reached
export const undoScheduleCancel = async (req: Request, res: Response) => {
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

    if (subscription.ownerId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (subscription.status !== SubscriptionStatus.CANCEL_SCHEDULED) {
      return res.status(400).json({
        message: `Cannot undo cancellation for a subscription with status: ${subscription.status}`,
      });
    }

    // Prevent undo if the renewal date has already passed
    if (subscription.cancelAt && subscription.cancelAt <= new Date()) {
      return res.status(400).json({
        message: "Cannot undo cancellation — the renewal date has already passed",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedSubscription = await tx.subscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          cancelAt: null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.userId,
          entityType: AuditEntityType.SUBSCRIPTION,
          entityId: id,
          action: "SUBSCRIPTION_CANCEL_UNDONE",
          before: subscription,
          after: updatedSubscription,
        },
      });

      return updatedSubscription;
    });

    return res.status(200).json({
      message: "Cancellation undone. Subscription is active again.",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
