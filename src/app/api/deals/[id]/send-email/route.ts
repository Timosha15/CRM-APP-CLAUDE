import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, handleApiError } from "@/lib/api-helpers";
import { sendAndLogEmail, isEmailConfigured } from "@/lib/email";

const schema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message can't be empty"),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;
  const { id } = await params;

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Email isn't configured yet. Set RESEND_API_KEY in your environment." },
      { status: 503 },
    );
  }

  try {
    const body = schema.parse(await req.json());

    const deal = await prisma.deal.findUnique({ where: { id }, include: { contact: true } });
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    if (!deal.contact?.email) {
      return NextResponse.json({ error: "This deal has no primary contact with an email address." }, { status: 400 });
    }

    const { activity, status, errorMessage } = await sendAndLogEmail({
      to: deal.contact.email,
      subject: body.subject,
      body: body.body,
      senderName: session!.name,
      senderEmail: session!.email,
      ownerId: session!.userId,
      contactId: deal.contactId,
      companyId: deal.companyId,
      dealId: deal.id,
    });

    if (status === "FAILED") {
      return NextResponse.json({ error: errorMessage, activity }, { status: 502 });
    }
    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
