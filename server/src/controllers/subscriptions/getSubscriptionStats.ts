import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { BillingCycle, Role, SubscriptionStatus } from "@prisma/client";

export const getSubscriptionStats = async (req: Request, res: Response) => {
  const isAdmin = req.userRole === Role.ADMIN;

  try {
    const where = {
      ...(!isAdmin && { userId: req.userId }),
    };

    const [totalActive, totalCancelled, monthlyAggregate, yearlyAggregate] =
      await Promise.all([
        prisma.subscription.count({
          where: { ...where, status: SubscriptionStatus.ACTIVE },
        }),
        prisma.subscription.count({
          where: { ...where, status: SubscriptionStatus.CANCELLED },
        }),
        prisma.subscription.aggregate({
          where: {
            ...where,
            status: SubscriptionStatus.ACTIVE,
            billingCycle: BillingCycle.MONTHLY,
          },
          _sum: { amount: true },
        }),
        prisma.subscription.aggregate({
          where: {
            ...where,
            status: SubscriptionStatus.ACTIVE,
            billingCycle: BillingCycle.YEARLY,
          },
          _sum: { amount: true },
        }),
      ]);

    const monthlyFromYearly = Number(yearlyAggregate._sum.amount ?? 0) / 12;
    const totalMonthlySpend =
      Number(monthlyAggregate._sum.amount ?? 0) + monthlyFromYearly;

    return res.status(200).json({
      data: {
        totalActive,
        totalCancelled,
        totalMonthlySpend: Math.round(totalMonthlySpend * 100) / 100,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
