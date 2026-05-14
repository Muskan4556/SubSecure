import { Request, Response } from "express";
import { createSubscriptionSchema } from "../../validations/subscriptionValidation";
import prisma from "../../lib/prisma";
import { AuditEntityType, Prisma, SubscriptionStatus } from "@prisma/client";

export const createSubscription = async (req: Request, res: Response) => {
  const parsedData = createSubscriptionSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: parsedData.error.issues,
    });
  }

  const { toolName, cost, renewalDate } = parsedData.data;

  try {
    const existing = await prisma.subscription.findFirst({
      where: {
        ownerId: req.userId,
        toolName: { equals: toolName, mode: "insensitive" },
        status: { notIn: [SubscriptionStatus.CANCELLED] },
      },
    });

    if (existing) {
      return res.status(409).json({
        message: `You already have an active subscription for ${toolName}`,
        existingSubscriptionId: existing.id,
      });
    }

    const newSubscription = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: { toolName, cost, renewalDate, ownerId: req.userId },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.userId,
          entityType: AuditEntityType.SUBSCRIPTION,
          entityId: subscription.id,
          action: "SUBSCRIPTION_CREATED",
          before: Prisma.JsonNull,
          after: subscription,
        },
      });

      return subscription;
    });

    return res.status(201).json({
      message: "Subscription created successfully",
      data: newSubscription,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
