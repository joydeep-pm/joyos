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
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-blue-100 text-blue-800 border-blue-200",
    none: "bg-gray-100 text-gray-600 border-gray-200"
  };

  const labels = {
    high: "High Risk",
    medium: "Medium Risk",
    low: "Low Risk",
    none: "No Risk"
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded border ${colors[severity]} ${className}`}
    >
      {labels[severity]}
    </span>
  );
}
