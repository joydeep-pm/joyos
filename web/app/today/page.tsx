"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { api } from "@/lib/client-api";
import { topFocusTasks } from "@/lib/scoring";
import { friendlyDate } from "@/lib/format";
import { EmptyState, PriorityBadge, StatusBadge } from "@/components/ui";
import type { GoalsResponse, SystemStatus, TaskDocument } from "@/lib/types";

export default function TodayPage() {
  const [tasks, setTasks] = useState<TaskDocument[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [goals, setGoals] = useState<GoalsResponse | null>(null);
  const [capture, setCapture] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [tasksRes, statusRes, goalsRes] = await Promise.all([
      api.getTasks(new URLSearchParams({ include_done: "false" })),
      api.getSystemStatus(),
      api.getGoals()
    ]);

    if (tasksRes.ok && Array.isArray(tasksRes.data)) setTasks(tasksRes.data);
    if (statusRes.ok && statusRes.data) setStatus(statusRes.data);
    if (goalsRes.ok && goalsRes.data) setGoals(goalsRes.data);

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const focus = useMemo(() => topFocusTasks(tasks, 3), [tasks]);
  const blocked = useMemo(() => tasks.filter((task) => task.frontmatter.status === "b"), [tasks]);

  const handleCapture = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!capture.trim()) return;

    setBusy(true);
    const response = await api.capture(capture.trim());
    if (response.ok) {
      setCapture("");
      setMessage(`Captured. Backlog now has ${response.data?.backlog_items ?? "updated"} items.`);
      await load();
    } else {
      setMessage(response.error?.message ?? "Capture failed.");
    }
    setBusy(false);
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">Today focus</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Top 3 execution priorities</h2>
            </div>
            {status && <p className="text-sm text-ink/60">Active tasks: {status.total_active_tasks}</p>}
          </div>

          {loading ? (
            <p className="text-sm text-ink/60">Loading your task graph...</p>
          ) : focus.length === 0 ? (
            <EmptyState title="No active focus tasks" subtitle="Capture a new item or triage backlog to generate execution priorities." />
          ) : (
            <div className="space-y-4">
              {focus.map((task, index) => (
                <article key={task.filename} className="rounded-2xl border border-ink/10 bg-cloud/60 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="mono text-xs text-ink/60">#{index + 1}</span>
                    <PriorityBadge priority={task.frontmatter.priority} />
                    <StatusBadge status={task.frontmatter.status} />
                    <span className="text-xs text-ink/60">{task.frontmatter.category}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-ink">{task.frontmatter.title}</h3>
                  <p className="mt-2 text-sm text-ink/70">Due: {friendlyDate(task.frontmatter.due_date)}</p>
                </article>
              ))}
            </div>
          )}

          <button
            type="button"
            className="mt-5 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-cloud transition hover:bg-ink/90"
            onClick={() => {
              if (focus[0]) {
                setMessage(`First block locked: ${focus[0].frontmatter.title}`);
              }
            }}
          >
            Start first block
          </button>
        </div>

        <div className="rounded-3xl border border-ink/10 bg-white/85 p-6 shadow-card">
          <h2 className="text-xl font-semibold tracking-tight">Blocked tasks</h2>
          {blocked.length === 0 ? (
            <p className="mt-2 text-sm text-ink/65">No blockers currently tracked.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {blocked.map((task) => (
                <li key={task.filename} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {task.frontmatter.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-ink/10 bg-white/85 p-5 shadow-card">
          <h2 className="text-lg font-semibold">Quick capture</h2>
          <p className="mt-1 text-sm text-ink/60">Drop new ideas without losing momentum.</p>
          <form className="mt-4 space-y-3" onSubmit={handleCapture}>
            <textarea
              className="min-h-28 w-full rounded-xl border border-ink/15 bg-cloud px-3 py-2 text-sm outline-none ring-mint transition focus:ring-2"
              value={capture}
              onChange={(event) => setCapture(event.target.value)}
              placeholder="Example: Prepare stakeholder update for middleware milestone"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-mint px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mint/80 disabled:opacity-60"
            >
              {busy ? "Capturing..." : "Capture to backlog"}
            </button>
          </form>
          {message && <p className="mt-3 text-sm text-ink/70">{message}</p>}
        </div>

        <div className="rounded-3xl border border-ink/10 bg-white/85 p-5 shadow-card">
          <h2 className="text-lg font-semibold">Goal signal</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-ink/60">Quarter objective</dt>
              <dd className="font-medium">{goals?.highlights.quarterObjective ?? "Not set"}</dd>
            </div>
            <div>
              <dt className="text-ink/60">Primary vision</dt>
              <dd className="font-medium">{goals?.highlights.vision ?? "Not set"}</dd>
            </div>
            <div>
              <dt className="text-ink/60">Top priorities</dt>
              <dd className="font-medium">{goals?.highlights.topPriorities ?? "Not set"}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </section>
  );
}
