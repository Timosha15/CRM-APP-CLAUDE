"use client";

import Link from "next/link";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { DealForm } from "@/components/deals/DealForm";
import { Badge } from "@/components/ui/Badge";
import { IconPlus } from "@/components/ui/icons";
import { DEAL_STAGE_LABEL, DEAL_STAGE_TONE, formatCurrency } from "@/lib/labels";
import type { DealStage } from "@prisma/client";

export type MiniDeal = {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
};

export function DealMiniList({
  deals,
  contactId,
  companyId,
  onChange,
}: {
  deals: MiniDeal[];
  contactId?: string | null;
  companyId?: string | null;
  onChange: () => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Deals</p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          <IconPlus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {deals.length === 0 ? (
        <p className="text-sm text-slate-400">No deals yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {deals.map((d) => (
            <li key={d.id}>
              <Link href={`/deals/${d.id}`} className="block rounded-lg border border-slate-100 p-2.5 hover:border-slate-200 hover:bg-slate-50">
                <p className="truncate text-sm font-medium text-slate-800">{d.title}</p>
                <div className="mt-1 flex items-center justify-between">
                  <Badge tone={DEAL_STAGE_TONE[d.stage]}>{DEAL_STAGE_LABEL[d.stage]}</Badge>
                  <span className="text-xs font-medium text-slate-500">{formatCurrency(d.value)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New deal">
        <DealForm
          defaultContactId={contactId}
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
