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
    high: "border-oxblood/20 bg-oxblood/10 text-oxblood",
    medium: "border-amber/25 bg-amber/12 text-amber",
    low: "border-petrol/20 bg-petrol/10 text-petrol",
    none: "border-slate/20 bg-bone text-slate"
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
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${severityColors[reason.severity]}`}
    >
      <span>{typeIcons[reason.type]}</span>
      <span>{reason.message}</span>
    </div>
  );
}
