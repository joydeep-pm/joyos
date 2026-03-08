/**
 * Artifact Types
 *
 * Defines structured document types that can be generated from feature requests.
 */

export type ArtifactType =
  | "prd"
  | "user_story"
  | "follow_up"
  | "clarification_request"
  | "status_update"
  | "leadership_update"
  | "client_summary"
  | "okr_update"              // M2P: OKR progress tracking
  | "okr_tracking"            // M2P: OKR tracking (full format)
  | "idp_feedback"            // M2P: IDP format
  | "monthly_product_update"  // M2P: Monthly product update
  | "grooming_checklist"      // M2P: Grooming readiness checklist
  | "product_roadmap"         // M2P: Product roadmap
  | "bmad_prd";               // M2P: BMAD-style PRD (if different from generic)

export type ArtifactStatus = "draft" | "review" | "approved" | "sent";

export interface ArtifactMetadata {
  featureRequestId: string;
  featureRequestTitle: string;
  generatedBy: string;
  generatedAt: string;
  pmOwner?: string;
  client?: string;
}

export interface Artifact {
  id: string;
  type: ArtifactType;
  status: ArtifactStatus;
  title: string;
  content: string;
  metadata: ArtifactMetadata;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface ArtifactTemplate {
  type: ArtifactType;
  name: string;
  description: string;
  sections: ArtifactSection[];
}

export interface ArtifactSection {
  id: string;
  title: string;
  placeholder: string;
  required: boolean;
  hints?: string[];
}

/**
 * Template variables available for artifact generation
 */
export interface TemplateContext {
  // Feature Request
  featureRequestId: string;
  featureRequestTitle: string;
  source: string;
  stage: string;
  client?: string;
  productCharter?: string;
  pmOwner?: string;

  // Jira Context
  jiraKeys: string[];
  jiraStatus: string[];
  jiraAssignees: string[];

  // Confluence Context
  confluencePageTitles: string[];
  confluencePageUrls: string[];

  // Risk & Blockers
  riskSeverity: string;
  riskFactors: string[];
  blockers: Array<{
    type: string;
    description: string;
    daysOpen: number;
  }>;

  // Intervention Context
  interventionReasons: Array<{
    type: string;
    message: string;
    severity: string;
  }>;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;

  // Additional context
  notes?: string;
}
