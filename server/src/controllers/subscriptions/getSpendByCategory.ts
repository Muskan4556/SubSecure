import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { BillingCycle, SubscriptionStatus } from "@prisma/client";

export const getSpendByCategory = async (req: Request, res: Response) => {
  try {
    const subs = await prisma.subscription.findMany({
      where: {
        userId: req.userId,
        status: SubscriptionStatus.ACTIVE,
      },
      select: { amount: true, billingCycle: true, category: true },
    });

    const catMap = new Map<string, number>();
    for (const s of subs) {
      const monthly =
        s.billingCycle === BillingCycle.YEARLY
          ? Number(s.amount) / 12
          : Number(s.amount);
      catMap.set(s.category, (catMap.get(s.category) ?? 0) + monthly);
    }

    const monthlyTotal = Array.from(catMap.values()).reduce((a, b) => a + b, 0);

    const data = Array.from(catMap.entries())
      .map(([category, monthlyAmount]) => ({
        category,
        monthlyAmount: Math.round(monthlyAmount * 100) / 100,
        share: monthlyTotal > 0
          ? Math.round((monthlyAmount / monthlyTotal) * 100)
          : 0,
      }))
      .sort((a, b) => b.monthlyAmount - a.monthlyAmount);

    return res.status(200).json({
      message: "Category spend fetched successfully",
      data,
      monthlyTotal: Math.round(monthlyTotal * 100) / 100,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

