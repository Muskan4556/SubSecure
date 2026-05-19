import { Request, Response } from "express";
import { subscriptionIdSchema } from "../../validations/subscriptionValidation";
import prisma from "../../lib/prisma";

export const getBillingHistory = async (req: Request, res: Response) => {
  const parsedId = subscriptionIdSchema.safeParse({ id: req.params.id });
  if (!parsedId.success) {
    return res.status(400).json({
      message: "Invalid subscription ID",
      errors: parsedId.error.issues,
    });
  }

  const { id } = parsedId.data;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const history = await prisma.billingHistory.findMany({
      where: { subscriptionId: id },
      orderBy: { billingDate: "desc" },
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
