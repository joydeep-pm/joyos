"use client";

import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import { api } from "@/lib/client-api";
import { EmptyState, PriorityBadge, StatusBadge } from "@/components/ui";
import { presentBlockedTask, presentBriefOutcome } from "@/lib/intervention-presenters";
import type { DailyBrief, GoalsResponse, SystemStatus, TaskDocument } from "@/lib/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TodayPage() {
  const [tasks, setTasks] = useState<TaskDocument[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [goals, setGoals] = useState<GoalsResponse | null>(null);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [capture, setCapture] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [tasksRes, statusRes, goalsRes, briefRes] = await Promise.all([
      api.getTasks(new URLSearchParams({ include_done: "false" })),
      api.getSystemStatus(),
      api.getGoals(),
      api.getAssistantBrief(todayIso())
    ]);

    if (tasksRes.ok && Array.isArray(tasksRes.data)) setTasks(tasksRes.data);
    if (statusRes.ok && statusRes.data) setStatus(statusRes.data);
    if (goalsRes.ok && goalsRes.data) setGoals(goalsRes.data);
    if (briefRes.ok && briefRes.data) setBrief(briefRes.data);

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const blocked = useMemo(() => tasks.filter((task) => task.frontmatter.status === "b"), [tasks]);
  const tasksById = useMemo(() => new Map(tasks.map((task) => [task.filename, task])), [tasks]);
  const focus = brief?.topOutcomes ?? [];

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
        <div className="panel-surface section-shell">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow-label">Director intervention brief</p>
              <h2 className="section-title mt-3">Today&apos;s Three</h2>
              <p className="mt-2 max-w-2xl text-sm text-ink/65">
                Start with the highest-leverage interventions, not the longest task list. Use this page to decide where
                Joydeep should unblock, review, or follow through first.
              </p>
            </div>
            {status && <p className="text-sm text-ink/60">Active tasks: {status.total_active_tasks}</p>}
          </div>

          {loading ? (
            <p className="text-sm text-ink/60">Loading your operating context...</p>
          ) : focus.length === 0 ? (
            <EmptyState
              title="No intervention items available"
              subtitle="Capture a new item or triage backlog to generate Today’s Three."
            />
          ) : (
            <div className="space-y-4">
              {focus.map((outcome, index) => {
                const task = tasksById.get(outcome.taskId);
                const view = presentBriefOutcome(outcome);

                return (
                <article key={outcome.id} className="rounded-[22px] border border-ink/10 bg-bone/80 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="mono text-xs text-ink/60">#{index + 1}</span>
                    <PriorityBadge priority={outcome.priority} />
                    {task ? <StatusBadge status={task.frontmatter.status} /> : null}
                    {task ? <span className="text-xs text-ink/60">{task.frontmatter.category}</span> : null}
                    <span className="mono text-xs text-ink/60">score {outcome.score}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-ink">{outcome.title}</h3>
                  <p className="mt-2 text-sm font-medium text-ink/80">{view.reason}</p>
                  <p className="mt-2 text-sm text-ink/70">{view.goalSignal}</p>
                  <p className="mt-2 text-sm text-ink/65">{task?.frontmatter.due_date ? `Due ${task.frontmatter.due_date}` : "Due: No due date"}</p>
                </article>
              )})}
            </div>
          )}

          <button
            type="button"
            className="primary-button mt-5"
            onClick={() => {
              if (focus[0]) {
                setMessage(`First intervention locked: ${focus[0].title}`);
              }
            }}
          >
            Start first intervention
          </button>
        </div>

        <div className="panel-muted section-shell">
          <h2 className="font-display text-[2rem] leading-none tracking-tight">Blockers that may need intervention</h2>
          <p className="mt-2 text-sm text-ink/65">
            Review blocked work quickly. Decide whether to escalate, clarify, or let it wait intentionally.
          </p>
          {blocked.length === 0 ? (
            <p className="mt-4 text-sm text-ink/65">No blockers currently tracked.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {blocked.map((task) => (
                <li key={task.filename} className="rounded-2xl border border-oxblood/20 bg-oxblood/10 px-4 py-3 text-sm text-oxblood">
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={task.frontmatter.priority} />
                    <StatusBadge status={task.frontmatter.status} />
                  </div>
                  <p className="mt-2 font-semibold">{task.frontmatter.title}</p>
                  <p className="mt-1 text-rose-800">{presentBlockedTask(task).reason}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="panel-surface section-shell">
          <p className="eyebrow-label">Keep momentum</p>
          <h2 className="font-display mt-3 text-[2rem] leading-none">Quick capture</h2>
          <p className="mt-1 text-sm text-ink/60">Drop new asks, escalations, or follow-ups without losing momentum.</p>
          <form className="mt-4 space-y-3" onSubmit={handleCapture}>
            <textarea
              className="paper-input min-h-28 w-full rounded-2xl px-3 py-2 text-sm outline-none ring-mint transition focus:ring-2"
              value={capture}
              onChange={(event) => setCapture(event.target.value)}
              placeholder="Example: Prepare stakeholder update for middleware milestone"
            />
            <button
              type="submit"
              disabled={busy}
              className="primary-button w-full rounded-2xl disabled:opacity-60"
            >
              {busy ? "Capturing..." : "Capture to backlog"}
            </button>
          </form>
          {message && <p className="mt-3 text-sm text-ink/70">{message}</p>}
        </div>

        <div className="panel-muted section-shell">
          <p className="eyebrow-label">Role alignment</p>
          <h2 className="font-display mt-3 text-[2rem] leading-none">Operating-goal signal</h2>
          <p className="mt-1 text-sm text-ink/60">Keep the day tied to the role goals, not just task volume.</p>
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
