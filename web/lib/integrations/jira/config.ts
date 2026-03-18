/**
 * Jira Configuration Parser
 *
 * Parses Jira configuration from environment variables.
 * Supports both project-based and board-based filtering for M2P dual-board workflow.
 */

import { readFileSync } from "fs";
import { join } from "path";
import type { BoardType } from "./types";

export interface CharterMapping {
  boards: Record<string, { name: string; charter: string; type: BoardType; description?: string }>;
  projects: Record<string, { name: string; charter: string; type: BoardType; description?: string }>;
  charters: string[];
  linkingRules?: {
    csoToLen?: {
      description: string;
      workflow: string;
      linkTypes: string[];
    };
  };
  documentTypes?: Record<string, string>;
}

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKeys: string[];
  boardIds: number[];           // Board IDs to query
  epicKeys?: string[];          // Epic keys to filter by (e.g., ["CSO-123", "LEN-456"])
  customFilters?: string[];     // Existing custom filters support
  charterMapping?: CharterMapping; // Charter mapping config
  syncJql?: string;             // Optional custom JQL override for sync
}

/**
 * Load charter mapping configuration from JSON file
 */
export function loadCharterMapping(): CharterMapping | null {
  try {
    const configPath = process.env.CHARTER_CONFIG_PATH || join(process.cwd(), "..", ".config", "charter-mapping.json");
    const configContent = readFileSync(configPath, "utf-8");
    return JSON.parse(configContent) as CharterMapping;
  } catch (error) {
    console.warn("Charter mapping config not found or invalid:", error);
    return null;
  }
}

/**
 * Load Jira configuration from environment variables
 */
export function getJiraConfig(): JiraConfig | null {
  const baseUrl = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const projectKeys = process.env.JIRA_PROJECT_KEYS?.split(",").map((k) => k.trim());

  if (!baseUrl || !email || !apiToken || !projectKeys || projectKeys.length === 0) {
    return null;
  }

  const boardIds = process.env.JIRA_BOARD_IDS?.split(",").map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id)) || [];
  const epicKeys = process.env.JIRA_EPIC_KEYS?.split(",").map((k) => k.trim()).filter(Boolean) || undefined;
  const customFilters = process.env.JIRA_CUSTOM_FILTERS?.split(",").map((f) => f.trim());
  const syncJql = process.env.JIRA_SYNC_JQL?.trim() || undefined;
  const charterMapping = loadCharterMapping();

  return {
    baseUrl,
    email,
    apiToken,
    projectKeys,
    boardIds,
    epicKeys,
    customFilters,
    charterMapping: charterMapping || undefined,
    syncJql
  };
}

/**
 * Check if Jira integration is configured
 */
export function isJiraConfigured(): boolean {
  return getJiraConfig() !== null;
}

/**
 * Get charter and board type for a project key or board ID
 */
export function getCharterForSource(
  source: { projectKey?: string; boardId?: number },
  charterMapping?: CharterMapping
): { charter?: string; boardType?: BoardType; documentType?: string } {
  if (!charterMapping) {
    return {};
  }

  if (source.boardId && charterMapping.boards[source.boardId.toString()]) {
    const board = charterMapping.boards[source.boardId.toString()];
    const documentType = charterMapping.documentTypes?.[board.type];
    return { charter: board.charter, boardType: board.type, documentType };
  }

  if (source.projectKey && charterMapping.projects[source.projectKey]) {
    const project = charterMapping.projects[source.projectKey];
    const documentType = charterMapping.documentTypes?.[project.type];
    return { charter: project.charter, boardType: project.type, documentType };
  }

  return {};
}
