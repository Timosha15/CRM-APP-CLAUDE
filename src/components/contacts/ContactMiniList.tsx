"use client";

import Link from "next/link";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ContactForm } from "@/components/contacts/ContactForm";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { IconPlus } from "@/components/ui/icons";
import { CONTACT_STATUS_LABEL, CONTACT_STATUS_TONE } from "@/lib/labels";

export type MiniContact = {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  status: keyof typeof CONTACT_STATUS_LABEL;
};

export function ContactMiniList({
  contacts,
  companyId,
  onChange,
}: {
  contacts: MiniContact[];
  companyId: string;
  onChange: () => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Contacts</p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          <IconPlus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {contacts.length === 0 ? (
        <p className="text-sm text-slate-400">No contacts yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {contacts.map((c) => (
            <li key={c.id}>
              <Link
                href={`/contacts/${c.id}`}
                className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-50"
              >
                <Avatar name={`${c.firstName} ${c.lastName}`} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {c.firstName} {c.lastName}
                  </p>
                  {c.title ? <p className="truncate text-xs text-slate-400">{c.title}</p> : null}
                </div>
                <Badge tone={CONTACT_STATUS_TONE[c.status]}>{CONTACT_STATUS_LABEL[c.status]}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New contact">
        <ContactForm
          defaultCompanyId={companyId}
          onCancel={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            onChange();
          }}
        />
      </Modal>
    </div>
  );
}
