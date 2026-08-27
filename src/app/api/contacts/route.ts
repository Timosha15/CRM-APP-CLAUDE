import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, handleApiError } from "@/lib/api-helpers";

const createSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  status: z.enum(["LEAD", "PROSPECT", "CUSTOMER", "CHURNED"]).optional(),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { error } = await requireSession();
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const status = req.nextUrl.searchParams.get("status");
  const companyId = req.nextUrl.searchParams.get("companyId");

  const contacts = await prisma.contact.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { firstName: { contains: q } },
                { lastName: { contains: q } },
                { email: { contains: q } },
              ],
            }
          : {},
        status ? { status: status as never } : {},
        companyId ? { companyId } : {},
      ],
    },
    include: {
      company: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true, avatarColor: true } },
      _count: { select: { deals: true, tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = createSchema.parse(await req.json());
    const contact = await prisma.contact.create({
      data: {
        ...body,
        email: body.email || null,
        ownerId: session!.userId,
      },
    });

    await prisma.activity.create({
      data: {
        type: "CREATED",
        content: `${contact.firstName} ${contact.lastName} was added as a ${contact.status.toLowerCase()}.`,
        contactId: contact.id,
        companyId: contact.companyId,
        ownerId: session!.userId,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
