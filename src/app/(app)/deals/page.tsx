"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { DealForm } from "@/components/deals/DealForm";
import { DealBoard } from "@/components/deals/DealBoard";
import type { BoardDeal } from "@/components/deals/DealCard";
import { IconTarget, IconPlus, IconSearch, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { DEAL_STAGE_LABEL, DEAL_STAGE_TONE, formatCurrency } from "@/lib/labels";
import type { DealStage } from "@prisma/client";

function DealsPageInner() {
  const searchParams = useSearchParams();
  const initialStage = searchParams.get("stage") as DealStage | null;

  const [deals, setDeals] = useState<BoardDeal[] | null>(null);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<DealStage | null>(initialStage);
  const [view, setView] = useState<"board" | "list">(initialStage ? "list" : "board");
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    const res = await fetch(`/api/deals?${params.toString()}`);
    setDeals(await res.json());
  }

  useEffect(() => {
    const handle = setTimeout(load, 200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const visibleDeals = stageFilter ? deals?.filter((d) => d.stage === stageFilter) ?? null : deals;

  async function onStageChange(dealId: string, stage: DealStage) {
    setDeals((prev) => (prev ? prev.map((d) => (d.id === dealId ? { ...d, stage } : d)) : prev));
    await fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
  }

  const totalOpen = deals
    ?.filter((d) => d.stage !== "WON" && d.stage !== "LOST")
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Pipeline"
        description={deals ? `${deals.length} deals · ${formatCurrency(totalOpen ?? 0)} open` : undefined}
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <IconPlus className="h-4 w-4" /> New deal
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 px-4 py-4 sm:px-6">
        <div className="relative w-full max-w-xs">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deals…"
            className="pl-9"
          />
        </div>
        {stageFilter ? (
          <button
            onClick={() => setStageFilter(null)}
            className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700"
          >
            Stage: {DEAL_STAGE_LABEL[stageFilter]}
            <IconX className="h-3 w-3" />
          </button>
        ) : null}
        <div className="ml-auto flex rounded-lg border border-slate-200 bg-white p-0.5">
          {(["board", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                if (v === "board") setStageFilter(null);
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize",
                view === v ? "bg-brand-600 text-white" : "text-slate-500 hover:text-slate-700",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 pb-6 sm:px-6">
        {visibleDeals === null ? (
          <div className="h-64 animate-pulse rounded-xl bg-white" />
        ) : visibleDeals.length === 0 ? (
          <EmptyState
            icon={<IconTarget className="h-10 w-10" />}
            title="No deals yet"
            description="Create your first deal to start tracking the pipeline."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <IconPlus className="h-4 w-4" /> New deal
              </Button>
            }
          />
        ) : view === "board" ? (
          <DealBoard deals={visibleDeals} onStageChange={onStageChange} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Deal</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Close date</th>
                  <th className="px-4 py-3">Owner</th>
                </tr>
              </thead>
              <tbody>
                {visibleDeals.map((d) => (
                  <tr key={d.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/deals/${d.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                        {d.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.company?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={DEAL_STAGE_TONE[d.stage]}>{DEAL_STAGE_LABEL[d.stage]}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{formatCurrency(d.value)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {d.closeDate ? new Date(d.closeDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {d.owner ? <Avatar name={d.owner.name} color={d.owner.avatarColor} size={24} /> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New deal">
        <DealForm
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

export default function DealsPage() {
  return (
    <Suspense fallback={null}>
      <DealsPageInner />
    </Suspense>
  );
}
