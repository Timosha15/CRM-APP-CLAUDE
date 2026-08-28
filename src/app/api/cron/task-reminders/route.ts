import { NextRequest, NextResponse } from "next/server";
import { sendTaskDigestForAllUsers } from "@/lib/task-reminders";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = await sendTaskDigestForAllUsers();
  return NextResponse.json({ ok: true, results });
}
