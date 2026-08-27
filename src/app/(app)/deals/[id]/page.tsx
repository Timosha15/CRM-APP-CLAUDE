"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";
import { DealForm } from "@/components/deals/DealForm";
import { ActivityTimeline, type ActivityItem } from "@/components/activity/ActivityTimeline";
import { TaskMiniList, type MiniTask } from "@/components/tasks/TaskMiniList";
import { IconEdit, IconTrash, IconBuilding, IconUsers } from "@/components/ui/icons";
import { DEAL_STAGE_LABEL, DEAL_STAGE_TONE, formatCurrency } from "@/lib/labels";
import type { DealStage } from "@prisma/client";

type DealDetail = {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  closeDate: string | null;
  notes: string | null;
  company: { id: string; name: string } | null;
  companyId: string | null;
  contact: { id: string; firstName: string; lastName: string } | null;
  contactId: string | null;
  owner: { id: string; name: string; avatarColor: string } | null;
  tasks: MiniTask[];
  activities: ActivityItem[];
};

export default function DealDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/deals/${params.id}`);
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    setDeal(await res.json());
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove() {
    if (!confirm("Delete this deal? This can't be undone.")) return;
    await fetch(`/api/deals/${params.id}`, { method: "DELETE" });
    router.push("/deals");
  }

  async function changeStage(stage: DealStage) {
    setDeal((d) => (d ? { ...d, stage } : d));
    await fetch(`/api/deals/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    load();
  }

  if (notFound) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Deal not found. <Link href="/deals" className="text-brand-600">Back to pipeline</Link>
      </div>
    );
  }

  if (!deal) return <DetailSkeleton />;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone={DEAL_STAGE_TONE[deal.stage]}>{DEAL_STAGE_LABEL[deal.stage]}</Badge>
            <span className="text-xs text-slate-400">{deal.probability}% probability</span>
          </div>
          <h1 className="mt-1.5 text-xl font-semibold text-slate-900">{deal.title}</h1>
          <p className="mt-1 text-2xl font-semibold text-brand-700">{formatCurrency(deal.value)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={deal.stage}
            onChange={(e) => changeStage(e.target.value as DealStage)}
            className="w-40"
          >
            {Object.entries(DEAL_STAGE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
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
                activities={deal.activities}
                dealId={deal.id}
                companyId={deal.companyId}
                contactId={deal.contactId}
                onAdded={(a) => setDeal((d) => (d ? { ...d, activities: [a, ...d.activities] } : d))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Details</p>
              {deal.company ? (
                <Link href={`/companies/${deal.company.id}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600">
                  <IconBuilding className="h-4 w-4 text-slate-400" />
                  {deal.company.name}
                </Link>
              ) : null}
              {deal.contact ? (
                <Link href={`/contacts/${deal.contact.id}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600">
                  <IconUsers className="h-4 w-4 text-slate-400" />
                  {deal.contact.firstName} {deal.contact.lastName}
                </Link>
              ) : null}
              {deal.closeDate ? (
                <p className="text-sm text-slate-600">
                  Close date: <span className="text-slate-500">{format(new Date(deal.closeDate), "MMM d, yyyy")}</span>
                </p>
              ) : null}
              {deal.owner ? (
                <p className="text-xs text-slate-500">Owned by {deal.owner.name}</p>
              ) : null}
              {deal.notes ? (
                <p className="whitespace-pre-wrap border-t border-slate-100 pt-3 text-sm text-slate-600">
                  {deal.notes}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <TaskMiniList
                tasks={deal.tasks}
                dealId={deal.id}
                contactId={deal.contactId}
                companyId={deal.companyId}
                onChange={load}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit deal">
        <DealForm
          initial={{
            id: deal.id,
            title: deal.title,
            value: String(deal.value),
            stage: deal.stage,
            probability: String(deal.probability),
            closeDate: deal.closeDate ? deal.closeDate.slice(0, 10) : "",
            companyId: deal.companyId ?? "",
            contactId: deal.contactId ?? "",
            notes: deal.notes ?? "",
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

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-64 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}
