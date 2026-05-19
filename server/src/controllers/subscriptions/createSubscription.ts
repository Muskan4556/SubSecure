import { Request, Response } from "express";
import { createSubscriptionSchema } from "../../validations/subscriptionValidation";
import prisma from "../../lib/prisma";
import {
  BillingCycle,
  BillingStatus,
  SubscriptionStatus,
} from "@prisma/client";

export function advanceByOneCycle(date: Date, cycle: BillingCycle): void {
  if (cycle === BillingCycle.MONTHLY) {
    date.setMonth(date.getMonth() + 1);
  } else {
    date.setFullYear(date.getFullYear() + 1);
  }
}

export const createSubscription = async (req: Request, res: Response) => {
  const parsedData = createSubscriptionSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: parsedData.error.issues,
    });
  }

  const { name, category, amount, billingCycle, startDate } = parsedData.data;

  try {
    const existing = await prisma.subscription.findFirst({
      where: {
        userId: req.userId,
        name: { equals: name, mode: "insensitive" },
        status: { not: SubscriptionStatus.CANCELLED },
      },
    });

    if (existing) {
      return res.status(409).json({
        message: `You already have an active subscription for "${name}"`,
        existingSubscriptionId: existing.id,
      });
    }

    const today = new Date();
    // setHours(hours, minutes, seconds, milliseconds)
    today.setHours(23, 59, 59, 999);

    const billingDates: Date[] = [];
    const cursor = new Date(startDate);

    while (cursor <= today) {
      billingDates.push(new Date(cursor));
      advanceByOneCycle(cursor, billingCycle);
    }

    // cursor is now the first future date
    const renewalDate = new Date(cursor);

    const result = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          name,
          category: category ?? null,
          amount,
          billingCycle,
          renewalDate,
          userId: req.userId,
        },
      });

      // Bulk-create all backfilled PAID billing entries
      await tx.billingHistory.createMany({
        data: billingDates.map((billingDate) => ({
          subscriptionId: subscription.id,
          amount: subscription.amount,
          billingDate,
          status: BillingStatus.PAID,
        })),
      });

      await tx.auditLog.create({
        data: {
          userId: req.userId,
          action: "SUB_CREATED",
          entityType: "SUBSCRIPTION",
          entityId: subscription.id,
          ipAddress: req.ip ?? null,
        },
      });

      return subscription;
    });

    return res.status(201).json({
      message: "Subscription created successfully",
      data: result,
      billingEntriesCreated: billingDates.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
