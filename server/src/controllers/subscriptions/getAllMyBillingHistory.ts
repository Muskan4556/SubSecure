import { Request, Response } from "express";
import prisma from "../../lib/prisma";

export const getAllMyBillingHistory = async (req: Request, res: Response) => {
  try {
    const history = await prisma.billingHistory.findMany({
      where: {
        subscription: { userId: req.userId },
      },
      orderBy: { billingDate: "desc" },
      include: {
        subscription: {
          select: { id: true, name: true, billingCycle: true },
        },
      },
    });

    return res.status(200).json({
      message: "Billing history fetched successfully",
      data: history,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
