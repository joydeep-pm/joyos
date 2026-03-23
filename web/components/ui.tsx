import React from "react";
import clsx from "clsx";
import type { TaskPriority, TaskStatus } from "@/lib/types";

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const styles: Record<TaskPriority, string> = {
    P0: "border-oxblood/20 bg-oxblood/10 text-oxblood",
    P1: "border-amber/25 bg-amber/12 text-amber",
    P2: "border-petrol/20 bg-petrol/10 text-petrol",
    P3: "border-slate/20 bg-bone text-slate"
  };

  return <span className={clsx("rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em]", styles[priority])}>{priority}</span>;
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const labels: Record<TaskStatus, string> = {
    n: "Not started",
    s: "In progress",
    b: "Blocked",
    d: "Done"
  };

  const styles: Record<TaskStatus, string> = {
    n: "border-slate/20 bg-bone text-slate",
    s: "border-petrol/20 bg-petrol/10 text-petrol",
    b: "border-oxblood/20 bg-oxblood/10 text-oxblood",
    d: "border-moss/20 bg-moss/10 text-moss"
  };

  return <span className={clsx("rounded-full border px-2 py-1 text-xs font-semibold", styles[status])}>{labels[status]}</span>;
}

export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="panel-muted rounded-[24px] border-dashed p-8 text-center">
      <p className="eyebrow-label">No signal yet</p>
      <h3 className="font-display mt-3 text-3xl leading-none text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink/70">{subtitle}</p>
    </div>
  );
}
