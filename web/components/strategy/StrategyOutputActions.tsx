"use client";

import React, { useState } from "react";

type OutputType = "business_status_update" | "roadmap_update" | "executive_snapshot" | "board_summary";

const actions: Array<{ type: OutputType; label: string }> = [
  { type: "business_status_update", label: "Refresh business update" },
  { type: "roadmap_update", label: "Refresh roadmap update" },
  { type: "executive_snapshot", label: "Refresh executive snapshot" },
  { type: "board_summary", label: "Refresh board summary" }
];

export function StrategyOutputActions() {
  const [message, setMessage] = useState<string | null>(null);
  const [busyType, setBusyType] = useState<OutputType | null>(null);

  async function run(type: OutputType) {
    setBusyType(type);
    setMessage(null);

    const response = await fetch("/api/strategy/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type })
    });

    const data = (await response.json()) as { ok: boolean; data?: { path: string }; error?: { message: string } };

    if (data.ok && data.data) {
      setMessage(`Updated ${data.data.path}`);
    } else {
      setMessage(data.error?.message ?? "Unable to generate output.");
    }

    setBusyType(null);
  }

  return (
    <div className="rounded-[30px] border border-ink/10 bg-white/85 p-6 shadow-card backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Generate from UI</p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">Refresh current stakeholder outputs</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.type}
            type="button"
            onClick={() => void run(action.type)}
            disabled={busyType !== null}
            className="rounded-[18px] border border-ink/10 bg-cloud/80 px-4 py-3 text-left text-sm font-semibold text-ink transition hover:bg-cloud disabled:opacity-60"
          >
            {busyType === action.type ? "Refreshing…" : action.label}
          </button>
        ))}
      </div>
      {message ? <p className="mt-4 text-sm text-ink/65">{message}</p> : null}
    </div>
  );
}
