/**
 * Confluence Adapter
 *
 * Transforms Confluence API responses into normalized internal format.
 */

import type { ConfluencePage, NormalizedConfluencePage } from "./types";
import { ConfluenceClient } from "./client";
import type { ConfluenceConfig } from "./config";

/**
 * Normalize a Confluence page into internal format
 */
export function normalizeConfluencePage(page: ConfluencePage, baseUrl: string): NormalizedConfluencePage {
  return {
    id: page.id,
    title: page.title,
    content: page.body?.storage?.value ?? page.body?.view?.value,
    spaceKey: page.space?.key ?? "",
    spaceName: page.space?.name ?? "",
    labels: page.metadata?.labels?.results.map((l) => l.name) ?? [],
    version: page.version?.number ?? 1,
    lastModified: page.version?.when ?? "",
    lastModifiedBy: page.version?.by
      ? {
          id: page.version.by.accountId,
          name: page.version.by.displayName,
          email: page.version.by.email
        }
      : undefined,
    url: page._links?.webui ? `${baseUrl}${page._links.webui}` : `${baseUrl}/pages/${page.id}`
  };
}

/**
 * Confluence Adapter - Fetches and normalizes Confluence pages
 */
export class ConfluenceAdapter {
  private client: ConfluenceClient;
  private baseUrl: string;

  constructor(config: ConfluenceConfig) {
    this.client = new ConfluenceClient(config);
    this.baseUrl = config.baseUrl;
  }

  /**
   * Fetch all pages from configured spaces
   */
  async fetchPages(): Promise<NormalizedConfluencePage[]> {
    if (!this.client.isReady()) {
      console.warn("Confluence client not ready, returning empty results");
      return [];
    }

    const pages = await this.client.getAllSpacePages();
    return pages.map((page) => normalizeConfluencePage(page, this.baseUrl));
  }

  /**
   * Fetch pages from a specific space
   */
  async fetchSpacePages(spaceKey: string): Promise<NormalizedConfluencePage[]> {
    if (!this.client.isReady()) {
      console.warn("Confluence client not ready, returning empty results");
      return [];
    }

    const result = await this.client.searchPages(spaceKey, { limit: 500 });
    if (!result?.results) return [];

    return result.results.map((page) => normalizeConfluencePage(page, this.baseUrl));
  }

  /**
   * Fetch a single page by ID
   */
  async fetchPage(pageId: string): Promise<NormalizedConfluencePage | null> {
    if (!this.client.isReady()) {
      console.warn("Confluence client not ready, returning null");
      return null;
    }

    const page = await this.client.getPage(pageId);
    if (!page) return null;

    return normalizeConfluencePage(page, this.baseUrl);
  }
}

/**
 * Create a Confluence adapter instance
 */
export function createConfluenceAdapter(config: ConfluenceConfig): ConfluenceAdapter {
  return new ConfluenceAdapter(config);
}
