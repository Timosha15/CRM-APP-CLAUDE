"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { ContactForm } from "@/components/contacts/ContactForm";
import { IconUsers, IconPlus, IconSearch } from "@/components/ui/icons";
import { CONTACT_STATUS_LABEL, CONTACT_STATUS_TONE } from "@/lib/labels";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  status: keyof typeof CONTACT_STATUS_LABEL;
  company: { id: string; name: string } | null;
  owner: { id: string; name: string; avatarColor: string } | null;
  _count: { deals: number; tasks: number };
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    const res = await fetch(`/api/contacts?${params.toString()}`);
    setContacts(await res.json());
  }

  useEffect(() => {
    const handle = setTimeout(load, 200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status]);

  const count = contacts?.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Contacts"
        description={contacts ? `${count} ${count === 1 ? "person" : "people"} in your CRM` : undefined}
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <IconPlus className="h-4 w-4" /> New contact
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 px-4 py-4 sm:px-6">
        <div className="relative w-full max-w-xs">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts…"
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="">All statuses</option>
          {Object.entries(CONTACT_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="px-4 pb-8 sm:px-6">
        {contacts === null ? (
          <TableSkeleton />
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={<IconUsers className="h-10 w-10" />}
            title="No contacts yet"
            description="Add your first contact to start tracking relationships."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <IconPlus className="h-4 w-4" /> New contact
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Deals</th>
                  <th className="px-4 py-3">Owner</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/contacts/${c.id}`} className="flex items-center gap-2.5">
                        <Avatar name={`${c.firstName} ${c.lastName}`} size={28} />
                        <div>
                          <p className="font-medium text-slate-900">
                            {c.firstName} {c.lastName}
                          </p>
                          {c.title ? <p className="text-xs text-slate-400">{c.title}</p> : null}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.company ? (
                        <Link href={`/companies/${c.company.id}`} className="hover:text-brand-600 hover:underline">
                          {c.company.name}
                        </Link>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={CONTACT_STATUS_TONE[c.status]}>{CONTACT_STATUS_LABEL[c.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.email || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3 text-slate-500">{c.phone || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3 text-slate-500">{c._count.deals}</td>
                    <td className="px-4 py-3">
                      {c.owner ? <Avatar name={c.owner.name} color={c.owner.avatarColor} size={24} /> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New contact">
        <ContactForm
          onCancel={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-slate-50 px-4 py-3.5 last:border-0">
          <div className="h-7 w-7 animate-pulse rounded-full bg-slate-100" />
          <div className="h-3.5 w-40 animate-pulse rounded bg-slate-100" />
          <div className="ml-auto h-3.5 w-20 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
