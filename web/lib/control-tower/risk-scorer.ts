/**
 * Risk Scorer
 *
 * Calculates risk severity based on multiple factors.
 */

import type { RiskSeverity, FeatureRequestRiskSummary } from "./types";
import type { NormalizedJiraIssue } from "@/lib/integrations/jira";

/**
 * Calculate days since last update
 */
function daysSinceUpdate(updatedAt: string): number {
  const lastUpdate = new Date(updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - lastUpdate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if issue is overdue
 */
function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;

  const due = new Date(dueDate);
  const now = new Date();
  return now > due;
}

/**
 * Check if issue is blocked based on status
 */
function isBlocked(status: string): boolean {
  const blockedKeywords = ["blocked", "waiting", "on hold", "impediment"];
  const statusLower = status.toLowerCase();
  return blockedKeywords.some((keyword) => statusLower.includes(keyword));
}

/**
 * Calculate risk severity for a Jira issue
 */
export function calculateRiskSeverity(issue: NormalizedJiraIssue, hasClientUrgency: boolean = false): FeatureRequestRiskSummary {
  const factors: string[] = [];
  let riskScore = 0;

  // Factor 1: Days without update
  const daysSinceLastUpdate = daysSinceUpdate(issue.updatedAt);
  if (daysSinceLastUpdate > 14) {
    factors.push(`No update for ${daysSinceLastUpdate} days`);
    riskScore += 3;
  } else if (daysSinceLastUpdate > 7) {
    factors.push(`No update for ${daysSinceLastUpdate} days`);
    riskScore += 2;
  }

  // Factor 2: Overdue
  if (isOverdue(issue.dueDate)) {
    factors.push("Overdue");
    riskScore += 4;
  }

  // Factor 3: Blocked status
  if (isBlocked(issue.status)) {
    factors.push("Blocked status");
    riskScore += 3;
  }

  // Factor 4: High priority
  if (issue.priority?.toLowerCase().includes("high") || issue.priority?.toLowerCase().includes("critical")) {
    factors.push("High priority");
    riskScore += 2;
  }

  // Factor 5: Client urgency signal
  if (hasClientUrgency) {
    factors.push("Client escalation");
    riskScore += 3;
  }

  // Factor 6: No assignee
  if (!issue.assignee) {
    factors.push("Unassigned");
    riskScore += 2;
  }

  // Determine severity based on total risk score
  let severity: RiskSeverity = "none";
  if (riskScore >= 8) {
    severity = "high";
  } else if (riskScore >= 5) {
    severity = "medium";
  } else if (riskScore >= 2) {
    severity = "low";
  }

  return {
    severity,
    factors
  };
}
