"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent } from "@/components/ui/Card";
import { CompanyForm } from "@/components/companies/CompanyForm";
import { ActivityTimeline, type ActivityItem } from "@/components/activity/ActivityTimeline";
import { DealMiniList, type MiniDeal } from "@/components/deals/DealMiniList";
import { TaskMiniList, type MiniTask } from "@/components/tasks/TaskMiniList";
import { ContactMiniList, type MiniContact } from "@/components/contacts/ContactMiniList";
import { IconEdit, IconTrash, IconBuilding, IconPhone } from "@/components/ui/icons";

type CompanyDetail = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  owner: { id: string; name: string; avatarColor: string } | null;
  contacts: MiniContact[];
  deals: MiniDeal[];
  tasks: MiniTask[];
  activities: ActivityItem[];
};

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/companies/${params.id}`);
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    setCompany(await res.json());
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove() {
    if (!confirm("Delete this company? Contacts and deals will be unlinked.")) return;
    await fetch(`/api/companies/${params.id}`, { method: "DELETE" });
    router.push("/companies");
  }

  if (notFound) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Company not found. <Link href="/companies" className="text-brand-600">Back to companies</Link>
      </div>
    );
  }

  if (!company) return <DetailSkeleton />;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-base font-semibold text-brand-700">
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{company.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              {company.industry ? <span>{company.industry}</span> : null}
              {company.industry && company.domain ? <span>·</span> : null}
              {company.domain ? <span>{company.domain}</span> : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {company.size ? <Badge className="mr-1">{company.size} employees</Badge> : null}
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
                activities={company.activities}
                companyId={company.id}
                onAdded={(a) => setCompany((c) => (c ? { ...c, activities: [a, ...c.activities] } : c))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Details</p>
              <DetailRow icon={IconPhone} label={company.phone} />
              <DetailRow icon={IconBuilding} label={company.address} />
              {company.owner ? (
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                  Owned by {company.owner.name}
                </div>
              ) : null}
              {company.notes ? (
                <p className="whitespace-pre-wrap border-t border-slate-100 pt-3 text-sm text-slate-600">
                  {company.notes}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <ContactMiniList contacts={company.contacts} companyId={company.id} onChange={load} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <DealMiniList deals={company.deals} companyId={company.id} onChange={load} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <TaskMiniList tasks={company.tasks} companyId={company.id} onChange={load} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit company">
        <CompanyForm
          initial={{
            id: company.id,
            name: company.name,
            domain: company.domain ?? "",
            industry: company.industry ?? "",
            size: company.size ?? "",
            phone: company.phone ?? "",
            address: company.address ?? "",
            notes: company.notes ?? "",
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
        <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
