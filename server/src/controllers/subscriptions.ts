import { Request, Response } from "express";
import {
  createSubscriptionSchema,
  subscriptionIdSchema,
} from "../validations/subscriptionValidation";
import prisma from "../lib/prisma";
import { AuditEntityType, Prisma, SubscriptionStatus } from "@prisma/client";

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

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
    const newSubscription = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          toolName,
          cost,
          renewalDate,
          ownerId: req.userId,
        },
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
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getSubscriptionById = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const approveSubscription = async (req: Request, res: Response) => {
  const parsedId = subscriptionIdSchema.safeParse(req.params);

  if (!parsedId.success) {
    return res.status(400).json({
      message: "Invalid subscription ID",
      errors: parsedId.error.issues,
    });
  }
  const { id } = parsedId.data;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: {
        id: id as string,
      },
    });

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    const updatedSubscription = await prisma.$transaction(async (tx) => {
      const updatedSubscription = await tx.subscription.update({
        where: {
          id: id as string,
        },
        data: {
          status: SubscriptionStatus.ACTIVE,
          approvedById: req.userId,
          approvedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.userId,
          entityType: AuditEntityType.SUBSCRIPTION,
          entityId: updatedSubscription.id,
          action: "SUBSCRIPTION_APPROVED",
          before: { status: subscription.status },
          after: updatedSubscription,
        },
      });

      return updatedSubscription;
    });

    return res.status(200).json({
      message: "Subscription approved successfully",
      data: updatedSubscription,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const deleteSubscription = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getSubscriptionStats = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUpcomingRenewals = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// USER: ACTIVE → CANCEL_SCHEDULED
// sets cancelAt = renewalDate; cron job finalises + sends reminder notification
export const scheduleCancel = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// USER: CANCEL_SCHEDULED → ACTIVE
// clears cancelAt; only possible before renewalDate is reached
export const undoScheduleCancel = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
