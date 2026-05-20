import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { SubscriptionStatus, UserStatus } from "@prisma/client";

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
      prisma.subscription.count({ where: { status: SubscriptionStatus.CANCELLED } }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return res.status(200).json({
      data: {
        users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          cancelled: cancelledSubscriptions,
        },
        security: {
          auditEventsLast24h: recentAuditLogs,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
