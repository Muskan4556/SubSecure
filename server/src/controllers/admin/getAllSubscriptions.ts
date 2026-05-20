import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { SubscriptionStatus } from "@prisma/client";

export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const whereClause = status ? { status: status as SubscriptionStatus } : {};

    const subscriptions = await prisma.subscription.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const active = subscriptions.filter((s) => s.status === SubscriptionStatus.ACTIVE);

    const monthlyVolume = Math.round(
      active
        .filter((s) => s.billingCycle === "MONTHLY")
        .reduce((sum, s) => sum + Number(s.amount), 0) +
        active
          .filter((s) => s.billingCycle === "YEARLY")
          .reduce((sum, s) => sum + Number(s.amount) / 12, 0),
    );

    return res.status(200).json({
      data: subscriptions,
      stats: {
        totalMonthlyVolume: monthlyVolume,
        totalActive: active.length,
        totalCancelled: subscriptions.filter(
          (s) => s.status === SubscriptionStatus.CANCELLED,
        ).length,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
