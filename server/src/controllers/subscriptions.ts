import { Request, Response } from "express";
import {
  createSubscriptionSchema,
  getSubscriptionsQuerySchema,
  subscriptionIdSchema,
  updateSubscriptionSchema,
} from "../validations/subscriptionValidation";
import prisma from "../lib/prisma";
import {
  AuditEntityType,
  Prisma,
  Role,
  SubscriptionStatus,
} from "@prisma/client";

export const getSubscriptions = async (req: Request, res: Response) => {
  const parsedQuery = getSubscriptionsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors: parsedQuery.error.issues,
    });
  }
  const { status, page, limit } = parsedQuery.data;
  const isAdmin = req.userRole === Role.ADMIN;

  try {
    const where = {
      ...(!isAdmin && { ownerId: req.userId }),
      ...(status && { status }),
    };

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.subscription.count({
        where,
      }),
    ]);

    return res.status(200).json({
      message: "Subscriptions fetched successfully",
      data: subscriptions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
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
    // duplicate check
    const existing = await prisma.subscription.findFirst({
      where: {
        ownerId: req.userId,
        toolName: {
          equals: toolName,
          mode: "insensitive",
        },
        status: {
          notIn: [SubscriptionStatus.CANCELLED],
        },
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
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSubscriptionById = async (req: Request, res: Response) => {
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
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // user can only view their own, admin can view any
    if (!isAdmin && subscription.ownerId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({ data: subscription });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


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
  const { toolName, cost, renewalDate } = parsedBody.data;
  const isAdmin = req.userRole === Role.ADMIN;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (!isAdmin && subscription.ownerId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      return res.status(400).json({
        message: "Cannot update a cancelled subscription",
      });
    }

    if (!isAdmin && subscription.status !== SubscriptionStatus.ACTIVE) {
      return res.status(400).json({
        message:
          "Cannot update a subscription that is scheduled for cancellation. Undo the cancellation first.",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedSubscription = await tx.subscription.update({
        where: { id },
        data: {
          ...(toolName !== undefined && { toolName }),
          ...(cost !== undefined && { cost }),
          ...(renewalDate !== undefined && { renewalDate }),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.userId,
          entityType: AuditEntityType.SUBSCRIPTION,
          entityId: id,
          action: "SUBSCRIPTION_UPDATED",
          before: subscription,
          after: updatedSubscription,
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
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

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

      await tx.subscription.delete({
        where: { id },
      });
    });

    return res.status(200).json({
      message: "Subscription deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getSubscriptionStats = async (req: Request, res: Response) => {
  const isAdmin = req.userRole === Role.ADMIN;

  try {
    const where = {
      ...(!isAdmin && { ownerId: req.userId }),
    };

    const [totalActive, totalCancelled, totalScheduled, activeCost] =
      await Promise.all([
        prisma.subscription.count({
          where: { ...where, status: SubscriptionStatus.ACTIVE },
        }),
        prisma.subscription.count({
          where: { ...where, status: SubscriptionStatus.CANCELLED },
        }),
        prisma.subscription.count({
          where: { ...where, status: SubscriptionStatus.CANCEL_SCHEDULED },
        }),
        prisma.subscription.aggregate({
          where: { ...where, status: SubscriptionStatus.ACTIVE },
          _sum: { cost: true },
        }),
      ]);

    return res.status(200).json({
      data: {
        totalActive,
        totalCancelled,
        totalScheduled,
        totalMonthlyCost: activeCost._sum.cost ?? 0,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

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
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // ownership check — user can only cancel their own
    if (!isAdmin && subscription.ownerId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // nothing to do if already cancelled
    if (subscription.status === SubscriptionStatus.CANCELLED) {
      return res.status(400).json({
        message: "Subscription is already cancelled",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedSubscription = await tx.subscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelAt: null, // clear any scheduled cancel if force cancelled
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.userId,
          entityType: AuditEntityType.SUBSCRIPTION,
          entityId: id,
          action: isAdmin
            ? "SUBSCRIPTION_FORCE_CANCELLED"
            : "SUBSCRIPTION_CANCELLED",
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

export const getUpcomingRenewals = async (req: Request, res: Response) => {
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
