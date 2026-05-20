import cron from "node-cron";
import prisma from "../lib/prisma";
import { BillingCycle, BillingStatus, SubscriptionStatus } from "@prisma/client";

/**
 * Runs daily at midnight.
 *
 * For every ACTIVE subscription whose renewalDate falls on today:
 *  1. Creates a BillingHistory record (PAID).
 *  2. Advances renewalDate by 1 month (MONTHLY) or 1 year (YEARLY).
 *  3. Creates an audit log.
 */
export function startRecurringBillingJob() {
  cron.schedule("0 0 * * *", async () => {
    console.log("[billing-job] Running processRecurringBilling...");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    try {
      const subscriptions = await prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          renewalDate: { gte: todayStart, lte: todayEnd },
        },
      });

      for (const sub of subscriptions) {
        const nextRenewalDate = new Date(sub.renewalDate);
        if (sub.billingCycle === BillingCycle.MONTHLY) {
          nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
        } else {
          nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
        }

        await prisma.$transaction(async (tx) => {
          await tx.billingHistory.create({
            data: {
              subscriptionId: sub.id,
              amount: sub.amount,
              billingDate: new Date(),
              status: BillingStatus.PAID,
            },
          });

          await tx.subscription.update({
            where: { id: sub.id },
            data: { renewalDate: nextRenewalDate },
          });

          await tx.auditLog.create({
            data: {
              userId: sub.userId,
              action: "RECURRING_BILLING_PROCESSED",
              entityType: "SUBSCRIPTION",
              entityId: sub.id,
            },
          });
        });

        console.log(`[billing-job] Processed billing for subscription: ${sub.id}`);
      }

      console.log(`[billing-job] Done. Processed ${subscriptions.length} subscription(s).`);
    } catch (err) {
      console.error("[billing-job] Error during processRecurringBilling:", err);
    }
  });

  console.log("[billing-job] Recurring billing job scheduled (daily at midnight).");
}
