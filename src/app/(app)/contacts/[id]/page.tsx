"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent } from "@/components/ui/Card";
import { ContactForm } from "@/components/contacts/ContactForm";
import { ActivityTimeline, type ActivityItem } from "@/components/activity/ActivityTimeline";
import { DealMiniList, type MiniDeal } from "@/components/deals/DealMiniList";
import { TaskMiniList, type MiniTask } from "@/components/tasks/TaskMiniList";
import { IconEdit, IconTrash, IconMail, IconPhone, IconBuilding } from "@/components/ui/icons";
import { CONTACT_STATUS_LABEL, CONTACT_STATUS_TONE } from "@/lib/labels";

type ContactDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  status: keyof typeof CONTACT_STATUS_LABEL;
  source: string | null;
  notes: string | null;
  company: { id: string; name: string } | null;
  companyId: string | null;
  owner: { id: string; name: string; avatarColor: string } | null;
  deals: MiniDeal[];
  tasks: MiniTask[];
  activities: ActivityItem[];
};

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/contacts/${params.id}`);
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    setContact(await res.json());
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove() {
    if (!confirm("Delete this contact? This can't be undone.")) return;
    await fetch(`/api/contacts/${params.id}`, { method: "DELETE" });
    router.push("/contacts");
  }

  if (notFound) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Contact not found. <Link href="/contacts" className="text-brand-600">Back to contacts</Link>
      </div>
    );
  }

  if (!contact) return <DetailSkeleton />;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar name={`${contact.firstName} ${contact.lastName}`} size={48} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {contact.firstName} {contact.lastName}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              {contact.title ? <span>{contact.title}</span> : null}
              {contact.title && contact.company ? <span>·</span> : null}
              {contact.company ? (
                <Link href={`/companies/${contact.company.id}`} className="hover:text-brand-600 hover:underline">
                  {contact.company.name}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={CONTACT_STATUS_TONE[contact.status]} className="mr-1">
            {CONTACT_STATUS_LABEL[contact.status]}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <IconEdit className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={remove} className="text-red-600 hover:bg-red-50">
            <IconTrash className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardContent>
              <ActivityTimeline
                activities={contact.activities}
                contactId={contact.id}
                companyId={contact.companyId}
                onAdded={(a) => setContact((c) => (c ? { ...c, activities: [a, ...c.activities] } : c))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Details</p>
              <DetailRow icon={IconMail} label={contact.email} />
              <DetailRow icon={IconPhone} label={contact.phone} />
              <DetailRow icon={IconBuilding} label={contact.company?.name} />
              {contact.source ? (
                <p className="text-xs text-slate-400">
                  Source: <span className="text-slate-600">{contact.source}</span>
                </p>
              ) : null}
              {contact.owner ? (
                <div className="flex items-center gap-2 pt-1">
                  <Avatar name={contact.owner.name} color={contact.owner.avatarColor} size={22} />
                  <span className="text-xs text-slate-500">Owned by {contact.owner.name}</span>
                </div>
              ) : null}
              {contact.notes ? (
                <p className="whitespace-pre-wrap border-t border-slate-100 pt-3 text-sm text-slate-600">
                  {contact.notes}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <DealMiniList
                deals={contact.deals}
                contactId={contact.id}
                companyId={contact.companyId}
                onChange={load}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <TaskMiniList
                tasks={contact.tasks}
                contactId={contact.id}
                companyId={contact.companyId}
                onChange={load}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit contact">
        <ContactForm
          initial={{
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email ?? "",
            phone: contact.phone ?? "",
            title: contact.title ?? "",
            status: contact.status,
            source: contact.source ?? "",
            companyId: contact.companyId ?? "",
            notes: contact.notes ?? "",
          }}
          onCancel={() => setEditOpen(false)}
          onSuccess={() => {
            setEditOpen(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}

function DetailRow({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label?: string | null }) {
  if (!label) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center gap-3.5">
        <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
