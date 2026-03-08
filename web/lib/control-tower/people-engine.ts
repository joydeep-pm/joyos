/**
 * People Management Engine
 *
 * Logic for PM coaching, 1:1 prep, and performance evidence extraction
 */

import type { FeatureRequest } from "./types";
import type { PMProfile, PMPerformanceSummary, PerformanceEvidence } from "./people-types";

/**
 * Extract performance evidence from feature requests
 */
export function extractPerformanceEvidence(
  featureRequests: FeatureRequest[],
  pmName: string
): PerformanceEvidence[] {
  const evidence: PerformanceEvidence[] = [];
  const pmFeatureRequests = featureRequests.filter((fr) => fr.pmOwner === pmName);

  for (const fr of pmFeatureRequests) {
    // Positive evidence: PRD quality (has Confluence page)
    if (fr.confluencePages.length > 0) {
      evidence.push({
        featureRequestId: fr.id,
        featureRequestTitle: fr.title,
        evidenceType: "positive",
        category: "prd_quality",
        description: `Documented PRD: ${fr.confluencePages[0].title}`,
        date: fr.updatedAt
      });
    }

    // Developmental evidence: Repeated blockers
    if (fr.blockerSummary.hasBlockers) {
      for (const blocker of fr.blockerSummary.blockers) {
        if (blocker.daysOpen > 7) {
          evidence.push({
            featureRequestId: fr.id,
            featureRequestTitle: fr.title,
            evidenceType: "developmental",
            category: "blocker_resolution",
            description: `Blocker open for ${blocker.daysOpen} days: ${blocker.description}`,
            date: fr.updatedAt
          });
        }
      }
    }

    // Positive evidence: Completed delivery
    if (fr.stage === "prod_deploy") {
      evidence.push({
        featureRequestId: fr.id,
        featureRequestTitle: fr.title,
        evidenceType: "positive",
        category: "delivery",
        description: `Successfully delivered to production`,
        date: fr.updatedAt
      });
    }

    // Developmental evidence: Stale feature requests
    const daysSinceUpdate = Math.floor(
      (new Date().getTime() - new Date(fr.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdate > 14 && ["pm_exploration", "prd_drafting"].includes(fr.stage)) {
      evidence.push({
        featureRequestId: fr.id,
        featureRequestTitle: fr.title,
        evidenceType: "developmental",
        category: "communication",
        description: `No update in ${daysSinceUpdate} days while in ${fr.stage}`,
        date: fr.updatedAt
      });
    }
  }

  return evidence;
}

/**
 * Generate PM performance summary
 */
export function generatePMPerformanceSummary(
  featureRequests: FeatureRequest[],
  pmProfile: PMProfile,
  periodStart: Date,
  periodEnd: Date
): PMPerformanceSummary {
  const pmFeatureRequests = featureRequests.filter(
    (fr) => fr.pmOwner === pmProfile.name &&
    new Date(fr.updatedAt) >= periodStart &&
    new Date(fr.updatedAt) <= periodEnd
  );

  const evidenceItems = extractPerformanceEvidence(featureRequests, pmProfile.name);

  const activeFeatureRequests = pmFeatureRequests.filter(
    (fr) => !["prod_deploy"].includes(fr.stage)
  ).length;

  const completedFeatureRequests = pmFeatureRequests.filter(
    (fr) => fr.stage === "prod_deploy"
  ).length;

  const blockedFeatureRequests = pmFeatureRequests.filter(
    (fr) => fr.blockerSummary.hasBlockers
  ).length;

  // Calculate average time to resolution (simplified)
  const completedFRs = pmFeatureRequests.filter((fr) => fr.stage === "prod_deploy");
  const avgTimeToResolution = completedFRs.length > 0
    ? completedFRs.reduce((sum, fr) => {
        const days = Math.floor(
          (new Date(fr.updatedAt).getTime() - new Date(fr.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0) / completedFRs.length
    : 0;

  // Derive strengths and development areas
  const positiveEvidence = evidenceItems.filter((e) => e.evidenceType === "positive");
  const developmentalEvidence = evidenceItems.filter((e) => e.evidenceType === "developmental");

  const strengths: string[] = [];
  if (positiveEvidence.filter((e) => e.category === "prd_quality").length > 3) {
    strengths.push("Consistent PRD documentation");
  }
  if (completedFeatureRequests > 0) {
    strengths.push(`${completedFeatureRequests} feature(s) delivered to production`);
  }
  if (blockedFeatureRequests === 0) {
    strengths.push("No active blockers");
  }

  const developmentAreas: string[] = [];
  if (blockedFeatureRequests > 2) {
    developmentAreas.push("Multiple blocked feature requests - focus on dependency management");
  }
  if (developmentalEvidence.filter((e) => e.category === "communication").length > 2) {
    developmentAreas.push("Frequent communication gaps - increase update cadence");
  }

  return {
    pmId: pmProfile.id,
    pmName: pmProfile.name,
    period: `${periodStart.toISOString().split("T")[0]} to ${periodEnd.toISOString().split("T")[0]}`,
    featureRequestCount: pmFeatureRequests.length,
    activeFeatureRequests,
    completedFeatureRequests,
    blockedFeatureRequests,
    averageTimeToResolution: Math.round(avgTimeToResolution),
    evidenceItems,
    strengths,
    developmentAreas
  };
}

/**
 * Get PM portfolio (all feature requests owned by PM)
 */
export function getPMPortfolio(
  featureRequests: FeatureRequest[],
  pmName: string
): FeatureRequest[] {
  return featureRequests.filter((fr) => fr.pmOwner === pmName);
}

/**
 * Check if PM 1:1 is overdue
 */
export function isOneOnOneOverdue(pmProfile: PMProfile, daysSinceLastOneOnOne: number = 30): boolean {
  if (!pmProfile.lastOneOnOneDate) return true;

  const daysSince = Math.floor(
    (new Date().getTime() - new Date(pmProfile.lastOneOnOneDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSince > daysSinceLastOneOnOne;
}

/**
 * Get PMs needing 1:1s
 */
export function getPMsNeedingOneOnOnes(pmProfiles: PMProfile[]): PMProfile[] {
  return pmProfiles.filter((pm) => isOneOnOneOverdue(pm));
}
