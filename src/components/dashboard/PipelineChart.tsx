import Link from "next/link";
import { DEAL_STAGE_LABEL, DEAL_STAGE_BAR_COLOR, formatCurrency } from "@/lib/labels";
import type { DealStage } from "@prisma/client";

export function PipelineChart({
  data,
}: {
  data: { stage: DealStage; count: number; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <Link
          key={d.stage}
          href={`/deals?stage=${d.stage}`}
          className="block rounded-lg px-1 py-1 hover:bg-slate-50"
        >
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">
              {DEAL_STAGE_LABEL[d.stage]} <span className="text-slate-400">({d.count})</span>
            </span>
            <span className="font-medium text-slate-500">{formatCurrency(d.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max((d.value / max) * 100, d.value > 0 ? 3 : 0)}%`,
                backgroundColor: DEAL_STAGE_BAR_COLOR[d.stage],
              }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
