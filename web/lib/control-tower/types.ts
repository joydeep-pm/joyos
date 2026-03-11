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

export type FeatureRequestReadinessVerdict = "ready" | "low_readiness" | "blocked";

export type FeatureRequestReadinessDimensionName =
  | "documentation"
  | "scope"
  | "stage"
  | "unblock_status"
  | "prioritization"
  | "freshness";

export type FeatureRequestReadinessDimensionStatus = "pass" | "warn" | "fail";

export type FeatureRequestReadinessMissingInputCode =
  | "documentation_missing"
  | "scope_signal_missing"
  | "stage_signal_missing"
  | "stale_update";

export type FeatureRequestReadinessBlockerClass =
  | "none"
  | "product_dependency"
  | "external_dependency"
  | "delivery_blocked";

export type FeatureRequestPrioritizationPosture =
  | "scheduled"
  | "needs_triage"
  | "expedite_blocker_resolution";

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
  // M2P Board Extensions
  boardId?: number;
  boardType?: "cso" | "len" | "general";
  documentType?: "brd" | "prd" | "user_story";
  sprintName?: string;
  linkedIssueKeys?: string[]; // Keys of linked CSo/LEN tickets
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
export interface FeatureRequestReadinessDimension {
  name: FeatureRequestReadinessDimensionName;
  status: FeatureRequestReadinessDimensionStatus;
  rationale: string;
}

export interface FeatureRequestReadinessEvaluation {
  verdict: FeatureRequestReadinessVerdict;
  dimensions: FeatureRequestReadinessDimension[];
  missingInputs: FeatureRequestReadinessMissingInputCode[];
  blockerClass: FeatureRequestReadinessBlockerClass;
  prioritizationPosture: FeatureRequestPrioritizationPosture;
  recommendedNextStep: string;
}

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
