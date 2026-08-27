import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, handleApiError } from "@/lib/api-helpers";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { error } = await requireSession();
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const sort = req.nextUrl.searchParams.get("sort") ?? "recent";

  const companies = await prisma.company.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { domain: { contains: q } }, { industry: { contains: q } }] }
      : undefined,
    include: {
      owner: { select: { id: true, name: true, avatarColor: true } },
      _count: { select: { contacts: true, deals: true } },
      deals: { select: { value: true, stage: true } },
    },
    orderBy: sort === "name" ? { name: "asc" } : { createdAt: "desc" },
  });

  const shaped = companies.map((c) => {
    const openValue = c.deals
      .filter((d) => d.stage !== "WON" && d.stage !== "LOST")
      .reduce((sum, d) => sum + d.value, 0);
    return { ...c, deals: undefined, openPipelineValue: openValue };
  });

  return NextResponse.json(shaped);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = createSchema.parse(await req.json());
    const company = await prisma.company.create({
      data: { ...body, ownerId: session!.userId },
    });
    return NextResponse.json(company, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
