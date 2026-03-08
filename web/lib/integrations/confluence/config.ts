/**
 * Confluence Integration Configuration
 *
 * Provides environment-based configuration for Confluence API access.
 * Credentials should be stored in environment variables.
 */

export interface ConfluenceConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  spaceKeys: string[];
  labelFilters?: string[];
}

/**
 * Load Confluence configuration from environment variables
 */
export function getConfluenceConfig(): ConfluenceConfig | null {
  const baseUrl = process.env.CONFLUENCE_BASE_URL;
  const email = process.env.CONFLUENCE_EMAIL;
  const apiToken = process.env.CONFLUENCE_API_TOKEN;
  const spaceKeys = process.env.CONFLUENCE_SPACE_KEYS?.split(",").map((k) => k.trim());

  if (!baseUrl || !email || !apiToken || !spaceKeys || spaceKeys.length === 0) {
    return null;
  }

  return {
    baseUrl,
    email,
    apiToken,
    spaceKeys,
    labelFilters: process.env.CONFLUENCE_LABEL_FILTERS?.split(",").map((f) => f.trim())
  };
}

/**
 * Check if Confluence integration is configured
 */
export function isConfluenceConfigured(): boolean {
  return getConfluenceConfig() !== null;
}
