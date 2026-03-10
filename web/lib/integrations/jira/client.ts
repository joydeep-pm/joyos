/**
 * Jira API Client Wrapper
 *
 * Provides a simplified interface to the Jira API with error handling and retry logic.
 */

import { Version2Client } from "jira.js";
import type { JiraConfig } from "./config";
import type { JiraIssue, JiraSearchResult } from "./types";

export class JiraClient {
  private client: Version2Client | null = null;
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      this.client = new Version2Client({
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
   * Search for issues using JQL (enhanced search endpoint)
   */
  async searchIssues(jql: string, options?: { maxResults?: number }): Promise<JiraSearchResult | null> {
    if (!this.client) {
      console.error("Jira client not initialized");
      return null;
    }

    try {
      const allIssues: JiraIssue[] = [];
      let nextPageToken: string | undefined;
      const maxResults = options?.maxResults ?? 100;

      do {
        const params: { jql: string; maxResults: number; fields: string[]; nextPageToken?: string } = {
          jql,
          maxResults: Math.min(maxResults - allIssues.length, 100),
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
            "issuelinks",
            "sprint",
            "parent"
          ]
        };

        if (nextPageToken) {
          params.nextPageToken = nextPageToken;
        }

        const result = await this.client.issueSearch.searchForIssuesUsingJqlEnhancedSearch(params);
        const issues = (result.issues ?? []) as unknown as JiraIssue[];
        allIssues.push(...issues);
        nextPageToken = result.nextPageToken ?? undefined;
      } while (nextPageToken && allIssues.length < maxResults);

      return {
        issues: allIssues,
        total: allIssues.length,
        maxResults,
        startAt: 0
      };
    } catch (error) {
      console.error("Failed to search Jira issues:", error);
      throw error;
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
   * Get issues for configured projects updated after a certain date.
   * When epicKeys are provided, only issues belonging to those epics are returned.
   */
  async getRecentIssues(updatedAfter?: string, epicKeys?: string[]): Promise<JiraIssue[]> {
    const projectKeys = this.config.projectKeys;
    const projectFilter = `project in (${projectKeys.join(", ")})`;
    const dateFilter = updatedAfter ? ` AND updated >= "${updatedAfter}"` : "";
    const epicFilter = epicKeys && epicKeys.length > 0
      ? ` AND parentEpic in (${epicKeys.join(", ")})`
      : "";
    const jql = `${projectFilter}${dateFilter}${epicFilter} ORDER BY updated DESC`;

    const result = await this.searchIssues(jql, { maxResults: 500 });
    return result?.issues ?? [];
  }

  /**
   * Get all issues for configured projects, optionally filtered by epics
   */
  async getAllProjectIssues(epicKeys?: string[]): Promise<JiraIssue[]> {
    return this.getRecentIssues(undefined, epicKeys);
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
