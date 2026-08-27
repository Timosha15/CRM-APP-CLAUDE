import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, handleApiError } from "@/lib/api-helpers";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, avatarColor: true } },
      contacts: { orderBy: { createdAt: "desc" } },
      deals: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { dueDate: "asc" }, include: { contact: true, deal: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { owner: { select: { name: true, avatarColor: true } }, contact: true, deal: true },
      },
    },
  });

  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(company);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;

  try {
    const body = updateSchema.parse(await req.json());
    const company = await prisma.company.update({ where: { id }, data: body });
    return NextResponse.json(company);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;

  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
