import { Request, Response } from "express";
import {
  subscriptionIdSchema,
  updateSubscriptionSchema,
} from "../../validations/subscriptionValidation";
import prisma from "../../lib/prisma";
import { SubscriptionStatus } from "@prisma/client";

export const updateSubscription = async (req: Request, res: Response) => {
  const parsedId = subscriptionIdSchema.safeParse({ id: req.params.id });
  if (!parsedId.success) {
    return res.status(400).json({
      message: "Invalid subscription ID",
      errors: parsedId.error.issues,
    });
  }

  const parsedBody = updateSubscriptionSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: parsedBody.error.issues,
    });
  }

  const { id } = parsedId.data;
  const { name, category, amount, billingCycle, renewalDate } = parsedBody.data;

  try {
    const subscription = await prisma.subscription.findUnique({ where: { id } });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      return res.status(400).json({
        message: "Cannot update a cancelled subscription",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedSubscription = await tx.subscription.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(category !== undefined && { category }),
          ...(amount !== undefined && { amount }),
          ...(billingCycle !== undefined && { billingCycle }),
          ...(renewalDate !== undefined && { renewalDate }),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: req.userId,
          action: "SUB_UPDATED",
          entityType: "SUBSCRIPTION",
          entityId: id,
          ipAddress: req.ip ?? null,
        },
      });

      return updatedSubscription;
    });

    return res.status(200).json({
      message: "Subscription updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
