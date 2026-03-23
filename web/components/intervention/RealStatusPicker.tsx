"use client";

/**
 * RealStatusPicker
 *
 * Inline dropdown to set the director's real status override on a feature request.
 * Uses the M2P stuck-reason taxonomy.
 */

import React, { useState } from "react";
import {
  PRE_GROOMING_STATUSES,
  POST_GROOMING_STATUSES,
  REAL_STATUS_LABELS,
  REAL_STATUS_COLORS,
  type RealStatusValue,
} from "@/lib/control-tower/real-status-types";

interface RealStatusPickerProps {
  featureRequestId: string;
  jiraKeys: string[];
  currentStatus?: RealStatusValue;
  currentNote?: string;
  onSaved?: (status: RealStatusValue, note: string) => void;
  compact?: boolean; // true = just the pill, click to open inline editor
}

export function RealStatusPicker({
  featureRequestId,
  jiraKeys,
  currentStatus,
  currentNote,
  onSaved,
  compact = false,
}: RealStatusPickerProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<RealStatusValue | "">(currentStatus ?? "");
  const [note, setNote] = useState(currentNote ?? "");
  const [saving, setSaving] = useState(false);

  const colorClasses = currentStatus
    ? REAL_STATUS_COLORS[currentStatus]
    : { bg: "bg-bone", text: "text-slate", border: "border-slate/20" };

  const label = currentStatus ? REAL_STATUS_LABELS[currentStatus] : "Set real status";

  async function handleSave() {
    if (!status) return;
    setSaving(true);
    try {
      await fetch("/api/control-tower/real-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureRequestId, jiraKeys, status, note }),
      });
      onSaved?.(status as RealStatusValue, note);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative inline-block">
      {/* Pill trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border} hover:opacity-80`}
        title="Set real operational status"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        {label}
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="panel-surface absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl p-3">
          <p className="eyebrow-label mb-2">Real Status</p>

          {/* Pre-grooming */}
          <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-slate">Pre-Grooming</p>
          <div className="grid grid-cols-2 gap-1 mb-3">
            {PRE_GROOMING_STATUSES.map((s) => {
              const c = REAL_STATUS_COLORS[s];
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`text-left px-2 py-1.5 rounded text-xs border transition-all ${
                    status === s
                      ? `${c.bg} ${c.text} ${c.border} font-semibold ring-1 ring-offset-1 ring-current`
                      : "border-ink/10 text-ink/70 hover:bg-bone"
                  }`}
                >
                  {REAL_STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>

          {/* Post-grooming */}
          <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-slate">Post-Grooming</p>
          <div className="grid grid-cols-2 gap-1 mb-3">
            {POST_GROOMING_STATUSES.map((s) => {
              const c = REAL_STATUS_COLORS[s];
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`text-left px-2 py-1.5 rounded text-xs border transition-all ${
                    status === s
                      ? `${c.bg} ${c.text} ${c.border} font-semibold ring-1 ring-offset-1 ring-current`
                      : "border-ink/10 text-ink/70 hover:bg-bone"
                  }`}
                >
                  {REAL_STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>

          {/* Note */}
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="One-line note (optional)"
            className="paper-input mb-2 w-full rounded-xl px-2 py-1.5 text-xs focus:outline-none"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!status || saving}
              className="primary-button flex-1 rounded-xl py-1.5 text-xs disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="ghost-button rounded-xl px-3 py-1.5 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
