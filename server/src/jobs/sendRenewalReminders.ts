import cron from "node-cron";
import nodemailer from "nodemailer";
import prisma from "../lib/prisma";
import { BillingCycle, SubscriptionStatus } from "@prisma/client";

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

const REMINDER_WINDOWS: Record<BillingCycle, number[]> = {
  [BillingCycle.MONTHLY]: [7, 1],
  [BillingCycle.YEARLY]: [30, 14, 3, 1],
};

type ReminderContext = {
  daysUntil: number;
  billingCycle: BillingCycle;
  subscriptionName: string;
  formattedAmount: string;
  userName: string;
  clientUrl: string;
};

function buildEmailContent(ctx: ReminderContext): {
  subject: string;
  html: string;
} {
  const { daysUntil, billingCycle, subscriptionName, formattedAmount, userName, clientUrl } = ctx;

  // --- Subject line ---
  let subject: string;
  if (daysUntil === 1) {
    subject = `⚠️ Final reminder: "${subscriptionName}" renews tomorrow`;
  } else if (daysUntil <= 3) {
    subject = `Urgent: "${subscriptionName}" renews in ${daysUntil} days`;
  } else {
    subject = `Heads up: "${subscriptionName}" renews in ${daysUntil} days`;
  }

  // --- When label for email body ---
  const whenLabel =
    daysUntil === 1
      ? "<strong>tomorrow</strong>"
      : `in <strong>${daysUntil} days</strong>`;

  // --- Extra message block depending on stage ---
  let extraMessage = "";
  if (billingCycle === BillingCycle.YEARLY) {
    if (daysUntil === 30) {
      extraMessage = `<p style="color:#555">
        This is your early notice to review last year's value, confirm your payment details are up to date, and decide whether to continue.
      </p>`;
    } else if (daysUntil === 14) {
      extraMessage = `<p style="color:#555">
        Please make sure your payment method is valid. If you need to make changes, now is a great time to do so.
      </p>`;
    } else if (daysUntil === 3) {
      extraMessage = `<p style="color:#f59e0b">
        <strong>Action needed:</strong> Your subscription will be charged in 3 days. Cancel now if you'd like to avoid the renewal charge.
      </p>`;
    } else if (daysUntil === 1) {
      extraMessage = `<p style="color:#ef4444">
        <strong>Last chance:</strong> This is your final reminder. Cancel before midnight tonight to avoid being charged.
      </p>`;
    }
  } else {
    // MONTHLY
    if (daysUntil === 7) {
      extraMessage = `<p style="color:#555">
        Just a heads-up — your monthly plan will renew soon. No action needed if you'd like to continue.
      </p>`;
    } else if (daysUntil === 1) {
      extraMessage = `<p style="color:#ef4444">
        <strong>Last chance:</strong> This is your final reminder before tomorrow's charge.
      </p>`;
    }
  }

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
      <h2 style="color:#1a1a2e">Subscription Renewal Reminder</h2>
      <p>Hi ${userName},</p>
      <p>
        Your <strong>${billingCycle === BillingCycle.YEARLY ? "annual" : "monthly"}</strong> subscription
        <strong>${subscriptionName}</strong> is scheduled to renew ${whenLabel}
        for <strong>${formattedAmount}</strong>.
      </p>
      ${extraMessage}
      <p>
        <a href="${clientUrl}" style="background:#10b981;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">
          Manage Subscription →
        </a>
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <p style="font-size:12px;color:#888">
        You're receiving this because you have an active subscription on SubSecure.
      </p>
    </div>
  `;

  return { subject, html };
}

async function sendReminderEmail(
  to: string,
  ctx: ReminderContext,
): Promise<void> {
  if (!transporter) return;

  const { subject, html } = buildEmailContent(ctx);

  await transporter.sendMail({
    from: `"SubSecure" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

/**
 * Returns the start and end of a day that is `daysOffset` from today.
 *  e.g. daysOffset=7 → the full calendar day 7 days from now.
 */
function getTargetDayWindow(daysOffset: number): { from: Date; to: Date } {
  const from = new Date();
  from.setDate(from.getDate() + daysOffset);
  from.setHours(0, 0, 0, 0);

  const to = new Date(from);
  to.setHours(23, 59, 59, 999);

  return { from, to };
}

/**
 * Runs daily at 9:00 AM (server local time).
 *
 * For MONTHLY subscriptions: sends at 7 days and 1 day before renewal.
 * For YEARLY subscriptions:  sends at 30, 14, 3, and 1 day before renewal.
 */
export function startRenewalReminderJob() {
  cron.schedule("0 9 * * *", async () => {
    console.log("[reminder-job] Running sendRenewalReminders...");

    const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
    let totalSent = 0;

    try {
      // Iterate over each billing cycle and its configured reminder windows
      for (const [cycle, windows] of Object.entries(REMINDER_WINDOWS) as [
        BillingCycle,
        number[],
      ][]) {
        for (const daysUntil of windows) {
          const { from, to } = getTargetDayWindow(daysUntil);

          const subscriptions = await prisma.subscription.findMany({
            where: {
              status: SubscriptionStatus.ACTIVE,
              billingCycle: cycle,
              renewalDate: { gte: from, lte: to },
            },
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          });

          for (const sub of subscriptions) {
            const formattedAmount = new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(Number(sub.amount));

            const ctx: ReminderContext = {
              daysUntil,
              billingCycle: cycle,
              subscriptionName: sub.name,
              formattedAmount,
              userName: sub.user.name ?? sub.user.email,
              clientUrl,
            };

            if (smtpEnabled) {
              try {
                await sendReminderEmail(sub.user.email, ctx);

                console.log(
                  `[reminder-job] Email sent → ${sub.user.email} | "${sub.name}" | ${cycle} | ${daysUntil}d before`,
                );

                await prisma.auditLog.create({
                  data: {
                    userId: sub.userId,
                    action: "RENEWAL_REMINDER_SENT",
                    entityType: "SUBSCRIPTION",
                    entityId: sub.id,
                  },
                });

                totalSent++;
              } catch (emailErr) {
                console.error(
                  `[reminder-job] Failed to send to ${sub.user.email} | "${sub.name}":`,
                  emailErr,
                );
              }
            } else {
              // SMTP disabled — log to console only (useful in development)
              const { subject } = buildEmailContent(ctx);
              console.log(
                `[reminder-job] (SMTP disabled) Would send: "${subject}" → ${sub.user.email}`,
              );
              totalSent++;
            }
          }
        }
      }

      console.log(`[reminder-job] Done. Sent ${totalSent} reminder(s).`);
    } catch (err) {
      console.error("[reminder-job] Error during sendRenewalReminders:", err);
    }
  });

  console.log("[reminder-job] Renewal reminder job scheduled (daily at 9 AM).");
  console.log("[reminder-job] Schedule: MONTHLY → [7d, 1d] | YEARLY → [30d, 14d, 3d, 1d]");
}
