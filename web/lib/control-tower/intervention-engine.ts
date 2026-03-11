/**
 * Intervention Engine
 *
 * Determines where director intervention is needed and generates the daily intervention brief.
 */

import { evaluateReadiness } from "./readiness-evaluator";
import type {
  EnrichedFeatureRequest,
  FeatureRequest,
  FeatureRequestReviewOverlay,
  FeatureRequestReviewRecord,
  RiskSeverity
} from "./types";

export type InterventionReasonType =
  | "pm_blocked"
  | "engineering_stale"
  | "client_escalation_aging"
  | "unclear_requirements"
  | "leadership_update_due"
  | "grooming_readiness"
  | "high_risk_no_action";

export interface InterventionReason {
  type: InterventionReasonType;
  severity: RiskSeverity;
  message: string;
  daysSince?: number;
}

export interface FeatureRequestWithIntervention extends EnrichedFeatureRequest {
  interventionReasons: InterventionReason[];
  requiresIntervention: boolean;
  interventionPriority: number; // Higher = more urgent
}

export interface PmOwnerGroup {
  pmOwner: string;
  featureRequests: FeatureRequestWithIntervention[];
  highRiskCount: number;
  mediumRiskCount: number;
  totalRequiringIntervention: number;
}

export interface InterventionBrief {
  generatedAt: string;
  date: string;
  pmGroups: PmOwnerGroup[];
  totalFeatureRequests: number;
  totalRequiringIntervention: number;
  summary: string;
}

export interface InterventionAnalysisOptions {
  reviewsByFeatureRequestId?: Record<string, FeatureRequestReviewRecord>;
}

function buildReviewOverlay(
  featureRequestId: string,
  options?: InterventionAnalysisOptions
): FeatureRequestReviewOverlay {
  const review = options?.reviewsByFeatureRequestId?.[featureRequestId] ?? null;

  return review
    ? {
        present: true,
        record: review
      }
    : {
        present: false,
        record: null
      };
}

function buildFallbackReadiness(featureRequest: FeatureRequest): EnrichedFeatureRequest["readiness"] {
  return evaluateReadiness(featureRequest);
}

function ensureEnrichedFeatureRequest(
  featureRequest: FeatureRequest,
  options?: InterventionAnalysisOptions
): EnrichedFeatureRequest {
  const candidate = featureRequest as Partial<EnrichedFeatureRequest>;

  return {
    ...featureRequest,
    readiness: candidate.readiness ?? buildFallbackReadiness(featureRequest),
    review: candidate.review ?? buildReviewOverlay(featureRequest.id, options)
  };
}

/**
 * Calculate days since last update
 */
function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Detect intervention reasons for a feature request
 */
export function detectInterventionReasons(fr: FeatureRequest): InterventionReason[] {
  const reasons: InterventionReason[] = [];

  // 1. PM blocked
  const pmBlocker = fr.blockerSummary.blockers.find((b) => b.type === "pm");
  if (pmBlocker) {
    reasons.push({
      type: "pm_blocked",
      severity: pmBlocker.daysOpen > 7 ? "high" : "medium",
      message: `Blocked on PM for ${pmBlocker.daysOpen} days`,
      daysSince: pmBlocker.daysOpen
    });
  }

  // 2. Engineering dependency stale
  const engineeringBlocker = fr.blockerSummary.blockers.find((b) => b.type === "engineering");
  if (engineeringBlocker && engineeringBlocker.daysOpen > 5) {
    reasons.push({
      type: "engineering_stale",
      severity: engineeringBlocker.daysOpen > 10 ? "high" : "medium",
      message: `Waiting on engineering for ${engineeringBlocker.daysOpen} days`,
      daysSince: engineeringBlocker.daysOpen
    });
  }

  // 3. Client escalation aging
  if (fr.source === "client_escalation") {
    const daysSinceUpdate = daysSince(fr.updatedAt);
    if (daysSinceUpdate > 3) {
      reasons.push({
        type: "client_escalation_aging",
        severity: daysSinceUpdate > 7 ? "high" : "medium",
        message: `Client escalation no update for ${daysSinceUpdate} days`,
        daysSince: daysSinceUpdate
      });
    }
  }

  // 4. Unclear requirements
  if (
    (fr.stage === "incoming" || fr.stage === "ba_grooming" || fr.stage === "pm_exploration") &&
    fr.confluencePages.length === 0
  ) {
    const daysSinceCreated = daysSince(fr.createdAt);
    if (daysSinceCreated > 7) {
      reasons.push({
        type: "unclear_requirements",
        severity: "medium",
        message: `No requirements doc after ${daysSinceCreated} days`,
        daysSince: daysSinceCreated
      });
    }
  }

  // 5. Leadership update due (if high priority and in delivery for >14 days)
  if (
    fr.riskSummary.severity === "high" &&
    (fr.stage === "in_delivery" || fr.stage === "testing") &&
    daysSince(fr.updatedAt) > 14
  ) {
    reasons.push({
      type: "leadership_update_due",
      severity: "medium",
      message: "High-priority item may need leadership update",
      daysSince: daysSince(fr.updatedAt)
    });
  }

  // 6. Grooming readiness issue
  if (fr.stage === "director_review") {
    reasons.push({
      type: "grooming_readiness",
      severity: "low",
      message: "May not be ready for grooming"
    });
  } else if (
    fr.stage === "estimation" &&
    (fr.confluencePages.length === 0 || fr.blockerSummary.hasBlockers)
  ) {
    reasons.push({
      type: "grooming_readiness",
      severity: "low",
      message: "May not be ready for grooming"
    });
  }

  // 7. High risk with no recent action
  if (fr.riskSummary.severity === "high" && daysSince(fr.updatedAt) > 3) {
    reasons.push({
      type: "high_risk_no_action",
      severity: "high",
      message: `High-risk item stale for ${daysSince(fr.updatedAt)} days`,
      daysSince: daysSince(fr.updatedAt)
    });
  }

  return reasons;
}

/**
 * Calculate intervention priority score
 */
function calculateInterventionPriority(reasons: InterventionReason[]): number {
  let priority = 0;

  for (const reason of reasons) {
    // Base points for having the reason
    priority += 10;

    // Severity multiplier
    if (reason.severity === "high") priority += 20;
    else if (reason.severity === "medium") priority += 10;
    else priority += 5;

    // Age multiplier
    if (reason.daysSince) {
      if (reason.daysSince > 14) priority += 15;
      else if (reason.daysSince > 7) priority += 10;
      else if (reason.daysSince > 3) priority += 5;
    }

    // Type-specific boosts
    if (reason.type === "client_escalation_aging") priority += 15;
    if (reason.type === "high_risk_no_action") priority += 20;
    if (reason.type === "pm_blocked") priority += 10;
  }

  return priority;
}

/**
 * Add intervention analysis to feature requests
 */
export function analyzeForIntervention(
  featureRequests: FeatureRequest[],
  options?: InterventionAnalysisOptions
): FeatureRequestWithIntervention[] {
  return featureRequests.map((featureRequest) => {
    const enriched = ensureEnrichedFeatureRequest(featureRequest, options);
    const interventionReasons = detectInterventionReasons(enriched);
    const interventionPriority = calculateInterventionPriority(interventionReasons);

    return {
      ...enriched,
      interventionReasons,
      requiresIntervention: interventionReasons.length > 0,
      interventionPriority
    };
  });
}

/**
 * Group feature requests by PM owner
 */
export function groupByPmOwner(
  featureRequests: FeatureRequestWithIntervention[]
): PmOwnerGroup[] {
  const grouped = new Map<string, FeatureRequestWithIntervention[]>();

  for (const fr of featureRequests) {
    const owner = fr.pmOwner ?? "Unassigned";
    if (!grouped.has(owner)) {
      grouped.set(owner, []);
    }
    grouped.get(owner)!.push(fr);
  }

  // Convert to array and sort each group by intervention priority
  return Array.from(grouped.entries()).map(([pmOwner, requests]) => {
    // Sort by intervention priority descending, then by risk severity
    const sorted = requests.sort((a, b) => {
      if (b.interventionPriority !== a.interventionPriority) {
        return b.interventionPriority - a.interventionPriority;
      }
      return riskSeverityScore(b.riskSummary.severity) - riskSeverityScore(a.riskSummary.severity);
    });

    return {
      pmOwner,
      featureRequests: sorted,
      highRiskCount: sorted.filter((fr) => fr.riskSummary.severity === "high").length,
      mediumRiskCount: sorted.filter((fr) => fr.riskSummary.severity === "medium").length,
      totalRequiringIntervention: sorted.filter((fr) => fr.requiresIntervention).length
    };
  });
}

/**
 * Convert risk severity to numeric score for sorting
 */
function riskSeverityScore(severity: RiskSeverity): number {
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  if (severity === "low") return 1;
  return 0;
}

/**
 * Generate intervention brief
 */
export function generateInterventionBrief(
  featureRequests: FeatureRequest[],
  options?: InterventionAnalysisOptions
): InterventionBrief {
  const analyzed = analyzeForIntervention(featureRequests, options);
  const pmGroups = groupByPmOwner(analyzed);

  // Sort PM groups by total requiring intervention (descending)
  pmGroups.sort((a, b) => b.totalRequiringIntervention - a.totalRequiringIntervention);

  const totalRequiringIntervention = analyzed.filter((fr) => fr.requiresIntervention).length;

  const summary = generateSummary(pmGroups, totalRequiringIntervention);

  return {
    generatedAt: new Date().toISOString(),
    date: new Date().toISOString().split("T")[0],
    pmGroups,
    totalFeatureRequests: featureRequests.length,
    totalRequiringIntervention,
    summary
  };
}

/**
 * Generate summary text for the brief
 */
function generateSummary(pmGroups: PmOwnerGroup[], totalRequiringIntervention: number): string {
  if (totalRequiringIntervention === 0) {
    return "All feature requests are on track. No immediate intervention required.";
  }

  const criticalPms = pmGroups.filter((g) => g.highRiskCount > 0);
  const criticalCount = criticalPms.reduce((sum, g) => sum + g.highRiskCount, 0);

  let summary = `${totalRequiringIntervention} feature request${totalRequiringIntervention > 1 ? "s" : ""} require${totalRequiringIntervention === 1 ? "s" : ""} intervention. `;

  if (criticalCount > 0) {
    summary += `${criticalCount} high-risk item${criticalCount > 1 ? "s" : ""} across ${criticalPms.length} PM${criticalPms.length > 1 ? "s" : ""}. `;
  }

  const topPm = pmGroups[0];
  if (topPm && topPm.totalRequiringIntervention > 0) {
    summary += `Focus on ${topPm.pmOwner} (${topPm.totalRequiringIntervention} item${topPm.totalRequiringIntervention > 1 ? "s" : ""}).`;
  }

  return summary;
}
