import cron from "node-cron";
import prisma from "../lib/prisma";
import { SubscriptionStatus } from "@prisma/client";

/**
 * Runs daily at 9 AM.
 *
 * Finds all ACTIVE subscriptions renewing tomorrow and logs a reminder
 * notification. In production, replace the console.log with an email/push
 * notification call (e.g. SendGrid, Resend, Firebase).
 */
export function startRenewalReminderJob() {
  cron.schedule("0 9 * * *", async () => {
    console.log("[reminder-job] Running sendRenewalReminders...");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setHours(23, 59, 59, 999);

    try {
      const subscriptions = await prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          renewalDate: { gte: tomorrow, lte: dayAfter },
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      for (const sub of subscriptions) {
        // TODO: replace with real notification dispatch (email / push)
        console.log(
          `[reminder-job] Reminder → ${sub.user.email} | "${sub.name}" renews tomorrow for ${sub.amount}`,
        );

        await prisma.auditLog.create({
          data: {
            userId: sub.userId,
            action: "RENEWAL_REMINDER_SENT",
            entityType: "SUBSCRIPTION",
            entityId: sub.id,
          },
        });
      }

      console.log(`[reminder-job] Sent ${subscriptions.length} reminder(s).`);
    } catch (err) {
      console.error("[reminder-job] Error during sendRenewalReminders:", err);
    }
  });

  console.log("[reminder-job] Renewal reminder job scheduled (daily at 9 AM).");
}
