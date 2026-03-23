/**
 * Risk Severity Badge Component
 */

import React from "react";
import type { RiskSeverity } from "@/lib/control-tower";

interface RiskBadgeProps {
  severity: RiskSeverity;
  className?: string;
}

export function RiskBadge({ severity, className = "" }: RiskBadgeProps) {
  const colors = {
    high: "border-oxblood/20 bg-oxblood/10 text-oxblood",
    medium: "border-amber/25 bg-amber/12 text-amber",
    low: "border-petrol/20 bg-petrol/10 text-petrol",
    none: "border-slate/20 bg-bone text-slate"
  };

  const labels = {
    high: "High Risk",
    medium: "Medium Risk",
    low: "Low Risk",
    none: "No Risk"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${colors[severity]} ${className}`}
    >
      {labels[severity]}
    </span>
  );
}
