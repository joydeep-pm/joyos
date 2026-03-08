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
}
