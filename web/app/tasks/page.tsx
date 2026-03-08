"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client-api";
import { friendlyDate } from "@/lib/format";
import { EmptyState, PriorityBadge, StatusBadge } from "@/components/ui";
import type { TaskDocument, TaskStatus } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskDocument[]>([]);
  const [selected, setSelected] = useState<TaskDocument | null>(null);
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [includeDone, setIncludeDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const params = useMemo(() => {
    const query = new URLSearchParams({ include_done: String(includeDone) });
    if (priority !== "all") query.set("priority", priority);
    if (status !== "all") query.set("status", status);
    if (category !== "all") query.set("category", category);
    return query;
  }, [priority, status, category, includeDone]);

  const load = async () => {
    setLoading(true);
    const response = await api.getTasks(params);

    if (response.ok && Array.isArray(response.data)) {
      setTasks(response.data);
      if (selected) {
        const updated = response.data.find((task) => task.filename === selected.filename) ?? null;
        setSelected(updated);
      }
    } else {
      setMessage(response.error?.message ?? "Unable to load tasks.");
    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [params]);

  const updateStatus = async (filename: string, nextStatus: TaskStatus) => {
    const response = await api.updateTaskStatus(filename, nextStatus);
    if (!response.ok) {
      setMessage(response.error?.message ?? "Unable to update status.");
      return;
    }

    setMessage(`Updated ${filename} to ${nextStatus}.`);
    await load();
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-3xl border border-ink/10 bg-white/85 p-6 shadow-panel">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Task ledger</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Filter and move execution state</h2>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={includeDone}
              onChange={(event) => setIncludeDone(event.target.checked)}
              className="h-4 w-4"
            />
            Include done
          </label>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <select value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-xl border border-ink/15 bg-cloud px-3 py-2 text-sm">
            <option value="all">All priorities</option>
            {['P0', 'P1', 'P2', 'P3'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-ink/15 bg-cloud px-3 py-2 text-sm">
            <option value="all">All status</option>
            <option value="n">Not started</option>
            <option value="s">In progress</option>
            <option value="b">Blocked</option>
            <option value="d">Done</option>
          </select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-ink/15 bg-cloud px-3 py-2 text-sm">
            <option value="all">All categories</option>
            {['technical', 'outreach', 'research', 'writing', 'content', 'admin', 'personal', 'other'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {message && <p className="mt-3 text-sm text-ink/70">{message}</p>}

        {loading ? (
          <p className="mt-6 text-sm text-ink/60">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No tasks match this filter" subtitle="Change filters or triage backlog to create new work items." />
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {tasks.map((task) => (
              <li key={task.filename} className="rounded-2xl border border-ink/10 bg-cloud/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button type="button" onClick={() => setSelected(task)} className="text-left">
                    <h3 className="font-semibold text-ink">{task.frontmatter.title}</h3>
                    <p className="mt-1 text-xs text-ink/60">{task.filename}</p>
                  </button>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={task.frontmatter.priority} />
                    <StatusBadge status={task.frontmatter.status} />
                    <select
                      value={task.frontmatter.status}
                      onChange={(event) => updateStatus(task.filename, event.target.value as TaskStatus)}
                      className="rounded-lg border border-ink/20 bg-white px-2 py-1 text-xs"
                    >
                      <option value="n">n</option>
                      <option value="s">s</option>
                      <option value="b">b</option>
                      <option value="d">d</option>
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="rounded-3xl border border-ink/10 bg-white/85 p-5 shadow-card">
        <h3 className="text-lg font-semibold">Task detail</h3>
        {!selected ? (
          <p className="mt-2 text-sm text-ink/60">Select a task to inspect context and body content.</p>
        ) : (
          <div className="mt-3 space-y-3">
            <h4 className="font-semibold text-ink">{selected.frontmatter.title}</h4>
            <p className="text-sm text-ink/70">Category: {selected.frontmatter.category}</p>
            <p className="text-sm text-ink/70">Due: {friendlyDate(selected.frontmatter.due_date)}</p>
            <div className="rounded-xl border border-ink/10 bg-cloud/70 p-3">
              <pre className="whitespace-pre-wrap text-xs text-ink/80">{selected.body || "No body content"}</pre>
            </div>
          </div>
        )}
      </aside>
    </section>
  );
}
