import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, handleApiError } from "@/lib/api-helpers";

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  type: z.enum(["CALL", "EMAIL", "MEETING", "FOLLOW_UP", "TODO"]).optional(),
  dueDate: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { error } = await requireSession();
  if (error) return error;

  const filter = req.nextUrl.searchParams.get("filter");
  const contactId = req.nextUrl.searchParams.get("contactId");
  const dealId = req.nextUrl.searchParams.get("dealId");
  const companyId = req.nextUrl.searchParams.get("companyId");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  const conditions: Record<string, unknown>[] = [];
  if (contactId) conditions.push({ contactId });
  if (dealId) conditions.push({ dealId });
  if (companyId) conditions.push({ companyId });

  if (filter === "today") {
    conditions.push({ completed: false }, { dueDate: { gte: startOfToday, lt: endOfToday } });
  } else if (filter === "overdue") {
    conditions.push({ completed: false }, { dueDate: { lt: startOfToday } });
  } else if (filter === "upcoming") {
    conditions.push({ completed: false }, { dueDate: { gte: endOfToday } });
  } else if (filter === "completed") {
    conditions.push({ completed: true });
  } else if (filter === "open") {
    conditions.push({ completed: false });
  }

  const tasks = await prisma.task.findMany({
    where: { AND: conditions },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true } },
      owner: { select: { id: true, name: true, avatarColor: true } },
    },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = createSchema.parse(await req.json());
    const task = await prisma.task.create({
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        ownerId: session!.userId,
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
