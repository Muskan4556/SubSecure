import { Request, Response } from "express";
import { getSubscriptionsQuerySchema } from "../../validations/subscriptionValidation";
import prisma from "../../lib/prisma";
import { Role } from "@prisma/client";

export const getSubscriptions = async (req: Request, res: Response) => {
  const parsedQuery = getSubscriptionsQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors: parsedQuery.error.issues,
    });
  }

  const { status } = parsedQuery.data;
  const isAdmin = req.userRole === Role.ADMIN;

  try {
    const where: any = {};

    if (!isAdmin) {
      where.userId = req.userId;
    }

    if (status) {
      where.status = status;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      message: "Subscriptions fetched successfully",
      data: subscriptions,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
