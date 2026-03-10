/**
 * Jira Integration Types
 *
 * Simplified types representing Jira API responses.
 * These are subsets of the full Jira API schema.
 */

export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress?: string;
}

export interface JiraStatus {
  id: string;
  name: string;
  statusCategory: {
    key: string; // 'new' | 'indeterminate' | 'done'
    name: string;
  };
}

export interface JiraPriority {
  id: string;
  name: string;
}

export interface JiraIssueFields {
  summary: string;
  description?: string;
  status: JiraStatus;
  priority?: JiraPriority;
  assignee?: JiraUser | null;
  reporter?: JiraUser;
  created: string;
  updated: string;
  duedate?: string | null;
  labels?: string[];
  comment?: {
    comments: JiraComment[];
    maxResults: number;
    total: number;
  };
  [key: string]: unknown; // Allow custom fields
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: JiraIssueFields;
}

export interface JiraComment {
  id: string;
  author: JiraUser;
  body: string;
  created: string;
  updated: string;
}

export interface JiraSearchResult {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
  startAt: number;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
}

export interface JiraBoard {
  id: number;
  name: string;
  type: string;
}

/**
 * Issue link type for CSo↔LEN workflow tracking
 */
export interface JiraIssueLink {
  id: string;
  type: string; // 'relates to', 'blocks', 'is blocked by', 'implements', etc.
  inwardIssue?: { key: string; fields: { summary: string; status: JiraStatus } };
  outwardIssue?: { key: string; fields: { summary: string; status: JiraStatus } };
}

/**
 * Sprint information (only present on LEN board tickets)
 */
export interface JiraSprint {
  id: number;
  name: string;
  state: 'future' | 'active' | 'closed';
  startDate?: string;
  endDate?: string;
}

/**
 * Board type for M2P dual-board workflow
 */
export type BoardType = "cso" | "len" | "general";

/**
 * Document type based on board workflow
 */
export type DocumentType = "brd" | "prd" | "user_story";

/**
 * Normalized Jira issue for internal use
 */
export interface NormalizedJiraIssue {
  key: string;
  title: string;
  description?: string;
  status: string;
  statusCategory: string; // 'new' | 'indeterminate' | 'done'
  priority?: string;
  assignee?: {
    id: string;
    name: string;
    email?: string;
  };
  reporter?: {
    id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  labels: string[];
  comments: {
    author: string;
    body: string;
    createdAt: string;
  }[];
  url: string;

  // Epic / parent info
  epicKey?: string;           // Parent epic issue key
  epicName?: string;          // Parent epic summary/name

  // M2P Board Integration Extensions
  boardId?: number;           // Which board this issue belongs to
  boardType?: BoardType;      // CSo (Eng→PM) or LEN (PM→Eng) workflow
  productCharter?: string;    // Auto-populated from charter mapping
  documentType?: DocumentType; // BRD (CSo) or PRD/User Story (LEN)
  sprintId?: number;          // Sprint ID (LEN tickets only)
  sprintName?: string;        // Sprint name (LEN tickets only)
  linkedIssues?: {            // Linked CSo/LEN tickets (workflow pairs)
    key: string;
    type: string;             // Link type: 'relates to', 'implements', etc.
    summary: string;
    status: string;
  }[];
}
