/**
 * PM Owner Group Component
 */

"use client";

import React, { useState } from "react";
import { FeatureRequestCard } from "./FeatureRequestCard";
import type { PmOwnerGroup } from "@/lib/control-tower/intervention-engine";
import type { RealStatusEntry, RealStatusValue } from "@/lib/control-tower/real-status-types";

interface PmOwnerGroupProps {
  group: PmOwnerGroup;
  onOpenDetail?: (id: string) => void;
  realStatuses?: Record<string, RealStatusEntry>;
  onRealStatusSaved?: (id: string, status: RealStatusValue, note: string) => void;
}

export function PmOwnerGroup({ group, onOpenDetail, realStatuses = {}, onRealStatusSaved }: PmOwnerGroupProps) {
  const [isExpanded, setIsExpanded] = useState(group.totalRequiringIntervention > 0);

  return (
    <div className="panel-surface overflow-hidden rounded-[24px]">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 flex items-center justify-between transition-colors hover:bg-bone/80"
      >
        <div className="flex items-center gap-4">
          <h2 className="font-display text-[1.8rem] leading-none text-ink">{group.pmOwner}</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-slate/20 bg-bone px-2 py-1 text-xs font-semibold text-slate">
              {group.featureRequests.length} total
            </span>
            {group.totalRequiringIntervention > 0 && (
              <span className="rounded-full border border-oxblood/20 bg-oxblood/10 px-2 py-1 text-xs font-semibold text-oxblood">
                {group.totalRequiringIntervention} need{group.totalRequiringIntervention === 1 ? "s" : ""} intervention
              </span>
            )}
            {group.highRiskCount > 0 && (
              <span className="rounded-full border border-oxblood/20 bg-oxblood/10 px-2 py-1 text-xs font-semibold text-oxblood">
                {group.highRiskCount} high risk
              </span>
            )}
            {group.mediumRiskCount > 0 && (
              <span className="rounded-full border border-amber/25 bg-amber/12 px-2 py-1 text-xs font-semibold text-amber">
                {group.mediumRiskCount} medium risk
              </span>
            )}
          </div>
        </div>
        <div className="text-slate">
          {isExpanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>

      {/* Feature Requests */}
      {isExpanded && (
        <div className="px-6 pb-5 space-y-3">
          {group.featureRequests.map((fr) => (
            <FeatureRequestCard
              key={fr.id}
              featureRequest={fr}
              onOpenDetail={onOpenDetail}
              realStatus={realStatuses[fr.id]}
              onRealStatusSaved={onRealStatusSaved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
