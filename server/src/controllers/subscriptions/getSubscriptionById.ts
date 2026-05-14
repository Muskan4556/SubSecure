import { Request, Response } from "express";
import { subscriptionIdSchema } from "../../validations/subscriptionValidation";
import prisma from "../../lib/prisma";
import { Role } from "@prisma/client";

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
    const subscription = await prisma.subscription.findUnique({ where: { id } });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (!isAdmin && subscription.ownerId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({ data: subscription });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
