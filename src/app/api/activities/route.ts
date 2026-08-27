import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, handleApiError } from "@/lib/api-helpers";

const createSchema = z.object({
  type: z.enum(["NOTE", "CALL", "EMAIL"]).default("NOTE"),
  content: z.string().min(1, "Note can't be empty"),
  contactId: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = createSchema.parse(await req.json());
    const activity = await prisma.activity.create({
      data: { ...body, ownerId: session!.userId },
      include: { owner: { select: { name: true, avatarColor: true } } },
    });
    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
