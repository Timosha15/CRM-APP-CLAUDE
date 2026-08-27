import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/api-helpers";
import { DEAL_STAGES } from "@/lib/labels";
import type { DealStage } from "@prisma/client";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [contactCount, companyCount, allDeals, dueToday, overdue, recentActivities, upcomingTasks] =
    await Promise.all([
      prisma.contact.count(),
      prisma.company.count(),
      prisma.deal.findMany({ select: { value: true, stage: true, updatedAt: true } }),
      prisma.task.count({
        where: { completed: false, dueDate: { gte: startOfToday, lt: endOfToday } },
      }),
      prisma.task.count({
        where: { completed: false, dueDate: { lt: startOfToday } },
      }),
      prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          owner: { select: { name: true, avatarColor: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          company: { select: { id: true, name: true } },
          deal: { select: { id: true, title: true } },
        },
      }),
      prisma.task.findMany({
        where: { completed: false },
        orderBy: { dueDate: "asc" },
        take: 6,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
          deal: { select: { id: true, title: true } },
        },
      }),
    ]);

  const openStages: DealStage[] = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION"];
  const openDeals = allDeals.filter((d) => openStages.includes(d.stage));
  const openPipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);

  const wonThisMonth = allDeals.filter(
    (d) => d.stage === "WON" && d.updatedAt >= startOfMonth,
  );
  const wonThisMonthValue = wonThisMonth.reduce((sum, d) => sum + d.value, 0);

  const dealsByStage = DEAL_STAGES.map((stage) => {
    const inStage = allDeals.filter((d) => d.stage === stage);
    return {
      stage,
      count: inStage.length,
      value: inStage.reduce((sum, d) => sum + d.value, 0),
    };
  });

  return NextResponse.json({
    contactCount,
    companyCount,
    openDealsCount: openDeals.length,
    openPipelineValue,
    wonThisMonthValue,
    wonThisMonthCount: wonThisMonth.length,
    tasksDueToday: dueToday,
    tasksOverdue: overdue,
    dealsByStage,
    recentActivities,
    upcomingTasks,
  });
}
