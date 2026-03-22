"use client";

import React, { useState } from "react";
import clsx from "clsx";

export type StrategyTabId = "overview" | "strategy" | "roadmap" | "aop" | "risks" | "deepdives";

interface StrategyClientShellProps {
  overview: React.ReactNode;
  strategy: React.ReactNode;
  roadmap: React.ReactNode;
  aop: React.ReactNode;
  risks: React.ReactNode;
  deepdives: React.ReactNode;
}

const tabs: Array<{ id: StrategyTabId; label: string; subtitle: string }> = [
  { id: "overview",  label: "Overview",         subtitle: "KPIs + status query" },
  { id: "strategy",  label: "Product Strategy",  subtitle: "Pillars, parity, moats" },
  { id: "roadmap",   label: "Roadmap",           subtitle: "EPIC kanban board" },
  { id: "aop",       label: "AOP Planning",      subtitle: "Full EPIC table" },
  { id: "risks",     label: "Risks & Hiring",    subtitle: "Register + decisions" },
  { id: "deepdives", label: "Deep-Dives",        subtitle: "Verticals + horizontals" },
];

export function StrategyClientShell({ overview, strategy, roadmap, aop, risks, deepdives }: StrategyClientShellProps) {
  const [activeTab, setActiveTab] = useState<StrategyTabId>("overview");

  const panels: Record<StrategyTabId, React.ReactNode> = { overview, strategy, roadmap, aop, risks, deepdives };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-ink/10 bg-white/80 p-3 shadow-card backdrop-blur">
        <div role="tablist" aria-label="Strategy sections" className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                id={`strategy-tab-${tab.id}`}
                role="tab"
                aria-selected={active}
                aria-controls={`strategy-panel-${tab.id}`}
                data-state={active ? "active" : "inactive"}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "rounded-[20px] px-4 py-3 text-left transition",
                  active ? "bg-ink text-cloud shadow-sm" : "bg-cloud/70 text-ink/75 hover:bg-cloud"
                )}
              >
                <div className="text-sm font-semibold tracking-tight">{tab.label}</div>
                <div className={clsx("text-xs", active ? "text-cloud/70" : "text-ink/45")}>{tab.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <section
            key={tab.id}
            id={`strategy-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`strategy-tab-${tab.id}`}
            aria-hidden={!active}
            hidden={!active}
            data-state={active ? "active" : "inactive"}
            className={clsx(active ? "block" : "hidden")}
          >
            {panels[tab.id]}
          </section>
        );
      })}
    </div>
  );
}

