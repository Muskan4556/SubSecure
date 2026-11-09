import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { detectCategory } from "../../lib/categorization/rules";
import { CategorySource } from "@prisma/client";

export const categorizeBackfill = async (req: Request, res: Response) => {
  try {
    // Only update subscriptions whose category came from a rule
    const ruleSet = await prisma.subscription.findMany({
      where: {
        userId: req.userId,
        categorySource: CategorySource.RULE,
      },
      select: { id: true, name: true, category: true },
    });

    let changed = 0;
    for (const sub of ruleSet) {
      const detected = detectCategory(sub.name);
      if (detected !== sub.category) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { category: detected },
        });
        changed++;
      }
    }

    return res.status(200).json({
      message: `Backfill complete. ${changed} subscription${changed !== 1 ? "s" : ""} updated.`,
      data: { total: ruleSet.length, changed },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

