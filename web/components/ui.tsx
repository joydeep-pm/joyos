import React from "react";
import clsx from "clsx";
import type { TaskPriority, TaskStatus } from "@/lib/types";

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const styles: Record<TaskPriority, string> = {
    P0: "bg-red-100 text-red-700 border-red-300",
    P1: "bg-amber-100 text-amber-700 border-amber-300",
    P2: "bg-sky-100 text-sky-700 border-sky-300",
    P3: "bg-slate-100 text-slate-600 border-slate-300"
  };

  return <span className={clsx("rounded-full border px-2 py-1 text-xs font-semibold", styles[priority])}>{priority}</span>;
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const labels: Record<TaskStatus, string> = {
    n: "Not started",
    s: "In progress",
    b: "Blocked",
    d: "Done"
  };

  const styles: Record<TaskStatus, string> = {
    n: "bg-slate-100 text-slate-700 border-slate-300",
    s: "bg-mint/20 text-ink border-mint/60",
    b: "bg-rose-100 text-rose-700 border-rose-300",
    d: "bg-emerald-100 text-emerald-700 border-emerald-300"
  };

  return <span className={clsx("rounded-full border px-2 py-1 text-xs", styles[status])}>{labels[status]}</span>;
}

export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/20 bg-white/70 p-6 text-center">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink/70">{subtitle}</p>
    </div>
  );
}
