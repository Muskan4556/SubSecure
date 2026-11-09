import prisma from "../prisma";

/** Returns today's date string in Pacific Time (quota resets at PT midnight) */
function todayPT(): string {
  return new Date()
    .toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

export async function getDailyCount(): Promise<number> {
  const date = todayPT();
  const record = await prisma.aiDailyCount.findUnique({ where: { date } });
  return record?.count ?? 0;
}

export async function incrementDailyCount(): Promise<void> {
  const date = todayPT();
  await prisma.aiDailyCount.upsert({
    where: { date },
    update: { count: { increment: 1 } },
    create: { date, count: 1 },
  });
}

