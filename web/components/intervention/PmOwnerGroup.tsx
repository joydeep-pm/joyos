/**
 * PM Owner Group Component
 */

"use client";

import React, { useState } from "react";
import { FeatureRequestCard } from "./FeatureRequestCard";
import type { PmOwnerGroup } from "@/lib/control-tower/intervention-engine";

interface PmOwnerGroupProps {
  group: PmOwnerGroup;
  onOpenDetail?: (id: string) => void;
}

export function PmOwnerGroup({ group, onOpenDetail }: PmOwnerGroupProps) {
  const [isExpanded, setIsExpanded] = useState(group.totalRequiringIntervention > 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">{group.pmOwner}</h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
              {group.featureRequests.length} total
            </span>
            {group.totalRequiringIntervention > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                {group.totalRequiringIntervention} need{group.totalRequiringIntervention === 1 ? "s" : ""} intervention
              </span>
            )}
            {group.highRiskCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                {group.highRiskCount} high risk
              </span>
            )}
            {group.mediumRiskCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                {group.mediumRiskCount} medium risk
              </span>
            )}
          </div>
        </div>
        <div className="text-gray-400">
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
        <div className="px-6 pb-4 space-y-3">
          {group.featureRequests.map((fr) => (
            <FeatureRequestCard key={fr.id} featureRequest={fr} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      )}
    </div>
  );
}
