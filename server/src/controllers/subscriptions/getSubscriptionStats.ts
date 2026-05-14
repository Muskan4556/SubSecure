import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { Role, SubscriptionStatus } from "@prisma/client";

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
