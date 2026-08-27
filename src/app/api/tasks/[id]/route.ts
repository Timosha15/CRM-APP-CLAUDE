import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, handleApiError } from "@/lib/api-helpers";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  type: z.enum(["CALL", "EMAIL", "MEETING", "FOLLOW_UP", "TODO"]).optional(),
  dueDate: z.string().optional().nullable(),
  completed: z.boolean().optional(),
  contactId: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;

  try {
    const body = updateSchema.parse(await req.json());
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...body,
        dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : undefined,
        completedAt: body.completed !== undefined ? (body.completed ? new Date() : null) : undefined,
      },
    });
    return NextResponse.json(task);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
