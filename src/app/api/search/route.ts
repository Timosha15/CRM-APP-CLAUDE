import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireSession();
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ contacts: [], companies: [], deals: [] });

  const [contacts, companies, deals] = await Promise.all([
    prisma.contact.findMany({
      where: {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { email: { contains: q } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, email: true, company: { select: { name: true } } },
      take: 5,
    }),
    prisma.company.findMany({
      where: { OR: [{ name: { contains: q } }, { domain: { contains: q } }] },
      select: { id: true, name: true, domain: true },
      take: 5,
    }),
    prisma.deal.findMany({
      where: { title: { contains: q } },
      select: { id: true, title: true, value: true },
      take: 5,
    }),
  ]);

  return NextResponse.json({ contacts, companies, deals });
}
