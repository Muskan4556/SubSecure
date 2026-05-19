import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { Role, SubscriptionStatus } from "@prisma/client";
import { getUpcomingRenewalsQuerySchema } from "../../validations/subscriptionValidation";

export const getUpcomingRenewals = async (req: Request, res: Response) => {
  const parsedQuery = getUpcomingRenewalsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors: parsedQuery.error.issues,
    });
  }

  const { days } = parsedQuery.data;
  const isAdmin = req.userRole === Role.ADMIN;

  try {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);

    const where = {
      ...(!isAdmin && { userId: req.userId }),
      status: SubscriptionStatus.ACTIVE,
      renewalDate: { gte: now, lte: future },
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
