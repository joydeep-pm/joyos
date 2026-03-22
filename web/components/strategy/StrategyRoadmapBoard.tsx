"use client";

import React, { useMemo, useState } from "react";
import { api } from "@/lib/client-api";
import type { StrategyRoadmapItem as RoadmapItem, StrategyRoadmapStatus as RoadmapStatus } from "@/lib/types";

const quarterOrder = ["Q1", "Q2", "Q3", "Q4"] as const;

const statusLabel: Record<RoadmapStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  at_risk: "At risk",
  blocked: "Blocked",
  done: "Done"
};

const statusTone: Record<RoadmapStatus, string> = {
  not_started: "bg-slate-100 text-slate-700 border-slate-300",
  in_progress: "bg-sky-100 text-sky-700 border-sky-300",
  at_risk: "bg-amber-100 text-amber-700 border-amber-300",
  blocked: "bg-rose-100 text-rose-700 border-rose-300",
  done: "bg-emerald-100 text-emerald-700 border-emerald-300"
};

export function StrategyRoadmapBoard({ initialItems }: { initialItems: RoadmapItem[] }) {
  const [items, setItems] = useState<RoadmapItem[]>(initialItems);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const grouped = useMemo(
    () =>
      quarterOrder.map((quarter) => ({
        quarter,
        items: items.filter((item) => item.quarter === quarter)
      })),
    [items]
  );

  function cycleStatus(current: RoadmapStatus): RoadmapStatus {
    const order: RoadmapStatus[] = ["not_started", "in_progress", "at_risk", "blocked", "done"];
    const index = order.indexOf(current);
    return order[(index + 1) % order.length];
  }

  return (
    <div className="space-y-5">
      {message ? <p className="text-sm text-ink/60">{message}</p> : null}
      <div className="grid gap-4 xl:grid-cols-4">
        {grouped.map((group) => (
          <section key={group.quarter} className="rounded-[24px] border border-ink/10 bg-white/85 p-4 shadow-card backdrop-blur">
            <div className="mb-4 border-b border-ink/10 pb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate">{group.quarter}</p>
            </div>
            <div className="space-y-3">
              {group.items.map((item) => (
                <article key={item.id} className="rounded-[20px] border border-ink/10 bg-cloud/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">{item.category}</p>
                      <h4 className="mt-2 text-sm font-semibold text-ink">{item.title}</h4>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusTone[item.status]}`}>{statusLabel[item.status]}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-ink/70">{item.reason}</p>
                  <button
                    type="button"
                    onClick={async () => {
                      const nextStatus = cycleStatus(item.status);
                      setBusyId(item.id);
                      const result = await api.updateRoadmapStatus(item.id, nextStatus);
                      if (result.ok && result.data) {
                        setItems(result.data);
                        setMessage(`Updated ${item.title} to ${statusLabel[nextStatus]}.`);
                      } else {
                        setMessage(result.error?.message ?? `Unable to update ${item.title}.`);
                      }
                      setBusyId(null);
                    }}
                    disabled={busyId !== null}
                    className="mt-4 rounded-full border border-ink/10 bg-white/80 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-cloud disabled:opacity-60"
                  >
                    {busyId === item.id ? "Updating…" : "Update status"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
