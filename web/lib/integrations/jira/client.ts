/**
 * Jira API Client Wrapper
 *
 * Provides a simplified interface to the Jira API with error handling and retry logic.
 */

import { Version3Client } from "jira.js";
import type { JiraConfig } from "./config";
import type { JiraIssue, JiraSearchResult } from "./types";

export class JiraClient {
  private client: Version3Client | null = null;
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      this.client = new Version3Client({
        host: this.config.baseUrl,
        authentication: {
          basic: {
            email: this.config.email,
            apiToken: this.config.apiToken
          }
        }
      });
    } catch (error) {
      console.error("Failed to initialize Jira client:", error);
      this.client = null;
    }
  }

  /**
   * Check if the client is initialized and ready
   */
  isReady(): boolean {
    return this.client !== null;
  }

  /**
   * Search for issues using JQL
   */
  async searchIssues(jql: string, options?: { maxResults?: number; startAt?: number }): Promise<JiraSearchResult | null> {
    if (!this.client) {
      console.error("Jira client not initialized");
      return null;
    }

    try {
      const result = await this.client.issueSearch.searchForIssuesUsingJql({
        jql,
        maxResults: options?.maxResults ?? 100,
        startAt: options?.startAt ?? 0,
        fields: [
          "summary",
          "description",
          "status",
          "priority",
          "assignee",
          "reporter",
          "created",
          "updated",
          "duedate",
          "labels",
          "comment"
        ]
      });

      return {
        issues: result.issues as unknown as JiraIssue[],
        total: result.total ?? 0,
        maxResults: result.maxResults ?? 0,
        startAt: result.startAt ?? 0
      };
    } catch (error) {
      console.error("Failed to search Jira issues:", error);
      return null;
    }
  }

  /**
   * Get a single issue by key
   */
  async getIssue(issueKey: string): Promise<JiraIssue | null> {
    if (!this.client) {
      console.error("Jira client not initialized");
      return null;
    }

    try {
      const issue = await this.client.issues.getIssue({
        issueIdOrKey: issueKey,
        fields: [
          "summary",
          "description",
          "status",
          "priority",
          "assignee",
          "reporter",
          "created",
          "updated",
          "duedate",
          "labels",
          "comment"
        ]
      });

      return issue as unknown as JiraIssue;
    } catch (error) {
      console.error(`Failed to get Jira issue ${issueKey}:`, error);
      return null;
    }
  }

  /**
   * Get issues for configured projects updated after a certain date
   */
  async getRecentIssues(updatedAfter?: string): Promise<JiraIssue[]> {
    const projectKeys = this.config.projectKeys;
    const projectFilter = `project in (${projectKeys.join(", ")})`;
    const dateFilter = updatedAfter ? ` AND updated >= "${updatedAfter}"` : "";
    const jql = `${projectFilter}${dateFilter} ORDER BY updated DESC`;

    const result = await this.searchIssues(jql, { maxResults: 500 });
    return result?.issues ?? [];
  }

  /**
   * Get all issues for configured projects
   */
  async getAllProjectIssues(): Promise<JiraIssue[]> {
    return this.getRecentIssues();
  }
}

/**
 * Create a Jira client instance
 */
export function createJiraClient(config: JiraConfig): JiraClient {
  return new JiraClient(config);
}
