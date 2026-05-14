import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { Role, SubscriptionStatus } from "@prisma/client";

export const getUpcomingRenewals = async (req: Request, res: Response) => {
  const isAdmin = req.userRole === Role.ADMIN;

  try {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const where = {
      ...(!isAdmin && { ownerId: req.userId }),
      status: SubscriptionStatus.ACTIVE,
      renewalDate: { gte: now, lte: in30Days },
    };

    const renewals = await prisma.subscription.findMany({
      where,
      orderBy: { renewalDate: "asc" },
    });

    return res.status(200).json({
      message: "Upcoming renewals fetched successfully",
      data: renewals,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
