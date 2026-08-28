import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-helpers";
import { sendTaskDigestForUser } from "@/lib/task-reminders";
import { isEmailConfigured } from "@/lib/email";

export async function POST() {
  const { session, error } = await requireSession();
  if (error) return error;

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Email isn't configured yet. Set RESEND_API_KEY in your environment." },
      { status: 503 },
    );
  }

  const result = await sendTaskDigestForUser(session!.userId, { force: true });

  if (!result.sent) {
    if (result.reason === "nothing-due") {
      return NextResponse.json({ sent: false, message: "You have no open tasks due today or overdue — nothing to send." });
    }
    if (result.reason === "send-failed") {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
    return NextResponse.json({ error: "Couldn't send the reminder email." }, { status: 500 });
  }

  return NextResponse.json(result);
}
