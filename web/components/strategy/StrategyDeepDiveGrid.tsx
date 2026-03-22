import React from "react";
import type { ProductDeepDive } from "@/lib/strategy-command-center";

export function StrategyDeepDiveGrid({ items }: { items: ProductDeepDive[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-[24px] border border-ink/10 bg-white/85 p-5 shadow-card backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate">Product deep-dive</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{item.title}</h3>
          <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
            <p><span className="font-semibold text-ink">Parity / position:</span> {item.parity}</p>
            <p><span className="font-semibold text-ink">Opportunity:</span> {item.opportunity}</p>
            <p><span className="font-semibold text-ink">Watchout:</span> {item.watchout}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.linkedRoadmapIds.map((id) => (
              <span key={id} className="rounded-full border border-ink/10 bg-cloud/80 px-3 py-1 text-xs font-semibold text-ink/65">
                {id}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
