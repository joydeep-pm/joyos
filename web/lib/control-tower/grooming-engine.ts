/**
 * Grooming Engine
 *
 * Logic for preparing biweekly engineering grooming sessions.
 * Categorizes feature requests by readiness and preserves evaluator diagnostics.
 */

import { evaluateReadiness } from "./readiness-evaluator";
import type { FeatureRequest, FeatureRequestReadinessEvaluation } from "./types";

export interface GroomingReadinessEntry {
  featureRequest: FeatureRequest;
  readiness: FeatureRequestReadinessEvaluation;
}

export interface GroomingReadiness {
  ready: FeatureRequest[];
  lowReadiness: FeatureRequest[];
  blocked: FeatureRequest[];
  notReady: FeatureRequest[];
  evaluations: GroomingReadinessEntry[];
}

export interface GroomingSummary {
  readiness: GroomingReadiness;
  totalFeatureRequests: number;
  readyCount: number;
  blockedCount: number;
  estimateCoverage: number;
  byPmOwner: Record<string, GroomingReadiness>;
  byCharter: Record<string, GroomingReadiness>;
}

function createEmptyReadiness(): GroomingReadiness {
  return {
    ready: [],
    lowReadiness: [],
    blocked: [],
    notReady: [],
    evaluations: []
  };
}

function assessGroomingReadiness(featureRequests: FeatureRequest[]): GroomingReadiness {
  const readiness = createEmptyReadiness();

  for (const featureRequest of featureRequests) {
    const evaluation = evaluateReadiness(featureRequest);
    readiness.evaluations.push({ featureRequest, readiness: evaluation });

    if (evaluation.verdict === "ready") {
      readiness.ready.push(featureRequest);
      continue;
    }

    if (evaluation.verdict === "low_readiness") {
      readiness.lowReadiness.push(featureRequest);
      continue;
    }

    if (evaluation.verdict === "blocked") {
      readiness.blocked.push(featureRequest);
      continue;
    }

    readiness.notReady.push(featureRequest);
  }

  return readiness;
}

function groupFeatureRequests(
  featureRequests: FeatureRequest[],
  keySelector: (featureRequest: FeatureRequest) => string
): Record<string, GroomingReadiness> {
  const groups = featureRequests.reduce((acc, featureRequest) => {
    const key = keySelector(featureRequest);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(featureRequest);
    return acc;
  }, {} as Record<string, FeatureRequest[]>);

  return Object.fromEntries(
    Object.entries(groups).map(([key, requests]) => [key, assessGroomingReadiness(requests)])
  );
}

export function generateGroomingSummary(featureRequests: FeatureRequest[]): GroomingSummary {
  const readiness = assessGroomingReadiness(featureRequests);

  const byPmOwner = groupFeatureRequests(featureRequests, (featureRequest) => featureRequest.pmOwner || "Unassigned");
  const byCharter = groupFeatureRequests(featureRequests, (featureRequest) => featureRequest.productCharter || "Unassigned");

  const estimateCoverage = featureRequests.length > 0
    ? Math.round((readiness.ready.length / featureRequests.length) * 100)
    : 0;

  return {
    readiness,
    totalFeatureRequests: featureRequests.length,
    readyCount: readiness.ready.length,
    blockedCount: readiness.blocked.length,
    estimateCoverage,
    byPmOwner,
    byCharter
  };
}

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
    for (const featureRequest of summary.readiness.ready) {
      lines.push(`- [ ] **${featureRequest.title}** (${featureRequest.pmOwner || "Unassigned"}) - ${featureRequest.productCharter || "No Charter"}`);
      lines.push(`  - Jira: ${featureRequest.jiraIssues.map((issue) => issue.key).join(", ")}`);
      lines.push(`  - PRD: ${featureRequest.confluencePages[0]?.title || "N/A"}`);
      lines.push("");
    }
  }

  lines.push("## ⚠️ Low Readiness");
  lines.push("");
  if (summary.readiness.lowReadiness.length === 0) {
    lines.push("_None_");
  } else {
    for (const entry of summary.readiness.evaluations.filter((evaluation) => evaluation.readiness.verdict === "low_readiness")) {
      lines.push(`- **${entry.featureRequest.title}** (${entry.featureRequest.pmOwner || "Unassigned"})`);
      lines.push(`  - Action: ${entry.readiness.recommendedNextStep}`);
      if (entry.readiness.missingInputs.length > 0) {
        lines.push(`  - Missing inputs: ${entry.readiness.missingInputs.join(", ")}`);
      }
      lines.push("");
    }
  }

  lines.push("## 🚫 Blocked");
  lines.push("");
  if (summary.readiness.blocked.length === 0) {
    lines.push("_None_");
  } else {
    for (const entry of summary.readiness.evaluations.filter((evaluation) => evaluation.readiness.verdict === "blocked")) {
      lines.push(`- **${entry.featureRequest.title}** (${entry.featureRequest.pmOwner || "Unassigned"})`);
      lines.push(`  - Action: ${entry.readiness.recommendedNextStep}`);
      lines.push("  - Blockers:");
      for (const blocker of entry.featureRequest.blockerSummary.blockers) {
        lines.push(`    - ${blocker.description} (${blocker.daysOpen} days)`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function exportGroomingChecklistToCSV(summary: GroomingSummary): string {
  const lines: string[] = [];

  lines.push("Title,PM Owner,Charter,Status,Jira Keys,PRD Title,Missing Inputs,Blockers,Recommended Next Step");

  for (const entry of summary.readiness.evaluations) {
    const { featureRequest, readiness } = entry;
    const title = `"${featureRequest.title.replace(/"/g, '""')}"`;
    const pmOwner = featureRequest.pmOwner || "Unassigned";
    const charter = featureRequest.productCharter || "No Charter";
    const status = readiness.verdict;
    const jiraKeys = featureRequest.jiraIssues.map((issue) => issue.key).join("; ");
    const prdTitle = featureRequest.confluencePages[0]?.title || "N/A";
    const missingInputs = readiness.missingInputs.join("; ");
    const blockers = featureRequest.blockerSummary.blockers
      .map((blocker) => `${blocker.description} (${blocker.daysOpen}d)`)
      .join("; ");
    const recommendedNextStep = readiness.recommendedNextStep.replace(/"/g, '""');

    lines.push(`${title},${pmOwner},${charter},${status},${jiraKeys},"${prdTitle}","${missingInputs}","${blockers}","${recommendedNextStep}"`);
  }

  return lines.join("\n");
}
