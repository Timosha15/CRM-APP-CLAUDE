"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { DEAL_STAGES, DEAL_STAGE_LABEL, formatCurrency, formatCompactCurrency } from "@/lib/labels";
import { DealCard, type BoardDeal } from "@/components/deals/DealCard";
import type { DealStage } from "@prisma/client";

export function DealBoard({
  deals,
  onStageChange,
}: {
  deals: BoardDeal[];
  onStageChange: (dealId: string, stage: DealStage) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<DealStage | null>(null);

  function handleDrop(stage: DealStage) {
    if (draggingId) {
      const deal = deals.find((d) => d.id === draggingId);
      if (deal && deal.stage !== stage) onStageChange(draggingId, stage);
    }
    setDraggingId(null);
    setOverStage(null);
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {DEAL_STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        const total = stageDeals.reduce((sum, d) => sum + d.value, 0);

        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={() => handleDrop(stage)}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-xl border bg-slate-100/60 transition-colors",
              overStage === stage ? "border-brand-400 bg-brand-50/50" : "border-slate-200",
            )}
          >
            <div className="flex items-center justify-between px-3 pb-2 pt-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-700">{DEAL_STAGE_LABEL[stage]}</h3>
                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                  {stageDeals.length}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-400" title={formatCurrency(total)}>
                {formatCompactCurrency(total)}
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3" style={{ minHeight: 120 }}>
              {stageDeals.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-xs text-slate-400">
                  Drop deals here
                </div>
              ) : (
                stageDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    dragging={draggingId === deal.id}
                    onDragStart={(e, id) => {
                      e.dataTransfer.effectAllowed = "move";
                      setDraggingId(id);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
