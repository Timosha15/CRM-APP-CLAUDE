import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, handleApiError } from "@/lib/api-helpers";

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  status: z.enum(["LEAD", "PROSPECT", "CUSTOMER", "CHURNED"]).optional(),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      company: true,
      owner: { select: { id: true, name: true, avatarColor: true } },
      deals: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { dueDate: "asc" } },
      activities: {
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { name: true, avatarColor: true } }, deal: true },
      },
    },
  });

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;
  const { id } = await params;

  try {
    const body = updateSchema.parse(await req.json());
    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const contact = await prisma.contact.update({
      where: { id },
      data: { ...body, email: body.email === "" ? null : body.email },
    });

    if (body.status && body.status !== existing.status) {
      await prisma.activity.create({
        data: {
          type: "STATUS_CHANGE",
          content: `Status changed from ${existing.status} to ${body.status}.`,
          contactId: contact.id,
          companyId: contact.companyId,
          ownerId: session!.userId,
        },
      });
    }

    return NextResponse.json(contact);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;

  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
