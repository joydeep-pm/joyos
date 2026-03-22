"use client";

import React, { useState, useMemo } from "react";
import clsx from "clsx";
import type { EpicItem } from "@/lib/strategy-command-center";
import { Q_META, CAT_COLORS } from "@/lib/strategy-command-center";

type RoadmapStatus = EpicItem["status"];

const STATUS_CFG: Record<RoadmapStatus, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "bg-slate-100 text-slate-600" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700"  },
  at_risk:     { label: "At Risk",     color: "bg-amber-100 text-amber-700" },
  blocked:     { label: "Blocked",     color: "bg-red-100 text-red-700"    },
  done:        { label: "Done",        color: "bg-emerald-100 text-emerald-700" },
};

const PRIO_CFG: Record<string, string> = {
  P0: "bg-red-100 text-red-700 border border-red-200",
  P1: "bg-amber-100 text-amber-700 border border-amber-200",
  P2: "bg-slate-100 text-slate-500 border border-slate-200",
};

interface StrategyAopTableProps {
  epics: EpicItem[];
}

export function StrategyAopTable({ epics }: StrategyAopTableProps) {
  const quarters: Array<"Q1" | "Q2" | "Q3" | "Q4" | "ALL"> = ["ALL", "Q1", "Q2", "Q3", "Q4"];
  const [activeQ, setActiveQ] = useState<typeof quarters[number]>("ALL");
  const [search, setSearch]   = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const allCats = useMemo(() => Array.from(new Set(epics.map(e => e.cat))).sort(), [epics]);

  const filtered = useMemo(() => {
    return epics.filter(e => {
      if (activeQ !== "ALL" && e.quarter !== activeQ) return false;
      if (catFilter    && e.cat    !== catFilter)    return false;
      if (statusFilter && e.status !== statusFilter) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) &&
                    !e.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [epics, activeQ, catFilter, statusFilter, search]);

  const totalPd = filtered.reduce((s, e) => s + e.pd, 0);

  return (
    <div className="space-y-4">

      {/* AOP header strip */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap gap-6 items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Roadmap</p>
          <p className="mt-0.5 text-2xl font-bold text-slate-800">5,551 PD</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">EPICs</p>
          <p className="mt-0.5 text-2xl font-bold text-slate-800">42</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">AI Recovery</p>
          <p className="mt-0.5 text-2xl font-bold text-emerald-700">1,100-1,400 PD</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Team Size</p>
          <p className="mt-0.5 text-2xl font-bold text-slate-800">~40-45 eng</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Showing</p>
          <p className="mt-0.5 text-lg font-bold text-slate-700">{filtered.length} EPICs · {totalPd} PD</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Quarter tabs */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          {quarters.map(q => (
            <button
              key={q}
              onClick={() => setActiveQ(q)}
              className={clsx("px-3 py-1.5 text-xs font-semibold transition", activeQ === q ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-50")}
              style={activeQ === q && q !== "ALL" ? { backgroundColor: Q_META[q]?.color } : {}}
            >
              {q === "ALL" ? "All Quarters" : q}
            </button>
          ))}
        </div>

        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All Categories</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        <input
          type="search"
          placeholder="Search EPICs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 w-44"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 text-left">EPIC ID</th>
              <th className="px-4 py-3 text-left">Qtr</th>
              <th className="px-4 py-3 text-left">Feature / Module</th>
              <th className="px-4 py-3 text-right">PD</th>
              <th className="px-4 py-3 text-center">Priority</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Loss / Opp</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-xs text-slate-400">No matching EPICs</td>
              </tr>
            ) : (
              filtered.map(epic => {
                const s = STATUS_CFG[epic.status] ?? STATUS_CFG.not_started;
                const catColor = CAT_COLORS[epic.cat] ?? "#6B7280";
                const qMeta = Q_META[epic.quarter];
                return (
                  <tr key={epic.id} className="hover:bg-slate-50 transition" title={epic.notes}>
                    <td className="px-4 py-3">
                      <code className="text-[12px] font-mono text-slate-500">{epic.id}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold" style={{ color: qMeta?.color }}>{epic.quarter}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm font-medium text-slate-800 truncate">{epic.name}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-slate-700">{epic.pd}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={clsx("rounded-full px-2 py-0.5 text-[11px] font-bold", PRIO_CFG[epic.prio] ?? PRIO_CFG.P2)}>{epic.prio}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: catColor }}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }} />
                        {epic.cat}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx("text-xs font-semibold", epic.loss !== "-" ? "text-red-600" : "text-slate-300")}>
                        {epic.loss !== "-" ? epic.loss : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx("rounded-full px-2 py-0.5 text-[11px] font-semibold", s.color)}>{s.label}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-slate-600">{filtered.length} EPICs</td>
                <td className="px-4 py-2.5 text-right text-sm font-bold text-slate-700">{totalPd}</td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
