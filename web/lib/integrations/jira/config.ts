/**
 * Jira Integration Configuration
 *
 * Provides environment-based configuration for Jira API access.
 * Credentials should be stored in environment variables.
 */

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKeys: string[];
  boardIds?: number[];
  customFilters?: string[];
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

  return {
    baseUrl,
    email,
    apiToken,
    projectKeys,
    boardIds: process.env.JIRA_BOARD_IDS?.split(",").map((id) => parseInt(id.trim(), 10)),
    customFilters: process.env.JIRA_CUSTOM_FILTERS?.split(",").map((f) => f.trim())
  };
}

/**
 * Check if Jira integration is configured
 */
export function isJiraConfigured(): boolean {
  return getJiraConfig() !== null;
}
