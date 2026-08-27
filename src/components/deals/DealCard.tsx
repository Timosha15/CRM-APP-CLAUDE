"use client";

import Link from "next/link";
import { format, isPast } from "date-fns";
import { Avatar } from "@/components/ui/Avatar";
import { IconClock, IconBuilding } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/labels";
import type { DealStage } from "@prisma/client";

export type BoardDeal = {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  closeDate: string | null;
  company: { id: string; name: string } | null;
  contact: { id: string; firstName: string; lastName: string } | null;
  owner: { id: string; name: string; avatarColor: string } | null;
};

export function DealCard({
  deal,
  onDragStart,
  dragging,
}: {
  deal: BoardDeal;
  onDragStart: (e: React.DragEvent, id: string) => void;
  dragging?: boolean;
}) {
  const overdue = deal.closeDate && isPast(new Date(deal.closeDate)) && deal.stage !== "WON" && deal.stage !== "LOST";

  return (
    <Link
      href={`/deals/${deal.id}`}
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      className={cn(
        "block cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
        dragging && "opacity-40",
      )}
    >
      <p className="text-sm font-medium text-slate-800 line-clamp-2">{deal.title}</p>
      <p className="mt-1.5 text-sm font-semibold text-brand-700">{formatCurrency(deal.value)}</p>

      {deal.company ? (
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
          <IconBuilding className="h-3 w-3" />
          <span className="truncate">{deal.company.name}</span>
        </div>
      ) : null}

      <div className="mt-2.5 flex items-center justify-between">
        {deal.closeDate ? (
          <span className={cn("flex items-center gap-1 text-xs", overdue ? "text-red-500" : "text-slate-400")}>
            <IconClock className="h-3 w-3" />
            {format(new Date(deal.closeDate), "MMM d")}
          </span>
        ) : (
          <span />
        )}
        {deal.owner ? <Avatar name={deal.owner.name} color={deal.owner.avatarColor} size={20} /> : null}
      </div>
    </Link>
  );
}
