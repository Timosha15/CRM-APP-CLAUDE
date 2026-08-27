import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, handleApiError } from "@/lib/api-helpers";

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  value: z.coerce.number().min(0).default(0),
  stage: z.enum(["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]).optional(),
  probability: z.coerce.number().min(0).max(100).optional(),
  closeDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { error } = await requireSession();
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const stage = req.nextUrl.searchParams.get("stage");

  const deals = await prisma.deal.findMany({
    where: {
      AND: [
        q ? { title: { contains: q } } : {},
        stage ? { stage: stage as never } : {},
      ],
    },
    include: {
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      owner: { select: { id: true, name: true, avatarColor: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(deals);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = createSchema.parse(await req.json());
    const deal = await prisma.deal.create({
      data: {
        ...body,
        closeDate: body.closeDate ? new Date(body.closeDate) : null,
        ownerId: session!.userId,
      },
    });

    await prisma.activity.create({
      data: {
        type: "CREATED",
        content: `Deal "${deal.title}" created.`,
        dealId: deal.id,
        companyId: deal.companyId,
        contactId: deal.contactId,
        ownerId: session!.userId,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
