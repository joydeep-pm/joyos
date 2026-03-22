"use client";

import React, { useState } from "react";
import clsx from "clsx";

export type StrategyTabId = "overview" | "roadmap" | "outputs";

interface StrategyClientShellProps {
  overview: React.ReactNode;
  roadmap: React.ReactNode;
  outputs: React.ReactNode;
}

const tabs: Array<{ id: StrategyTabId; label: string; subtitle: string }> = [
  { id: "overview", label: "Overview", subtitle: "Whole picture" },
  { id: "roadmap", label: "Roadmap", subtitle: "Protection and risk" },
  { id: "outputs", label: "Outputs", subtitle: "Shareable updates" }
];

export function StrategyClientShell({ overview, roadmap, outputs }: StrategyClientShellProps) {
  const [activeTab, setActiveTab] = useState<StrategyTabId>("overview");

  const panels: Record<StrategyTabId, React.ReactNode> = {
    overview,
    roadmap,
    outputs
  };

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
