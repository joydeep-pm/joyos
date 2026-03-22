"use client";

import React, { useState, useMemo } from "react";
import clsx from "clsx";
import type { EpicItem, KpiMetric, InsightItem, GalleryItem } from "@/lib/strategy-command-center";
import { Q_META, CAT_COLORS } from "@/lib/strategy-command-center";

// ── Accent helpers ───────────────────────────────────────────────────────────

const ACCENT = {
  red:   { bar: "bg-red-500",    bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
  amber: { bar: "bg-amber-500",  bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  blue:  { bar: "bg-blue-500",   bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  green: { bar: "bg-emerald-500",bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "bg-slate-100 text-slate-600" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700"  },
  at_risk:     { label: "At Risk",     color: "bg-amber-100 text-amber-700" },
  blocked:     { label: "Blocked",     color: "bg-red-100 text-red-700"    },
  done:        { label: "Done",        color: "bg-emerald-100 text-emerald-700" },
};

// ── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ m }: { m: KpiMetric }) {
  const a = ACCENT[m.accent];
  return (
    <article className={clsx("rounded-2xl border p-4 shadow-sm", a.bg, a.border)}>
      <div className={clsx("h-0.5 w-10 rounded-full mb-3", a.bar)} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{m.label}</p>
      <p className={clsx("mt-1 text-2xl font-bold tracking-tight", a.text)}>{m.value}</p>
      <p className="mt-1 text-xs text-slate-500">{m.sub}</p>
    </article>
  );
}

function InsightPill({ ins }: { ins: InsightItem }) {
  const c = ACCENT[ins.color];
  return (
    <div className={clsx("flex items-center gap-3 rounded-xl border px-4 py-3", c.bg, c.border)}>
      <span className={clsx("text-lg font-bold", c.text)}>{ins.value}</span>
      <div>
        <p className="text-xs font-semibold text-slate-700">{ins.label}</p>
        <p className="text-[11px] text-slate-500">{ins.sub}</p>
      </div>
    </div>
  );
}

function EpicRow({ epic }: { epic: EpicItem }) {
  const s = STATUS_LABELS[epic.status] ?? STATUS_LABELS.not_started;
  const catColor = CAT_COLORS[epic.cat] ?? "#6B7280";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-sm hover:bg-slate-50 transition">
      <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }} />
      <code className="text-[11px] text-slate-400 w-16 flex-shrink-0">{epic.id}</code>
      <span className="flex-1 text-slate-800 truncate">{epic.name}</span>
      <span className="text-slate-400 text-xs">{epic.pd} PD</span>
      <span className={clsx("rounded-full px-2 py-0.5 text-[11px] font-semibold", s.color)}>{s.label}</span>
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────

interface StrategyStatusConsoleProps {
  kpiMetrics: KpiMetric[];
  insights: InsightItem[];
  epics: EpicItem[];
  gallery: GalleryItem[];
}

// ── Main component ───────────────────────────────────────────────────────────

export function StrategyStatusConsole({ kpiMetrics, insights, epics, gallery }: StrategyStatusConsoleProps) {
  const [scope, setScope]   = useState<"v" | "h" | "">("");
  const [quarter, setQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4" | "">("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  // derive gallery items for vertical/horizontal query columns
  const verticals   = gallery.filter(g => g.type === "v");
  const horizontals = gallery.filter(g => g.type === "h");

  // filtered epics for the Query Matrix
  const filteredEpics = useMemo(() => {
    let list = epics;
    if (quarter)      list = list.filter(e => e.quarter === quarter);
    if (statusFilter) list = list.filter(e => e.status  === statusFilter);
    if (search)       list = list.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.cat.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [epics, quarter, statusFilter, search]);

  // vertical-grouped epics
  const byVertical = useMemo(() => {
    const map = new Map<string, EpicItem[]>();
    verticals.forEach(v => {
      const matching = filteredEpics.filter(e => v.epics.includes(e.id));
      if (matching.length) map.set(v.name, matching);
    });
    return map;
  }, [filteredEpics, verticals]);

  // horizontal-grouped epics
  const byHorizontal = useMemo(() => {
    const map = new Map<string, EpicItem[]>();
    horizontals.forEach(h => {
      const matching = filteredEpics.filter(e => h.epics.includes(e.id));
      if (matching.length) map.set(h.name, matching);
    });
    return map;
  }, [filteredEpics, horizontals]);

  // quarter-grouped epics
  const byQuarter = useMemo(() => {
    const qs: Array<"Q1" | "Q2" | "Q3" | "Q4"> = ["Q1", "Q2", "Q3", "Q4"];
    const map = new Map<string, EpicItem[]>();
    qs.forEach(q => {
      const matching = filteredEpics.filter(e => e.quarter === q);
      if (matching.length) map.set(q, matching);
    });
    return map;
  }, [filteredEpics]);

  return (
    <div className="space-y-6">

      {/* KPI strip */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">FY27 Command Metrics</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpiMetrics.map(m => <KpiCard key={m.label} m={m} />)}
        </div>
      </section>

      {/* Insight strip */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">Key Insights</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {insights.map(ins => <InsightPill key={ins.label} ins={ins} />)}
        </div>
      </section>

      {/* Query Matrix */}
      <section>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mr-1">Status Query Matrix</p>
          {/* Quarter filter */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            {(["", "Q1", "Q2", "Q3", "Q4"] as const).map(q => (
              <button
                key={q || "all"}
                onClick={() => setQuarter(q)}
                className={clsx("px-3 py-1.5 text-xs font-semibold transition", quarter === q ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-50")}
                style={quarter === q && q ? { backgroundColor: Q_META[q]?.color } : {}}
              >
                {q || "All"}
              </button>
            ))}
          </div>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          {/* Search */}
          <input
            type="search"
            placeholder="Search EPICs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 w-48"
          />
          <span className="ml-auto text-xs text-slate-400">{filteredEpics.length} EPICs</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">

          {/* Col 1 – By Vertical */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> By Vertical
            </h4>
            <div className="space-y-4">
              {byVertical.size === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No matching EPICs</p>
              )}
              {[...byVertical.entries()].map(([vName, vEpics]) => (
                <div key={vName}>
                  <p className="text-xs font-semibold text-slate-600 mb-1.5">{vName}</p>
                  <div className="space-y-1">
                    {vEpics.map(e => <EpicRow key={e.id} epic={e} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2 – By Horizontal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> By Horizontal
            </h4>
            <div className="space-y-4">
              {byHorizontal.size === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No matching EPICs</p>
              )}
              {[...byHorizontal.entries()].map(([hName, hEpics]) => (
                <div key={hName}>
                  <p className="text-xs font-semibold text-slate-600 mb-1.5">{hName}</p>
                  <div className="space-y-1">
                    {hEpics.map(e => <EpicRow key={e.id} epic={e} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3 – By Quarter */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> By Quarter
            </h4>
            <div className="space-y-4">
              {byQuarter.size === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No matching EPICs</p>
              )}
              {[...byQuarter.entries()].map(([q, qEpics]) => {
                const meta = Q_META[q];
                return (
                  <div key={q}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold" style={{ color: meta?.color }}>{q}</span>
                      <span className="text-[11px] text-slate-400">{meta?.label}</span>
                      <span className="ml-auto text-[11px] text-slate-400">{qEpics.reduce((s, e) => s + e.pd, 0)} PD</span>
                    </div>
                    <div className="space-y-1">
                      {qEpics.map(e => <EpicRow key={e.id} epic={e} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
