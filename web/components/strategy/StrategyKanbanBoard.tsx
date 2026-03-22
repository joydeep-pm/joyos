"use client";

import React, { useState } from "react";
import clsx from "clsx";
import type { EpicItem } from "@/lib/strategy-command-center";
import { Q_META, CAT_COLORS } from "@/lib/strategy-command-center";

const STATUS_CFG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  not_started: { label: "Not Started", dot: "bg-slate-400",   bg: "bg-slate-100",   text: "text-slate-600" },
  in_progress: { label: "In Progress", dot: "bg-blue-500",    bg: "bg-blue-50",     text: "text-blue-700"  },
  at_risk:     { label: "At Risk",     dot: "bg-amber-500",   bg: "bg-amber-50",    text: "text-amber-700" },
  blocked:     { label: "Blocked",     dot: "bg-red-500",     bg: "bg-red-50",      text: "text-red-700"   },
  done:        { label: "Done",        dot: "bg-emerald-500", bg: "bg-emerald-50",  text: "text-emerald-700" },
};

const PRIO_CFG: Record<string, { label: string; color: string }> = {
  P0: { label: "P0", color: "bg-red-100 text-red-700 border border-red-200" },
  P1: { label: "P1", color: "bg-amber-100 text-amber-700 border border-amber-200" },
  P2: { label: "P2", color: "bg-slate-100 text-slate-600 border border-slate-200" },
};

function EpicCard({ epic }: { epic: EpicItem }) {
  const [expanded, setExpanded] = useState(false);
  const prio = PRIO_CFG[epic.prio] ?? PRIO_CFG.P2;
  const status = STATUS_CFG[epic.status] ?? STATUS_CFG.not_started;
  const catColor = CAT_COLORS[epic.cat] ?? "#6B7280";

  return (
    <article
      className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={() => setExpanded(e => !e)}
    >
      {/* Color bar */}
      <div className="h-1 rounded-t-2xl" style={{ backgroundColor: catColor }} />

      <div className="p-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <code className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5">{epic.id}</code>
          <span className={clsx("rounded-full px-2 py-0.5 text-[10px] font-bold flex-shrink-0", prio.color)}>{prio.label}</span>
        </div>

        {/* Name */}
        <p className="mt-1.5 text-xs font-semibold text-slate-800 leading-snug">{epic.name}</p>

        {/* Meta row */}
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500">{epic.pd} PD</span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px]" style={{ color: catColor }}>{epic.cat}</span>
          {epic.loss !== "-" && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-semibold text-red-600">{epic.loss}</span>
            </>
          )}
        </div>

        {/* Status badge */}
        <div className="mt-2">
          <span className={clsx("rounded-full px-2 py-0.5 text-[10px] font-semibold", status.bg, status.text)}>
            <span className={clsx("inline-block w-1.5 h-1.5 rounded-full mr-1", status.dot)} />
            {status.label}
          </span>
        </div>

        {/* Expanded notes */}
        {expanded && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[11px] leading-relaxed text-slate-500">{epic.notes}</p>
          </div>
        )}
      </div>
    </article>
  );
}

interface StrategyKanbanBoardProps {
  epics: EpicItem[];
}

export function StrategyKanbanBoard({ epics }: StrategyKanbanBoardProps) {
  const [filterQ, setFilterQ]     = useState<"Q1" | "Q2" | "Q3" | "Q4" | "">("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch]       = useState("");

  const quarters: Array<"Q1" | "Q2" | "Q3" | "Q4"> = ["Q1", "Q2", "Q3", "Q4"];
  const allCats = Array.from(new Set(epics.map(e => e.cat))).sort();

  function filtered(q: "Q1" | "Q2" | "Q3" | "Q4") {
    if (filterQ && filterQ !== q) return [];
    return epics.filter(e => {
      if (e.quarter !== q) return false;
      if (filterCat    && e.cat    !== filterCat)    return false;
      if (filterStatus && e.status !== filterStatus) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) &&
                    !e.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }

  return (
    <div className="space-y-5">

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Quarter quick filter */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          {(["", ...quarters] as const).map(q => (
            <button
              key={q || "all"}
              onClick={() => setFilterQ(q)}
              className={clsx("px-3 py-1.5 text-xs font-semibold transition", filterQ === q ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-50")}
              style={filterQ === q && q ? { backgroundColor: Q_META[q]?.color } : {}}
            >
              {q || "All"}
            </button>
          ))}
        </div>

        {/* Category */}
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All Categories</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Status */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        {/* Search */}
        <input
          type="search"
          placeholder="Search EPICs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 w-44"
        />

        {/* Category legend */}
        <div className="ml-auto flex flex-wrap gap-1.5">
          {Object.entries(CAT_COLORS).map(([cat, color]) => (
            <button
              key={cat}
              onClick={() => setFilterCat(filterCat === cat ? "" : cat)}
              className={clsx("flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition", filterCat === cat ? "border-slate-400 bg-slate-100" : "border-slate-200 bg-white hover:bg-slate-50")}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban columns */}
      <div className={clsx("grid gap-4", filterQ ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4")}>
        {quarters
          .filter(q => !filterQ || filterQ === q)
          .map(q => {
            const cards  = filtered(q);
            const meta   = Q_META[q];
            const totalPd = epics.filter(e => e.quarter === q).reduce((s, e) => s + e.pd, 0);
            return (
              <div key={q} className="rounded-2xl border border-slate-200 bg-slate-50 flex flex-col overflow-hidden">
                {/* Column header */}
                <div className="p-3 border-b border-slate-200" style={{ borderTopColor: meta?.color, borderTopWidth: 3 }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold" style={{ color: meta?.color }}>{q}</span>
                      <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{meta?.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{cards.length} / {epics.filter(e => e.quarter === q).length}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{meta?.sub} · {totalPd} PD total</p>
                </div>
                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 600 }}>
                  {cards.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No matching EPICs</p>
                  ) : (
                    cards.map(e => <EpicCard key={e.id} epic={e} />)
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
