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
    : { bg: "bg-gray-50", text: "text-gray-400", border: "border-gray-200" };

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
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-72 p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Real Status</p>

          {/* Pre-grooming */}
          <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest">Pre-Grooming</p>
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
                      : "border-gray-100 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {REAL_STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>

          {/* Post-grooming */}
          <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest">Post-Grooming</p>
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
                      : "border-gray-100 text-gray-600 hover:bg-gray-50"
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
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!status || saving}
              className="flex-1 py-1.5 bg-blue-600 text-white text-xs rounded font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
