"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { IconNote, IconPhone, IconMail, IconTrendingUp, IconPlus, IconAlert } from "@/components/ui/icons";
import type { ActivityType } from "@prisma/client";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  content: string;
  subject?: string | null;
  emailStatus?: "SENT" | "FAILED" | null;
  createdAt: string;
  owner: { name: string; avatarColor: string } | null;
  contact?: { id: string; firstName: string; lastName: string } | null;
  deal?: { id: string; title: string } | null;
};

const typeIcon: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  NOTE: IconNote,
  CALL: IconPhone,
  EMAIL: IconMail,
  STATUS_CHANGE: IconTrendingUp,
  CREATED: IconPlus,
};

const typeColor: Record<ActivityType, string> = {
  NOTE: "bg-slate-100 text-slate-500",
  CALL: "bg-sky-100 text-sky-600",
  EMAIL: "bg-violet-100 text-violet-600",
  STATUS_CHANGE: "bg-amber-100 text-amber-600",
  CREATED: "bg-emerald-100 text-emerald-600",
};

export function ActivityTimeline({
  activities,
  contactId,
  companyId,
  dealId,
  sendEmailUrl,
  recipientEmail,
  onAdded,
}: {
  activities: ActivityItem[];
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
  /** When set together with recipientEmail, the Email tab sends a real email instead of just logging text. */
  sendEmailUrl?: string;
  recipientEmail?: string | null;
  onAdded: (activity: ActivityItem) => void;
}) {
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<"NOTE" | "CALL" | "EMAIL">("NOTE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSendRealEmail = Boolean(sendEmailUrl && recipientEmail);
  const isComposingEmail = type === "EMAIL" && canSendRealEmail;

  async function submit() {
    if (!content.trim()) return;
    if (isComposingEmail && !subject.trim()) {
      setError("Add a subject line.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = isComposingEmail
        ? await fetch(sendEmailUrl!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, body: content }),
          })
        : await fetch("/api/activities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, content, contactId, companyId, dealId }),
          });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        if (data.activity) onAdded(data.activity);
        return;
      }
      onAdded(data);
      setContent("");
      setSubject("");
      setType("NOTE");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        {isComposingEmail ? (
          <>
            {recipientEmail ? (
              <p className="mb-2 text-xs text-slate-400">
                To: <span className="text-slate-600">{recipientEmail}</span>
              </p>
            ) : null}
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="mb-2"
            />
          </>
        ) : null}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isComposingEmail ? "Write your message…" : "Log a note, call, or email…"}
          rows={3}
        />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {(["NOTE", "CALL", "EMAIL"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                type="button"
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium",
                  type === t ? "bg-brand-100 text-brand-700" : "text-slate-500 hover:bg-slate-100",
                )}
              >
                {t === "NOTE" ? "Note" : t === "CALL" ? "Call" : "Email"}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={submit} disabled={loading || !content.trim()}>
            {loading ? (isComposingEmail ? "Sending…" : "Logging…") : isComposingEmail ? "Send email" : "Log activity"}
          </Button>
        </div>
        {type === "EMAIL" && !canSendRealEmail ? (
          <p className="mt-2 text-xs text-slate-400">
            No email on file here — this will just be logged as a note.
          </p>
        ) : null}
        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      </div>

      <div className="mt-5 space-y-5">
        {activities.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No activity yet.</p>
        ) : (
          activities.map((a) => {
            const Icon = typeIcon[a.type];
            return (
              <div key={a.id} className="flex gap-3">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", typeColor[a.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  {a.subject ? <p className="text-sm font-medium text-slate-800">{a.subject}</p> : null}
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{a.content}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                    {a.owner ? (
                      <>
                        <Avatar name={a.owner.name} color={a.owner.avatarColor} size={16} />
                        <span>{a.owner.name}</span>
                        <span>·</span>
                      </>
                    ) : null}
                    <span>{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</span>
                    {a.emailStatus === "SENT" ? (
                      <Badge tone="green" className="ml-1">
                        Sent
                      </Badge>
                    ) : a.emailStatus === "FAILED" ? (
                      <Badge tone="red" className="ml-1">
                        <IconAlert className="mr-1 h-3 w-3" /> Failed to send
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
