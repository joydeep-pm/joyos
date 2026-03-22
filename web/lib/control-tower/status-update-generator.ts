/**
 * Status Update Generator
 *
 * Generates Teams-ready and formal status updates for any product vertical,
 * platform area, or the overall portfolio — pulling from live Jira cache
 * and director's real status overrides.
 */

import { getCachedFeatureRequests } from "@/lib/control-tower/cache";
import { getRealStatusMap, REAL_STATUS_LABELS, type RealStatusEntry } from "@/lib/control-tower/real-status";
import type { FeatureRequest } from "@/lib/control-tower/types";
import {
  PRODUCT_VERTICALS, PLATFORM_VERTICALS, ALL_VERTICALS,
  type VerticalId, type StatusUpdateFormat,
} from "@/lib/control-tower/verticals";

export { PRODUCT_VERTICALS, PLATFORM_VERTICALS, ALL_VERTICALS };
export type { VerticalId, StatusUpdateFormat };

export interface StatusUpdateRequest {
  verticalId: VerticalId;
  format: StatusUpdateFormat;
  date?: string; // defaults to today
}

export interface StatusUpdateResult {
  verticalId: VerticalId;
  verticalLabel: string;
  format: StatusUpdateFormat;
  generatedAt: string;
  featureRequestCount: number;
  output: string;
}

// ── Filtering ─────────────────────────────────────────────────────────────────

function getChartersForVertical(verticalId: VerticalId): string[] {
  if (verticalId === "overall") return [];
  const vertical = ALL_VERTICALS.find((v) => v.id === verticalId);
  return vertical ? [...vertical.charters] : [];
}

function getVerticalLabel(verticalId: VerticalId): string {
  if (verticalId === "overall") return "Overall Portfolio";
  const vertical = ALL_VERTICALS.find((v) => v.id === verticalId);
  return vertical?.label ?? verticalId;
}

function filterByVertical(frs: FeatureRequest[], verticalId: VerticalId): FeatureRequest[] {
  if (verticalId === "overall") return frs;
  const charters = getChartersForVertical(verticalId);
  if (charters.length === 0) return frs;

  return frs.filter((fr) => {
    if (!fr.productCharter) return false;
    return charters.some(
      (c) => fr.productCharter!.toLowerCase().includes(c.toLowerCase()) ||
             c.toLowerCase().includes(fr.productCharter!.toLowerCase())
    );
  });
}

// ── Status grouping ───────────────────────────────────────────────────────────

interface StatusGroups {
  inDev: Array<{ fr: FeatureRequest; real?: RealStatusEntry }>;
  devDelayed: Array<{ fr: FeatureRequest; real?: RealStatusEntry }>;
  inQA: Array<{ fr: FeatureRequest; real?: RealStatusEntry }>;
  qaDelayed: Array<{ fr: FeatureRequest; real?: RealStatusEntry }>;
  groomingInProgress: Array<{ fr: FeatureRequest; real?: RealStatusEntry }>;
  blocked: Array<{ fr: FeatureRequest; real?: RealStatusEntry }>;
  waiting: Array<{ fr: FeatureRequest; real?: RealStatusEntry }>;
  deprioritized: Array<{ fr: FeatureRequest; real?: RealStatusEntry }>;
  other: Array<{ fr: FeatureRequest; real?: RealStatusEntry }>;
}

function groupByRealStatus(
  frs: FeatureRequest[],
  realStatusMap: Record<string, RealStatusEntry>
): StatusGroups {
  const groups: StatusGroups = {
    inDev: [], devDelayed: [], inQA: [], qaDelayed: [],
    groomingInProgress: [], blocked: [], waiting: [],
    deprioritized: [], other: [],
  };

  for (const fr of frs) {
    const real = realStatusMap[fr.id];
    const item = { fr, real };

    if (!real) {
      // Fall back to Jira stage
      if (fr.stage === "in_delivery") groups.inDev.push(item);
      else if (fr.stage === "testing") groups.inQA.push(item);
      else if (fr.stage === "ba_grooming" || fr.stage === "pm_exploration") groups.groomingInProgress.push(item);
      else groups.other.push(item);
      continue;
    }

    switch (real.status) {
      case "in_dev":                groups.inDev.push(item); break;
      case "dev_delayed":           groups.devDelayed.push(item); break;
      case "in_qa":                 groups.inQA.push(item); break;
      case "qa_delayed":            groups.qaDelayed.push(item); break;
      case "grooming_in_progress":  groups.groomingInProgress.push(item); break;
      case "engineering_blocked":   groups.blocked.push(item); break;
      case "unclear_requirements":  groups.blocked.push(item); break;
      case "waiting_on_client":     groups.waiting.push(item); break;
      case "waiting_on_pm":         groups.waiting.push(item); break;
      case "waiting_on_onboarding": groups.waiting.push(item); break;
      case "deprioritized":         groups.deprioritized.push(item); break;
      default:                      groups.other.push(item); break;
    }
  }

  return groups;
}

function jiraLink(fr: FeatureRequest): string {
  const key = fr.jiraIssues[0]?.key;
  return key ? `[${key}]` : "";
}

function realLabel(real?: RealStatusEntry): string {
  if (!real) return "";
  const label = REAL_STATUS_LABELS[real.status];
  return real.note ? `${label} — ${real.note}` : label;
}

// ── Formatters ────────────────────────────────────────────────────────────────

function formatTeamsQuick(
  verticalLabel: string,
  frs: FeatureRequest[],
  groups: StatusGroups,
  date: string
): string {
  const lines: string[] = [];
  lines.push(`**${verticalLabel} — Status Update (${date})**`);
  lines.push("");

  const summary: string[] = [];
  if (groups.inDev.length)          summary.push(`🟢 In Dev: ${groups.inDev.length}`);
  if (groups.devDelayed.length)     summary.push(`🔴 Dev Delayed: ${groups.devDelayed.length}`);
  if (groups.inQA.length)           summary.push(`🔵 In QA: ${groups.inQA.length}`);
  if (groups.qaDelayed.length)      summary.push(`🔴 QA Delayed: ${groups.qaDelayed.length}`);
  if (groups.groomingInProgress.length) summary.push(`🟡 Grooming: ${groups.groomingInProgress.length}`);
  if (groups.blocked.length)        summary.push(`🚫 Blocked: ${groups.blocked.length}`);
  if (groups.waiting.length)        summary.push(`⏳ Waiting: ${groups.waiting.length}`);
  if (groups.deprioritized.length)  summary.push(`⬇️ Deprioritized: ${groups.deprioritized.length}`);

  if (summary.length === 0) {
    lines.push(`No active items tracked.`);
    return lines.join("\n");
  }

  lines.push(summary.join("  |  "));
  lines.push("");

  if (groups.inDev.length > 0) {
    lines.push("**🟢 In Dev**");
    for (const { fr, real } of groups.inDev) {
      lines.push(`- ${fr.title} ${jiraLink(fr)}${real?.note ? ` — ${real.note}` : ""}`);
    }
    lines.push("");
  }

  if (groups.devDelayed.length > 0) {
    lines.push("**🔴 Dev Delayed**");
    for (const { fr, real } of groups.devDelayed) {
      lines.push(`- ${fr.title} ${jiraLink(fr)}${real?.note ? ` — ${real.note}` : ""}`);
    }
    lines.push("");
  }

  if (groups.inQA.length > 0) {
    lines.push("**🔵 In QA**");
    for (const { fr, real } of groups.inQA) {
      lines.push(`- ${fr.title} ${jiraLink(fr)}${real?.note ? ` — ${real.note}` : ""}`);
    }
    lines.push("");
  }

  if (groups.qaDelayed.length > 0) {
    lines.push("**🔴 QA Delayed**");
    for (const { fr, real } of groups.qaDelayed) {
      lines.push(`- ${fr.title} ${jiraLink(fr)}${real?.note ? ` — ${real.note}` : ""}`);
    }
    lines.push("");
  }

  if (groups.blocked.length > 0) {
    lines.push("**🚫 Blocked**");
    for (const { fr, real } of groups.blocked) {
      lines.push(`- ${fr.title} ${jiraLink(fr)} — ${realLabel(real)}`);
    }
    lines.push("");
  }

  if (groups.waiting.length > 0) {
    lines.push("**⏳ Waiting**");
    for (const { fr, real } of groups.waiting) {
      lines.push(`- ${fr.title} ${jiraLink(fr)} — ${realLabel(real)}`);
    }
    lines.push("");
  }

  if (groups.groomingInProgress.length > 0) {
    lines.push("**🟡 In Grooming**");
    for (const { fr } of groups.groomingInProgress) {
      lines.push(`- ${fr.title} ${jiraLink(fr)}`);
    }
    lines.push("");
  }

  if (groups.deprioritized.length > 0) {
    lines.push("**⬇️ Deprioritized**");
    for (const { fr, real } of groups.deprioritized) {
      lines.push(`- ${fr.title} ${jiraLink(fr)}${real?.note ? ` — ${real.note}` : ""}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

function formatBusinessStatusUpdate(
  verticalLabel: string,
  frs: FeatureRequest[],
  groups: StatusGroups,
  date: string
): string {
  const blocked = [...groups.blocked, ...groups.devDelayed, ...groups.qaDelayed, ...groups.waiting];
  const inProgress = [...groups.inDev, ...groups.inQA, ...groups.groomingInProgress];

  const lines: string[] = [];
  lines.push(`## Business Status Update — ${verticalLabel}`);
  lines.push(`**Date:** ${date} | **Prepared by:** Joydeep Sarkar`);
  lines.push("");
  lines.push("### Executive Summary");

  const activePct = frs.length > 0 ? Math.round((inProgress.length / frs.length) * 100) : 0;
  lines.push(
    `${verticalLabel} has ${frs.length} active items tracked. ${inProgress.length} are in progress (${activePct}%). ` +
    `${blocked.length} items require attention due to delays or blockers.`
  );
  lines.push("");

  lines.push("### Current Status");
  lines.push(`- **Overall:** ${blocked.length === 0 ? "On Track" : blocked.length <= 2 ? "Minor Delays" : "At Risk"}`);
  lines.push("");

  lines.push("### What Is In Progress");
  if (inProgress.length === 0) {
    lines.push("- No items currently in active development or grooming.");
  } else {
    for (const { fr } of inProgress) {
      lines.push(`- ${fr.title} ${jiraLink(fr)}`);
    }
  }
  lines.push("");

  if (blocked.length > 0) {
    lines.push("### Risks / Blockers");
    for (const { fr, real } of blocked) {
      lines.push(`- **${fr.title}** ${jiraLink(fr)}`);
      if (real?.note) lines.push(`  - ${realLabel(real)}`);
    }
    lines.push("");
  }

  if (groups.deprioritized.length > 0) {
    lines.push("### Deprioritized / Parked");
    for (const { fr, real } of groups.deprioritized) {
      lines.push(`- ${fr.title} ${jiraLink(fr)}${real?.note ? ` — ${real.note}` : ""}`);
    }
    lines.push("");
  }

  lines.push("### Near-Term Outlook");
  lines.push("- [Fill in: next sprint focus areas, expected deliveries, upcoming grooming items]");

  return lines.join("\n");
}

function formatRoadmapUpdate(
  verticalLabel: string,
  frs: FeatureRequest[],
  groups: StatusGroups,
  date: string
): string {
  const lines: string[] = [];
  lines.push(`## Roadmap Update — ${verticalLabel}`);
  lines.push(`**Period:** Q1 FY27 | **Date:** ${date} | **Audience:** Business Stakeholders`);
  lines.push("");
  lines.push("### Summary");
  lines.push(`${verticalLabel} has ${frs.length} tracked items this quarter. Status below reflects real operational state, not just Jira.`);
  lines.push("");

  lines.push("### Completed / Materially Advanced");
  lines.push("- [Pull from Jira done items after next sync]");
  lines.push("");

  const delayed = [...groups.devDelayed, ...groups.qaDelayed];

  lines.push("### In Progress");
  for (const { fr } of [...groups.inDev, ...groups.inQA]) {
    lines.push(`- ${fr.title} ${jiraLink(fr)}`);
  }
  if (groups.inDev.length === 0 && groups.inQA.length === 0) {
    lines.push("- No items currently in active delivery.");
  }
  lines.push("");

  if (delayed.length > 0) {
    lines.push("### Risks / Slippages");
    for (const { fr, real } of delayed) {
      lines.push(`- **${fr.title}** ${jiraLink(fr)}`);
      if (real?.note) lines.push(`  - ${real.note}`);
    }
    lines.push("");
  }

  lines.push("### Next Milestones");
  lines.push("- [Next sprint grooming items]");
  lines.push("- [Expected QA / UAT completions]");

  return lines.join("\n");
}

// ── Main generator ────────────────────────────────────────────────────────────

export async function generateStatusUpdate(
  req: StatusUpdateRequest
): Promise<StatusUpdateResult> {
  const allFRs = await getCachedFeatureRequests();
  const realStatusMap = await getRealStatusMap();

  const filtered = filterByVertical(allFRs, req.verticalId);
  const groups = groupByRealStatus(filtered, realStatusMap);

  const date = req.date ?? new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
  const verticalLabel = getVerticalLabel(req.verticalId);

  let output: string;
  switch (req.format) {
    case "teams_quick":
      output = formatTeamsQuick(verticalLabel, filtered, groups, date);
      break;
    case "business_status_update":
      output = formatBusinessStatusUpdate(verticalLabel, filtered, groups, date);
      break;
    case "roadmap_update":
      output = formatRoadmapUpdate(verticalLabel, filtered, groups, date);
      break;
    default:
      output = formatTeamsQuick(verticalLabel, filtered, groups, date);
  }

  return {
    verticalId: req.verticalId,
    verticalLabel,
    format: req.format,
    generatedAt: new Date().toISOString(),
    featureRequestCount: filtered.length,
    output,
  };
}
