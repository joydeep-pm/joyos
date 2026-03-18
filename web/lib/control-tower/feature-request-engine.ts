/**
 * Feature Request Engine
 *
 * Main orchestration for creating normalized feature requests from multiple sources.
 */

import { getJiraConfig, isJiraConfigured, createJiraAdapter, getCachedJiraIssues, writeJiraCache } from "@/lib/integrations/jira";
import {
  getConfluenceConfig,
  isConfluenceConfigured,
  createConfluenceAdapter,
  getCachedConfluencePages,
  writeConfluenceCache
} from "@/lib/integrations/confluence";
import type { FeatureRequest, FeatureRequestSource, FeatureRequestStage, LatestUpdate } from "./types";
import { matchJiraToConfluence, type MatchResult } from "./merge-logic";
import { calculateRiskSeverity } from "./risk-scorer";
import { detectBlockers } from "./blocker-detector";

/**
 * Infer feature request source from Jira labels or issue type
 */
function inferSource(labels: string[]): FeatureRequestSource {
  const labelSet = new Set(labels.map((l) => l.toLowerCase()));

  if (labelSet.has("client-escalation") || labelSet.has("escalation")) return "client_escalation";
  if (labelSet.has("pm-ask") || labelSet.has("pm-request")) return "pm_ask";
  if (labelSet.has("sales") || labelSet.has("rfp")) return "sales_rfp";
  if (labelSet.has("bug") || labelSet.has("stability")) return "bug_stability";
  if (labelSet.has("blocker") || labelSet.has("engineering-blocker")) return "engineering_blocker";
  if (labelSet.has("leadership")) return "leadership_request";

  return "unknown";
}

/**
 * Infer feature request stage from Jira status
 */
function inferStage(status: string, statusCategory: string): FeatureRequestStage {
  const statusLower = status.toLowerCase();

  if (statusCategory === "new" || statusLower.includes("to do") || statusLower.includes("backlog")) {
    return "incoming";
  }

  if (statusLower.includes("grooming") || statusLower.includes("refinement")) {
    return "ba_grooming";
  }

  if (statusLower.includes("analysis") || statusLower.includes("investigation")) {
    return "pm_exploration";
  }

  if (statusLower.includes("review")) {
    return "director_review";
  }

  if (statusLower.includes("validation") || statusLower.includes("tech review")) {
    return "engineering_validation";
  }

  if (statusLower.includes("documentation") || statusLower.includes("prd")) {
    return "prd_drafting";
  }

  if (statusLower.includes("estimation") || statusLower.includes("sizing")) {
    return "estimation";
  }

  if (statusLower.includes("ready") || statusLower.includes("prioritized")) {
    return "prioritized";
  }

  if (statusCategory === "indeterminate" || statusLower.includes("in progress") || statusLower.includes("development")) {
    return "in_delivery";
  }

  if (statusLower.includes("testing") || statusLower.includes("qa")) {
    return "testing";
  }

  if (statusLower.includes("uat")) {
    return "uat_deploy";
  }

  if (statusCategory === "done" || statusLower.includes("done") || statusLower.includes("deployed")) {
    return "prod_deploy";
  }

  return "incoming";
}

/**
 * Infer PM owner from Jira assignee
 */
function inferPmOwner(assigneeName?: string): string | undefined {
  // In a real implementation, this would map Jira assignees to known PM names
  // For now, just return the assignee name
  return assigneeName;
}

/**
 * Get latest update from sources
 */
function getLatestUpdate(matchResult: MatchResult): LatestUpdate {
  const jiraDate = new Date(matchResult.jiraIssue.updatedAt);
  const confluenceDate =
    matchResult.confluencePages.length > 0
      ? new Date(matchResult.confluencePages[0].lastModified)
      : new Date(0);

  if (jiraDate > confluenceDate) {
    return {
      date: matchResult.jiraIssue.updatedAt,
      source: "jira",
      summary: `Status: ${matchResult.jiraIssue.status}`
    };
  } else if (matchResult.confluencePages.length > 0) {
    return {
      date: matchResult.confluencePages[0].lastModified,
      source: "confluence",
      summary: `Updated: ${matchResult.confluencePages[0].title}`
    };
  } else {
    return {
      date: matchResult.jiraIssue.updatedAt,
      source: "jira",
      summary: `Status: ${matchResult.jiraIssue.status}`
    };
  }
}

/**
 * Create a feature request from match result with M2P board extensions
 */
function createFeatureRequest(matchResult: MatchResult): FeatureRequest {
  const issue = matchResult.jiraIssue;
  const source = inferSource(issue.labels);
  const stage = inferStage(issue.status, issue.statusCategory);
  const pmOwner = inferPmOwner(issue.assignee?.name);
  const riskSummary = calculateRiskSeverity(issue, source === "client_escalation");
  const blockerSummary = detectBlockers(issue);
  const latestUpdate = getLatestUpdate(matchResult);

  return {
    id: `fr-${issue.key.toLowerCase()}`,
    title: issue.title,
    source,
    stage,
    pmOwner,
    productCharter: issue.productCharter, // Auto-populated from charter mapping
    jiraIssues: [
      {
        key: issue.key,
        status: issue.status,
        statusCategory: issue.statusCategory,
        assignee: issue.assignee?.name,
        dueDate: issue.dueDate,
        lastUpdated: issue.updatedAt,
        // M2P Board Extensions
        boardId: issue.boardId,
        boardType: issue.boardType,
        documentType: issue.documentType,
        sprintName: issue.sprintName,
        linkedIssueKeys: issue.linkedIssues?.map((l) => l.key)
      }
    ],
    confluencePages: matchResult.confluencePages.map((page) => ({
      id: page.id,
      title: page.title,
      url: page.url,
      lastModified: page.lastModified
    })),
    localNotes: [],
    riskSummary,
    blockerSummary,
    latestUpdate,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    lastSyncedAt: new Date().toISOString()
  };
}

/**
 * Sync and ingest feature requests from all sources.
 * When epicKeys are provided, only issues under those epics are fetched from Jira.
 * When custom JQL is provided, it overrides the default Jira sync query.
 */
export async function ingestFeatureRequests(options?: { forceSync?: boolean; epicKeys?: string[]; jql?: string }): Promise<FeatureRequest[]> {
  const featureRequests: FeatureRequest[] = [];

  // Fetch or use cached Jira issues
  let jiraIssues = await getCachedJiraIssues();
  if (options?.forceSync && isJiraConfigured()) {
    const jiraConfig = getJiraConfig();
    if (jiraConfig) {
      const adapter = createJiraAdapter(jiraConfig);
      jiraIssues = await adapter.fetchIssues(options?.epicKeys, options?.jql);
      await writeJiraCache(jiraIssues);
    }
  }

  // Fetch or use cached Confluence pages
  let confluencePages = await getCachedConfluencePages();
  if (options?.forceSync && isConfluenceConfigured()) {
    const confluenceConfig = getConfluenceConfig();
    if (confluenceConfig) {
      const adapter = createConfluenceAdapter(confluenceConfig);
      confluencePages = await adapter.fetchPages();
      await writeConfluenceCache(confluencePages);
    }
  }

  // Match Jira issues to Confluence pages
  const matchResults = matchJiraToConfluence(jiraIssues, confluencePages);

  // Create feature requests
  for (const matchResult of matchResults) {
    const featureRequest = createFeatureRequest(matchResult);
    featureRequests.push(featureRequest);
  }

  return featureRequests;
}
