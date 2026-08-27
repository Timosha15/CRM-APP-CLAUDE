"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { CompanyForm } from "@/components/companies/CompanyForm";
import { IconBuilding, IconPlus, IconSearch } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/labels";

type Company = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  owner: { id: string; name: string; avatarColor: string } | null;
  _count: { contacts: number; deals: number };
  openPipelineValue: number;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    const res = await fetch(`/api/companies?${params.toString()}`);
    setCompanies(await res.json());
  }

  useEffect(() => {
    const handle = setTimeout(load, 200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const count = companies?.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Companies"
        description={companies ? `${count} ${count === 1 ? "company" : "companies"} tracked` : undefined}
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <IconPlus className="h-4 w-4" /> New company
          </Button>
        }
      />

      <div className="px-4 py-4 sm:px-6">
        <div className="relative w-full max-w-xs">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-6">
        {companies === null ? (
          <div className="h-64 animate-pulse rounded-xl bg-white" />
        ) : companies.length === 0 ? (
          <EmptyState
            icon={<IconBuilding className="h-10 w-10" />}
            title="No companies yet"
            description="Add a company to start grouping contacts and deals."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <IconPlus className="h-4 w-4" /> New company
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/companies/${c.id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  {c.owner ? <Avatar name={c.owner.name} color={c.owner.avatarColor} size={26} /> : null}
                </div>
                <p className="mt-3 truncate text-sm font-semibold text-slate-900">{c.name}</p>
                <p className="truncate text-xs text-slate-400">{c.industry || c.domain || "—"}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>{c._count.contacts} contacts</span>
                  <span>{c._count.deals} deals</span>
                  <span className="font-medium text-slate-700">{formatCurrency(c.openPipelineValue)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New company">
        <CompanyForm
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
