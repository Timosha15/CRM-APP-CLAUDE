import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, handleApiError } from "@/lib/api-helpers";
import { DEAL_STAGE_LABEL } from "@/lib/labels";
import type { DealStage } from "@prisma/client";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  value: z.coerce.number().min(0).optional(),
  stage: z.enum(["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]).optional(),
  probability: z.coerce.number().min(0).max(100).optional(),
  closeDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      company: true,
      contact: true,
      owner: { select: { id: true, name: true, avatarColor: true } },
      tasks: { orderBy: { dueDate: "asc" } },
      activities: {
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { name: true, avatarColor: true } } },
      },
    },
  });

  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deal);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;
  const { id } = await params;

  try {
    const body = updateSchema.parse(await req.json());
    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        ...body,
        closeDate: body.closeDate !== undefined ? (body.closeDate ? new Date(body.closeDate) : null) : undefined,
      },
    });

    if (body.stage && body.stage !== existing.stage) {
      await prisma.activity.create({
        data: {
          type: "STATUS_CHANGE",
          content: `Stage moved from ${DEAL_STAGE_LABEL[existing.stage as DealStage]} to ${DEAL_STAGE_LABEL[body.stage as DealStage]}.`,
          dealId: deal.id,
          companyId: deal.companyId,
          contactId: deal.contactId,
          ownerId: session!.userId,
        },
      });
    }

    return NextResponse.json(deal);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;

  await prisma.deal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
