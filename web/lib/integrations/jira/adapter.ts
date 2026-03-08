/**
 * Jira Adapter
 *
 * Transforms Jira API responses into normalized internal format.
 */

import type { JiraIssue, NormalizedJiraIssue } from "./types";
import { JiraClient } from "./client";
import type { JiraConfig } from "./config";

/**
 * Normalize a Jira issue into internal format
 */
export function normalizeJiraIssue(issue: JiraIssue, baseUrl: string): NormalizedJiraIssue {
  const fields = issue.fields;

  return {
    key: issue.key,
    title: fields.summary,
    description: fields.description,
    status: fields.status.name,
    statusCategory: fields.status.statusCategory.key,
    priority: fields.priority?.name,
    assignee: fields.assignee
      ? {
          id: fields.assignee.accountId,
          name: fields.assignee.displayName,
          email: fields.assignee.emailAddress
        }
      : undefined,
    reporter: fields.reporter
      ? {
          id: fields.reporter.accountId,
          name: fields.reporter.displayName,
          email: fields.reporter.emailAddress
        }
      : undefined,
    createdAt: fields.created,
    updatedAt: fields.updated,
    dueDate: fields.duedate ?? undefined,
    labels: fields.labels ?? [],
    comments:
      fields.comment?.comments.map((c) => ({
        author: c.author.displayName,
        body: c.body,
        createdAt: c.created
      })) ?? [],
    url: `${baseUrl}/browse/${issue.key}`
  };
}

/**
 * Jira Adapter - Fetches and normalizes Jira issues
 */
export class JiraAdapter {
  private client: JiraClient;
  private baseUrl: string;

  constructor(config: JiraConfig) {
    this.client = new JiraClient(config);
    this.baseUrl = config.baseUrl;
  }

  /**
   * Fetch all issues from configured projects
   */
  async fetchIssues(): Promise<NormalizedJiraIssue[]> {
    if (!this.client.isReady()) {
      console.warn("Jira client not ready, returning empty results");
      return [];
    }

    const issues = await this.client.getAllProjectIssues();
    return issues.map((issue) => normalizeJiraIssue(issue, this.baseUrl));
  }

  /**
   * Fetch issues updated after a specific date
   */
  async fetchRecentIssues(updatedAfter: string): Promise<NormalizedJiraIssue[]> {
    if (!this.client.isReady()) {
      console.warn("Jira client not ready, returning empty results");
      return [];
    }

    const issues = await this.client.getRecentIssues(updatedAfter);
    return issues.map((issue) => normalizeJiraIssue(issue, this.baseUrl));
  }

  /**
   * Fetch a single issue by key
   */
  async fetchIssue(issueKey: string): Promise<NormalizedJiraIssue | null> {
    if (!this.client.isReady()) {
      console.warn("Jira client not ready, returning null");
      return null;
    }

    const issue = await this.client.getIssue(issueKey);
    if (!issue) return null;

    return normalizeJiraIssue(issue, this.baseUrl);
  }
}

/**
 * Create a Jira adapter instance
 */
export function createJiraAdapter(config: JiraConfig): JiraAdapter {
  return new JiraAdapter(config);
}
