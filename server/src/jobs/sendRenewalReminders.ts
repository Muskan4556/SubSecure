import cron from "node-cron";
import nodemailer from "nodemailer";
import prisma from "../lib/prisma";
import { SubscriptionStatus } from "@prisma/client";

const smtpEnabled = process.env.SMTP_ENABLED === "true";

const transporter = smtpEnabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

async function sendReminderEmail(
  to: string,
  name: string,
  subscriptionName: string,
  amount: number,
) {
  if (!transporter) return;

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

  await transporter.sendMail({
    from: `"SubSecure" <${process.env.SMTP_USER}>`,
    to,
    subject: `Reminder: "${subscriptionName}" renews tomorrow`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1a1a2e">Subscription Renewal Reminder</h2>
        <p>Hi ${name},</p>
        <p>
          Your subscription <strong>${subscriptionName}</strong> is scheduled to
          renew <strong>tomorrow</strong> for <strong>${formattedAmount}</strong>.
        </p>
        <p>
          Log in to <a href="${process.env.CLIENT_URL ?? "http://localhost:3000"}">SubSecure</a>
          to manage or cancel your subscription before it renews.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="font-size:12px;color:#888">
          You're receiving this because you have an active subscription on SubSecure.
        </p>
      </div>
    `,
  });
}

/**
 * Runs daily at 9 AM.
 *
 * Finds all ACTIVE subscriptions renewing tomorrow and sends each user
 * a reminder email via nodemailer (SMTP_ENABLED=true required).
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
        if (smtpEnabled) {
          try {
            await sendReminderEmail(
              sub.user.email,
              sub.user.name ?? sub.user.email,
              sub.name,
              Number(sub.amount),
            );
            console.log(
              `[reminder-job] Email sent → ${sub.user.email} | "${sub.name}"`,
            );
            await prisma.auditLog.create({
              data: {
                userId: sub.userId,
                action: "RENEWAL_REMINDER_SENT",
                entityType: "SUBSCRIPTION",
                entityId: sub.id,
              },
            });
          } catch (emailErr) {
            console.error(
              `[reminder-job] Failed to send email to ${sub.user.email}:`,
              emailErr,
            );
          }
        } else {
          console.log(
            `[reminder-job] (SMTP disabled) Reminder → ${sub.user.email} | "${sub.name}" renews tomorrow for ${sub.amount}`,
          );
        }
      }

      console.log(`[reminder-job] Processed ${subscriptions.length} reminder(s).`);
    } catch (err) {
      console.error("[reminder-job] Error during sendRenewalReminders:", err);
    }
  });

  console.log("[reminder-job] Renewal reminder job scheduled (daily at 9 AM).");
}
