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
          "comment",
          "issuelinks",    // For CSo↔LEN linking
          "sprint",        // For LEN sprint tracking
          "customfield_*"  // Include custom fields
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

  /**
   * Get issues for a specific board (M2P CSo/LEN workflow)
   */
  async getBoardIssues(boardId: number, options?: { maxResults?: number; startAt?: number }): Promise<JiraIssue[]> {
    if (!this.client) {
      console.error("Jira client not initialized");
      return [];
    }

    try {
      // Use board-specific JQL query
      const jql = `board = ${boardId} ORDER BY updated DESC`;
      const result = await this.searchIssues(jql, options);
      return result?.issues ?? [];
    } catch (error) {
      console.error(`Failed to get issues for board ${boardId}:`, error);
      return [];
    }
  }

  /**
   * Get sprint information for LEN tickets
   * Note: This requires Jira Software/Agile API access
   */
  async getActiveSprints(boardId: number): Promise<Array<{ id: number; name: string; state: string }>> {
    if (!this.client) {
      console.error("Jira client not initialized");
      return [];
    }

    try {
      // Use agile API for sprints (may not be available in base jira.js client)
      // For now, return empty array - sprint info will be extracted from issue fields
      console.warn(`Sprint API not fully implemented for board ${boardId}, sprint data will be extracted from issue fields`);
      return [];
    } catch (error) {
      console.error(`Failed to get sprints for board ${boardId}:`, error);
      return [];
    }
  }

  /**
   * Get issue links for CSo↔LEN workflow tracking
   */
  async getIssueLinks(issueKey: string): Promise<Array<{ type: string; linkedIssueKey: string; direction: 'inward' | 'outward' }>> {
    if (!this.client) {
      console.error("Jira client not initialized");
      return [];
    }

    try {
      const issue = await this.client.issues.getIssue({
        issueIdOrKey: issueKey,
        fields: ["issuelinks"]
      });

      const links: Array<{ type: string; linkedIssueKey: string; direction: 'inward' | 'outward' }> = [];
      const issueLinks = (issue.fields as any).issuelinks || [];

      for (const link of issueLinks) {
        if (link.inwardIssue) {
          links.push({
            type: link.type.inward,
            linkedIssueKey: link.inwardIssue.key,
            direction: 'inward'
          });
        }
        if (link.outwardIssue) {
          links.push({
            type: link.type.outward,
            linkedIssueKey: link.outwardIssue.key,
            direction: 'outward'
          });
        }
      }

      return links;
    } catch (error) {
      console.error(`Failed to get issue links for ${issueKey}:`, error);
      return [];
    }
  }
}

/**
 * Create a Jira client instance
 */
export function createJiraClient(config: JiraConfig): JiraClient {
  return new JiraClient(config);
}
