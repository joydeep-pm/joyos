/**
 * Grooming Engine
 *
 * Logic for preparing biweekly engineering grooming sessions.
 * Categorizes feature requests by readiness and identifies blockers.
 */

import type { FeatureRequest } from "./types";

export interface GroomingReadiness {
  ready: FeatureRequest[];           // Has PRD, estimate, no blockers
  needsClarity: FeatureRequest[];    // Missing PRD or acceptance criteria
  needsEstimate: FeatureRequest[];   // No engineering estimate
  blocked: FeatureRequest[];         // Has active blockers
  notReady: FeatureRequest[];        // Other reasons (e.g., incoming, early stage)
}

export interface GroomingSummary {
  readiness: GroomingReadiness;
  totalFeatureRequests: number;
  readyCount: number;
  blockedCount: number;
  estimateCoverage: number; // Percentage of items with estimates
  byPmOwner: Record<string, GroomingReadiness>;
  byCharter: Record<string, GroomingReadiness>;
}

/**
 * Determine if a feature request is ready for grooming
 */
function isReadyForGrooming(fr: FeatureRequest): boolean {
  // Must be in estimation or director_review stage
  const isRightStage = fr.stage === "estimation" || fr.stage === "director_review" || fr.stage === "prioritized";

  // Must have Confluence page (PRD)
  const hasPRD = fr.confluencePages.length > 0;

  // Must not have active blockers
  const noBlockers = !fr.blockerSummary.hasBlockers;

  return isRightStage && hasPRD && noBlockers;
}

/**
 * Determine why a feature request is not ready
 */
function categorizeNotReady(fr: FeatureRequest): "needs_clarity" | "needs_estimate" | "blocked" | "not_ready" {
  // Check blockers first
  if (fr.blockerSummary.hasBlockers) {
    return "blocked";
  }

  // Check for PRD
  if (fr.confluencePages.length === 0) {
    return "needs_clarity";
  }

  // Check if it's in estimation stage but no estimate yet
  if (fr.stage === "estimation") {
    return "needs_estimate";
  }

  // Too early in the lifecycle
  if (["incoming", "ba_grooming", "pm_exploration"].includes(fr.stage)) {
    return "not_ready";
  }

  return "not_ready";
}

/**
 * Assess grooming readiness for a list of feature requests
 */
export function assessGroomingReadiness(
  featureRequests: FeatureRequest[]
): GroomingReadiness {
  const readiness: GroomingReadiness = {
    ready: [],
    needsClarity: [],
    needsEstimate: [],
    blocked: [],
    notReady: []
  };

  for (const fr of featureRequests) {
    if (isReadyForGrooming(fr)) {
      readiness.ready.push(fr);
    } else {
      const category = categorizeNotReady(fr);
      switch (category) {
        case "needs_clarity":
          readiness.needsClarity.push(fr);
          break;
        case "needs_estimate":
          readiness.needsEstimate.push(fr);
          break;
        case "blocked":
          readiness.blocked.push(fr);
          break;
        case "not_ready":
          readiness.notReady.push(fr);
          break;
      }
    }
  }

  return readiness;
}

/**
 * Generate comprehensive grooming summary with PM and charter breakdowns
 */
export function generateGroomingSummary(
  featureRequests: FeatureRequest[]
): GroomingSummary {
  const readiness = assessGroomingReadiness(featureRequests);

  // Group by PM owner
  const byPmOwner: Record<string, GroomingReadiness> = {};
  const pmGroups = featureRequests.reduce((acc, fr) => {
    const pm = fr.pmOwner || "Unassigned";
    if (!acc[pm]) acc[pm] = [];
    acc[pm].push(fr);
    return acc;
  }, {} as Record<string, FeatureRequest[]>);

  for (const [pm, frs] of Object.entries(pmGroups)) {
    byPmOwner[pm] = assessGroomingReadiness(frs);
  }

  // Group by charter
  const byCharter: Record<string, GroomingReadiness> = {};
  const charterGroups = featureRequests.reduce((acc, fr) => {
    const charter = fr.productCharter || "Unassigned";
    if (!acc[charter]) acc[charter] = [];
    acc[charter].push(fr);
    return acc;
  }, {} as Record<string, FeatureRequest[]>);

  for (const [charter, frs] of Object.entries(charterGroups)) {
    byCharter[charter] = assessGroomingReadiness(frs);
  }

  // Calculate estimate coverage
  const withEstimates = featureRequests.filter(
    (fr) => fr.stage !== "incoming" && fr.stage !== "ba_grooming"
  );
  const estimateCoverage = withEstimates.length > 0
    ? (readiness.ready.length / withEstimates.length) * 100
    : 0;

  return {
    readiness,
    totalFeatureRequests: featureRequests.length,
    readyCount: readiness.ready.length,
    blockedCount: readiness.blocked.length,
    estimateCoverage: Math.round(estimateCoverage),
    byPmOwner,
    byCharter
  };
}

/**
 * Export grooming checklist to Markdown format
 */
export function exportGroomingChecklistToMarkdown(summary: GroomingSummary): string {
  const lines: string[] = [];

  lines.push("# Engineering Grooming Session Checklist");
  lines.push("");
  lines.push(`**Date**: ${new Date().toLocaleDateString()}`);
  lines.push(`**Total Items**: ${summary.totalFeatureRequests}`);
  lines.push(`**Ready for Grooming**: ${summary.readyCount}`);
  lines.push(`**Blocked**: ${summary.blockedCount}`);
  lines.push(`**Estimate Coverage**: ${summary.estimateCoverage}%`);
  lines.push("");

  lines.push("## ✅ Ready for Grooming");
  lines.push("");
  if (summary.readiness.ready.length === 0) {
    lines.push("_No items ready for grooming_");
  } else {
    for (const fr of summary.readiness.ready) {
      lines.push(`- [ ] **${fr.title}** (${fr.pmOwner || "Unassigned"}) - ${fr.productCharter || "No Charter"}`);
      lines.push(`  - Jira: ${fr.jiraIssues.map((i) => i.key).join(", ")}`);
      lines.push(`  - PRD: ${fr.confluencePages[0]?.title || "N/A"}`);
      lines.push("");
    }
  }

  lines.push("## ⚠️ Needs Clarity (Missing PRD)");
  lines.push("");
  if (summary.readiness.needsClarity.length === 0) {
    lines.push("_None_");
  } else {
    for (const fr of summary.readiness.needsClarity) {
      lines.push(`- **${fr.title}** (${fr.pmOwner || "Unassigned"})`);
      lines.push(`  - Action: PM to draft PRD`);
      lines.push("");
    }
  }

  lines.push("## 🔢 Needs Estimate");
  lines.push("");
  if (summary.readiness.needsEstimate.length === 0) {
    lines.push("_None_");
  } else {
    for (const fr of summary.readiness.needsEstimate) {
      lines.push(`- **${fr.title}** (${fr.pmOwner || "Unassigned"})`);
      lines.push(`  - Action: Engineering to estimate`);
      lines.push("");
    }
  }

  lines.push("## 🚫 Blocked");
  lines.push("");
  if (summary.readiness.blocked.length === 0) {
    lines.push("_None_");
  } else {
    for (const fr of summary.readiness.blocked) {
      lines.push(`- **${fr.title}** (${fr.pmOwner || "Unassigned"})`);
      lines.push(`  - Blockers:`);
      for (const blocker of fr.blockerSummary.blockers) {
        lines.push(`    - ${blocker.description} (${blocker.daysOpen} days)`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Export grooming checklist to CSV format
 */
export function exportGroomingChecklistToCSV(summary: GroomingSummary): string {
  const lines: string[] = [];

  lines.push("Title,PM Owner,Charter,Status,Jira Keys,PRD Title,Blockers");

  const allItems = [
    ...summary.readiness.ready.map((fr) => ({ ...fr, status: "Ready" })),
    ...summary.readiness.needsClarity.map((fr) => ({ ...fr, status: "Needs Clarity" })),
    ...summary.readiness.needsEstimate.map((fr) => ({ ...fr, status: "Needs Estimate" })),
    ...summary.readiness.blocked.map((fr) => ({ ...fr, status: "Blocked" }))
  ];

  for (const item of allItems) {
    const title = `"${item.title.replace(/"/g, '""')}"`;
    const pmOwner = item.pmOwner || "Unassigned";
    const charter = item.productCharter || "No Charter";
    const status = item.status;
    const jiraKeys = item.jiraIssues.map((i) => i.key).join("; ");
    const prdTitle = item.confluencePages[0]?.title || "N/A";
    const blockers = item.blockerSummary.blockers
      .map((b) => `${b.description} (${b.daysOpen}d)`)
      .join("; ");

    lines.push(`${title},${pmOwner},${charter},${status},${jiraKeys},"${prdTitle}","${blockers}"`);
  }

  return lines.join("\n");
}
