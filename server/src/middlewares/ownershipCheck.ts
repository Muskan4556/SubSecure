import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { Role } from "@prisma/client";

export const ownershipCheck = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // ADMINs bypass ownership checks
  if (req.userRole === Role.ADMIN) {
    return next();
  }

  const id = req.params.id as string | undefined;
  if (!id) return next();

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (subscription.userId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
