import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const palette = ["#6d4cff", "#0ea5a4", "#f59e0b", "#ec4899", "#22c55e", "#3b82f6"];

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email,
        passwordHash,
        avatarColor: palette[Math.floor(Math.random() * palette.length)],
      },
    });

    const token = await createSessionToken({ userId: user.id, email: user.email, name: user.name });
    await setSessionCookie(token);

    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return handleApiError(err);
  }
}
