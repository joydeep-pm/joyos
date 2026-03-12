/**
 * People Management Types
 *
 * Data models for PM coaching, 1:1s, and IDP feedback
 */

export interface PMProfile {
  id: string;
  name: string;
  email: string;
  role: "SPM" | "APM" | "PM";
  productCharters: string[];  // Charters they own
  startDate: string;
  lastOneOnOneDate?: string;
  nextOneOnOneDate?: string;
}

export interface PeopleRecord {
  id: string;
  pmName: string;
  lastOneOnOneDate?: string;
  nextOneOnOneDate?: string;
  coachingFocus: string[];
  privateNotes: string;
  lastUpdatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PeopleRecordOverlay {
  present: boolean;
  record: PeopleRecord | null;
}

export interface OneOnOneNote {
  id: string;
  pmId: string;
  date: string;
  topics: string[];
  verbalFeedback: string;      // Feedback shared verbally during 1:1
  pmUpdates: string;            // Updates from PM on their work
  directorNotes: string;        // Director's private notes
  actionItems: string[];
  followUpItems: string[];
  nextMeetingDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * IDP Feedback (McKinsey Format)
 * NOTE: User will provide actual McKinsey IDP format structure
 */
export interface IDPFeedback {
  id: string;
  pmId: string;
  date: string;
  period: string;              // "Q1 2026" or "January 2026"
  feedbackContent: string;     // McKinsey-formatted feedback (user will provide structure)
  evidence: PerformanceEvidence[];
  developmentGoals: string[];
  actionItems: ActionItem[];
  followUpDate?: string;
  status: "draft" | "approved" | "shared";
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceEvidence {
  featureRequestId: string;
  featureRequestTitle: string;
  evidenceType: "positive" | "developmental";
  category: "prd_quality" | "blocker_resolution" | "communication" | "delivery" | "other";
  description: string;
  date: string;
}

export interface ActionItem {
  id: string;
  description: string;
  owner: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
}

/**
 * PM Performance Summary
 * Auto-generated from feature requests
 */
export interface PMPerformanceSummary {
  pmId: string;
  pmName: string;
  period: string;
  featureRequestCount: number;
  activeFeatureRequests: number;
  completedFeatureRequests: number;
  blockedFeatureRequests: number;
  averageTimeToResolution: number; // Days
  prdQualityScore?: number; // 0-100, if available
  stakeholderSatisfaction?: number; // 0-100, if available
  evidenceItems: PerformanceEvidence[];
  strengths: string[];
  developmentAreas: string[];
}
