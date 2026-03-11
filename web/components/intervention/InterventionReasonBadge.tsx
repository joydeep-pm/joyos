/**
 * Intervention Reason Badge Component
 */

import React from "react";
import type { InterventionReason } from "@/lib/control-tower/intervention-engine";

interface InterventionReasonBadgeProps {
  reason: InterventionReason;
}

export function InterventionReasonBadge({ reason }: InterventionReasonBadgeProps) {
  const severityColors = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    low: "bg-blue-50 text-blue-700 border-blue-200",
    none: "bg-gray-50 text-gray-700 border-gray-200"
  };

  const typeIcons = {
    pm_blocked: "⚠️",
    engineering_stale: "🔧",
    client_escalation_aging: "🔥",
    unclear_requirements: "📝",
    leadership_update_due: "📊",
    grooming_readiness: "📋",
    high_risk_no_action: "🚨"
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border ${severityColors[reason.severity]}`}
    >
      <span>{typeIcons[reason.type]}</span>
      <span>{reason.message}</span>
    </div>
  );
}
