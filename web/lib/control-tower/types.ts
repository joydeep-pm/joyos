/**
 * Control Tower Domain Types
 *
 * Feature Request is the primary domain object for the Product Control Tower.
 */

export type FeatureRequestSource =
  | "client_escalation"
  | "pm_ask"
  | "sales_rfp"
  | "implementation_gap"
  | "bug_stability"
  | "engineering_blocker"
  | "leadership_request"
  | "unknown";

export type FeatureRequestStage =
  | "incoming"
  | "ba_grooming"
  | "pm_exploration"
  | "director_review"
  | "engineering_validation"
  | "prd_drafting"
  | "estimation"
  | "prioritized"
  | "in_delivery"
  | "testing"
  | "client_update"
  | "uat_deploy"
  | "prod_deploy";

export type RiskSeverity = "high" | "medium" | "low" | "none";

export type BlockerType = "engineering" | "pm" | "client" | "other";

export interface FeatureRequestBlocker {
  type: BlockerType;
  description: string;
  daysOpen: number;
}

export interface FeatureRequestRiskSummary {
  severity: RiskSeverity;
  factors: string[];
}

export interface LinkedJiraIssue {
  key: string;
  status: string;
  statusCategory: string;
  assignee?: string;
  dueDate?: string;
  lastUpdated: string;
}

export interface LinkedConfluencePage {
  id: string;
  title: string;
  url: string;
  lastModified: string;
}

export interface LinkedLocalNote {
  path: string;
  summary: string;
}

export interface LatestUpdate {
  date: string;
  source: "jira" | "confluence" | "local";
  summary: string;
}

export interface FeatureRequestBlockerSummary {
  hasBlockers: boolean;
  blockerCount: number;
  blockers: FeatureRequestBlocker[];
}

/**
 * Feature Request - The primary domain object
 */
export interface FeatureRequest {
  id: string;
  title: string;
  source: FeatureRequestSource;
  client?: string;
  productCharter?: string;
  pmOwner?: string;
  stage: FeatureRequestStage;

  // Linked sources
  jiraIssues: LinkedJiraIssue[];
  confluencePages: LinkedConfluencePage[];
  localNotes: LinkedLocalNote[];

  // Derived intelligence
  riskSummary: FeatureRequestRiskSummary;
  blockerSummary: FeatureRequestBlockerSummary;
  latestUpdate: LatestUpdate;
  recommendedNextStep?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
}

/**
 * Feature Request Cache
 */
export interface FeatureRequestCache {
  version: number;
  generatedAt: string;
  sources: {
    jira: {
      issueCount: number;
      lastSyncAt: string;
    };
    confluence: {
      pageCount: number;
      lastSyncAt: string;
    };
    local: {
      noteCount: number;
    };
  };
  featureRequests: FeatureRequest[];
}
