/**
 * Jira Adapter
 *
 * Transforms Jira API responses into normalized internal format.
 * Includes M2P board-aware extensions for CSo/LEN workflow.
 */

import type { JiraIssue, NormalizedJiraIssue, BoardType } from "./types";
import { JiraClient } from "./client";
import type { JiraConfig, CharterMapping } from "./config";
import { getCharterForSource } from "./config";
import { parseIssueLinks, extractSprintInfo, getDocumentType, getBoardTypeFromIssueKey } from "./link-parser";

/**
 * Normalize a Jira issue into internal format with board awareness
 */
export function normalizeJiraIssue(
  issue: JiraIssue,
  baseUrl: string,
  boardContext?: { boardId?: number; charterMapping?: CharterMapping }
): NormalizedJiraIssue {
  const fields = issue.fields;
  const projectKey = issue.key.split("-")[0];

  // Determine board type and charter
  const boardInfo = boardContext?.boardId
    ? getCharterForSource({ boardId: boardContext.boardId }, boardContext.charterMapping)
    : getCharterForSource({ projectKey }, boardContext?.charterMapping);

  const boardType = boardInfo.boardType;
  const productCharter = boardInfo.charter;
  const documentType = getDocumentType(boardType);

  // Parse issue links for CSo↔LEN workflow
  const parsedLinks = parseIssueLinks(issue);
  const linkedIssues = parsedLinks.map((link) => ({
    key: link.linkedIssueKey,
    type: link.linkType,
    summary: "", // Will be populated by feature request engine if needed
    status: ""
  }));

  // Extract sprint info (LEN tickets only)
  const sprintInfo = boardType === "len" ? extractSprintInfo(issue) : {};

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
    url: `${baseUrl}/browse/${issue.key}`,

    // M2P Board Extensions
    boardId: boardContext?.boardId,
    boardType,
    productCharter,
    documentType,
    sprintId: sprintInfo.sprintId,
    sprintName: sprintInfo.sprintName,
    linkedIssues: linkedIssues.length > 0 ? linkedIssues : undefined
  };
}

/**
 * Jira Adapter - Fetches and normalizes Jira issues with M2P board awareness
 */
export class JiraAdapter {
  private client: JiraClient;
  private baseUrl: string;
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.client = new JiraClient(config);
    this.baseUrl = config.baseUrl;
    this.config = config;
  }

  /**
   * Fetch all issues from configured projects AND boards
   * Supports M2P dual-board workflow (CSo + LEN)
   */
  async fetchIssues(): Promise<NormalizedJiraIssue[]> {
    if (!this.client.isReady()) {
      console.warn("Jira client not ready, returning empty results");
      return [];
    }

    const allIssues: NormalizedJiraIssue[] = [];

    // Fetch from projects (original behavior)
    const projectIssues = await this.client.getAllProjectIssues();
    const normalizedProjectIssues = projectIssues.map((issue) =>
      normalizeJiraIssue(issue, this.baseUrl, {
        charterMapping: this.config.charterMapping
      })
    );
    allIssues.push(...normalizedProjectIssues);

    // Fetch from boards (M2P extension)
    if (this.config.boardIds && this.config.boardIds.length > 0) {
      for (const boardId of this.config.boardIds) {
        const boardIssues = await this.client.getBoardIssues(boardId);
        const normalizedBoardIssues = boardIssues.map((issue) =>
          normalizeJiraIssue(issue, this.baseUrl, {
            boardId,
            charterMapping: this.config.charterMapping
          })
        );
        allIssues.push(...normalizedBoardIssues);
      }
    }

    // Deduplicate by issue key (in case issue appears in both project and board queries)
    const uniqueIssues = Array.from(
      new Map(allIssues.map((issue) => [issue.key, issue])).values()
    );

    return uniqueIssues;
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
    return issues.map((issue) =>
      normalizeJiraIssue(issue, this.baseUrl, {
        charterMapping: this.config.charterMapping
      })
    );
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

    return normalizeJiraIssue(issue, this.baseUrl, {
      charterMapping: this.config.charterMapping
    });
  }

  /**
   * Fetch issues from a specific board (M2P CSo/LEN workflow)
   */
  async fetchBoardIssues(boardId: number): Promise<NormalizedJiraIssue[]> {
    if (!this.client.isReady()) {
      console.warn("Jira client not ready, returning empty results");
      return [];
    }

    const issues = await this.client.getBoardIssues(boardId);
    return issues.map((issue) =>
      normalizeJiraIssue(issue, this.baseUrl, {
        boardId,
        charterMapping: this.config.charterMapping
      })
    );
  }
}

/**
 * Create a Jira adapter instance
 */
export function createJiraAdapter(config: JiraConfig): JiraAdapter {
  return new JiraAdapter(config);
}
