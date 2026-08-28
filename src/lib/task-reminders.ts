import { prisma } from "@/lib/db";
import { sendEmail, taskDigestHtml, isEmailConfigured } from "@/lib/email";

export async function sendTaskDigestForUser(userId: string, opts: { force?: boolean } = {}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { sent: false, reason: "user-not-found" as const };
  if (!isEmailConfigured()) return { sent: false, reason: "email-not-configured" as const };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const remindedCutoff = opts.force ? undefined : startOfToday;

  const [overdue, dueToday] = await Promise.all([
    prisma.task.findMany({
      where: {
        ownerId: userId,
        completed: false,
        dueDate: { lt: startOfToday },
        ...(remindedCutoff ? { OR: [{ reminderSentAt: null }, { reminderSentAt: { lt: remindedCutoff } }] } : {}),
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.task.findMany({
      where: {
        ownerId: userId,
        completed: false,
        dueDate: { gte: startOfToday, lt: endOfToday },
        ...(remindedCutoff ? { OR: [{ reminderSentAt: null }, { reminderSentAt: { lt: remindedCutoff } }] } : {}),
      },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  if (overdue.length === 0 && dueToday.length === 0) {
    return { sent: false, reason: "nothing-due" as const };
  }

  try {
    await sendEmail({
      to: user.email,
      subject:
        overdue.length > 0
          ? `${overdue.length + dueToday.length} tasks need your attention`
          : `${dueToday.length} ${dueToday.length === 1 ? "task is" : "tasks are"} due today`,
      html: taskDigestHtml({ userName: user.name, overdue, dueToday }),
    });
  } catch (err) {
    return {
      sent: false,
      reason: "send-failed" as const,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }

  const allIds = [...overdue, ...dueToday].map((t) => t.id);
  await prisma.task.updateMany({ where: { id: { in: allIds } }, data: { reminderSentAt: now } });

  return { sent: true, overdueCount: overdue.length, dueTodayCount: dueToday.length };
}

export async function sendTaskDigestForAllUsers() {
  const users = await prisma.user.findMany({ select: { id: true } });
  const results = [];
  for (const u of users) {
    const result = await sendTaskDigestForUser(u.id);
    results.push({ userId: u.id, ...result });
  }
  return results;
}
