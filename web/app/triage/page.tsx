"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState, PriorityBadge } from "@/components/ui";
import { api } from "@/lib/client-api";
import type { BacklogProcessResult, SuggestedTask, TaskPriority } from "@/lib/types";

interface EditableSuggestion extends SuggestedTask {
  selected: boolean;
}

export default function TriagePage() {
  const [result, setResult] = useState<BacklogProcessResult | null>(null);
  const [editable, setEditable] = useState<EditableSuggestion[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const response = await api.processBacklog();

    if (response.ok && response.data) {
      setResult(response.data);
      setEditable(response.data.new_tasks.map((item) => ({ ...item, selected: true })));
    } else {
      setMessage(response.error?.message ?? "Unable to process backlog.");
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const selectedCount = useMemo(() => editable.filter((item) => item.selected).length, [editable]);

  const createSelected = async () => {
    const selected = editable.filter((item) => item.selected);
    if (!selected.length) {
      setMessage("Select at least one task to create.");
      return;
    }

    setSubmitting(true);

    const results = await Promise.all(
      selected.map((item) =>
        api.createTask({
          title: item.item,
          category: item.suggested_category,
          priority: item.suggested_priority,
          estimated_time: 60
        })
      )
    );

    const success = results.filter((entry) => entry.ok).length;
    setMessage(`Created ${success}/${selected.length} tasks.`);
    await load();
    setSubmitting(false);
  };

  const clearBacklog = async () => {
    const response = await api.clearBacklog();
    if (response.ok) {
      setMessage("Backlog cleared.");
      await load();
    } else {
      setMessage(response.error?.message ?? "Unable to clear backlog.");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-ink/10 bg-white/85 p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Backlog triage</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Convert raw notes into execution-ready tasks</h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={createSelected}
              disabled={submitting || selectedCount === 0}
              className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-cloud disabled:opacity-50"
            >
              {submitting ? "Creating..." : `Create selected (${selectedCount})`}
            </button>
            <button
              type="button"
              onClick={clearBacklog}
              className="rounded-xl border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink"
            >
              Clear backlog
            </button>
          </div>
        </div>
        {message && <p className="mt-3 text-sm text-ink/70">{message}</p>}
      </div>

      {loading ? (
        <p className="text-sm text-ink/60">Processing backlog...</p>
      ) : !result ? (
        <EmptyState title="No triage data" subtitle="Try processing backlog again after capture." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-3xl border border-ink/10 bg-white/85 p-5 shadow-card lg:col-span-2">
            <h3 className="text-lg font-semibold">Ready to create</h3>
            {editable.length === 0 ? (
              <EmptyState title="No clean items yet" subtitle="Backlog is empty or all items need clarification." />
            ) : (
              <ul className="space-y-3">
                {editable.map((item, index) => (
                  <li key={`${item.item}-${index}`} className="rounded-xl border border-ink/10 bg-cloud/60 p-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(event) => {
                          setEditable((current) =>
                            current.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, selected: event.target.checked } : entry
                            )
                          );
                        }}
                        className="mt-1 h-4 w-4 rounded border-ink/30"
                      />
                      <div className="flex-1 space-y-2">
                        <input
                          value={item.item}
                          onChange={(event) => {
                            setEditable((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, item: event.target.value } : entry
                              )
                            );
                          }}
                          className="w-full rounded-lg border border-ink/15 bg-white px-2 py-1 text-sm font-medium"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={item.suggested_category}
                            onChange={(event) => {
                              const category = event.target.value;
                              setEditable((current) =>
                                current.map((entry, entryIndex) =>
                                  entryIndex === index ? { ...entry, suggested_category: category } : entry
                                )
                              );
                            }}
                            className="rounded-lg border border-ink/20 bg-white px-2 py-1 text-xs"
                          >
                            {["technical", "outreach", "research", "writing", "content", "admin", "personal", "other"].map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <select
                            value={item.suggested_priority}
                            onChange={(event) => {
                              const priority = event.target.value as TaskPriority;
                              setEditable((current) =>
                                current.map((entry, entryIndex) =>
                                  entryIndex === index ? { ...entry, suggested_priority: priority } : entry
                                )
                              );
                            }}
                            className="rounded-lg border border-ink/20 bg-white px-2 py-1 text-xs"
                          >
                            {["P0", "P1", "P2", "P3"].map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <PriorityBadge priority={item.suggested_priority} />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-ink/10 bg-white/85 p-5 shadow-card">
              <h3 className="text-lg font-semibold">Potential duplicates</h3>
              {result.potential_duplicates.length === 0 ? (
                <p className="mt-2 text-sm text-ink/65">No duplicates detected.</p>
              ) : (
                <ul className="mt-3 space-y-3 text-sm">
                  {result.potential_duplicates.map((entry) => (
                    <li key={entry.item} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="font-medium">{entry.item}</p>
                      <p className="mt-1 text-xs text-ink/65">
                        Similar to: {entry.similar_tasks.map((task) => task.title).join(", ")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-3xl border border-ink/10 bg-white/85 p-5 shadow-card">
              <h3 className="text-lg font-semibold">Needs clarification</h3>
              {result.needs_clarification.length === 0 ? (
                <p className="mt-2 text-sm text-ink/65">All good on clarity.</p>
              ) : (
                <ul className="mt-3 space-y-3 text-sm">
                  {result.needs_clarification.map((entry) => (
                    <li key={entry.item} className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                      <p className="font-medium">{entry.item}</p>
                      <p className="mt-1 text-xs text-ink/65">{entry.questions[0]}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
