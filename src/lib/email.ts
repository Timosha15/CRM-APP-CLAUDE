import { Resend } from "resend";
import { prisma } from "@/lib/db";

const FROM = process.env.EMAIL_FROM || "Victor <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("Email is not configured. Set RESEND_API_KEY in your environment.");
    this.name = "EmailNotConfiguredError";
  }
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const resend = getClient();
  if (!resend) throw new EmailNotConfiguredError();

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }
  return data;
}

function shell(bodyHtml: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f7fb;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="padding:20px 28px;border-bottom:1px solid #f1f5f9;">
                <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:6px;background:linear-gradient(135deg,#6d4cff,#4c1fd8);color:#ffffff;font-weight:700;font-size:13px;vertical-align:middle;">V</span>
                <span style="margin-left:8px;font-weight:600;font-size:15px;color:#0f172a;vertical-align:middle;">Victor</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:#1e293b;font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;border-top:1px solid #f1f5f9;color:#94a3b8;font-size:12px;">
                Sent from Victor CRM
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendAndLogEmail(opts: {
  to: string;
  subject: string;
  body: string;
  senderName: string;
  senderEmail: string;
  ownerId: string;
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
}) {
  let status: "SENT" | "FAILED" = "SENT";
  let errorMessage: string | null = null;

  try {
    await sendEmail({
      to: opts.to,
      subject: opts.subject,
      html: contactEmailHtml({ bodyText: opts.body, senderName: opts.senderName }),
      replyTo: opts.senderEmail,
    });
  } catch (sendErr) {
    status = "FAILED";
    errorMessage = sendErr instanceof Error ? sendErr.message : "Failed to send email";
  }

  const activity = await prisma.activity.create({
    data: {
      type: "EMAIL",
      subject: opts.subject,
      content: status === "SENT" ? opts.body : `${opts.body}\n\n[Failed to send: ${errorMessage}]`,
      emailStatus: status,
      contactId: opts.contactId ?? null,
      companyId: opts.companyId ?? null,
      dealId: opts.dealId ?? null,
      ownerId: opts.ownerId,
    },
    include: { owner: { select: { name: true, avatarColor: true } } },
  });

  return { activity, status, errorMessage };
}

export function contactEmailHtml(opts: { bodyText: string; senderName: string }) {
  const paragraphs = opts.bodyText
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return shell(`${paragraphs}<p style="margin:20px 0 0;color:#64748b;font-size:13px;">— ${escapeHtml(opts.senderName)}</p>`);
}

export function taskDigestHtml(opts: {
  userName: string;
  overdue: { id: string; title: string; dueDate: Date | null }[];
  dueToday: { id: string; title: string; dueDate: Date | null }[];
}) {
  function list(tasks: { id: string; title: string }[]) {
    if (tasks.length === 0) return `<p style="margin:0 0 16px;color:#94a3b8;">None 🎉</p>`;
    return `<ul style="margin:0 0 20px;padding:0;list-style:none;">${tasks
      .map(
        (t) =>
          `<li style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
             <a href="${APP_URL}/tasks" style="color:#1e293b;text-decoration:none;font-weight:500;">${escapeHtml(t.title)}</a>
           </li>`,
      )
      .join("")}</ul>`;
  }

  return shell(`
    <p style="margin:0 0 20px;">Hi ${escapeHtml(opts.userName)}, here's your task summary for today.</p>
    ${
      opts.overdue.length
        ? `<p style="margin:0 0 8px;font-weight:600;color:#dc2626;">Overdue (${opts.overdue.length})</p>${list(opts.overdue)}`
        : ""
    }
    <p style="margin:0 0 8px;font-weight:600;color:#0f172a;">Due today (${opts.dueToday.length})</p>
    ${list(opts.dueToday)}
    <a href="${APP_URL}/tasks" style="display:inline-block;margin-top:8px;padding:10px 18px;background:#6d4cff;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:500;font-size:13px;">Open Victor</a>
  `);
}
