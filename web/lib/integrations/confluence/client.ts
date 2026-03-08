/**
 * Confluence API Client Wrapper
 *
 * Provides a simplified interface to the Confluence API with error handling.
 */

import { ConfluenceClient as BaseConfluenceClient } from "confluence.js";
import type { ConfluenceConfig } from "./config";
import type { ConfluencePage, ConfluenceSearchResult } from "./types";

export class ConfluenceClient {
  private client: BaseConfluenceClient | null = null;
  private config: ConfluenceConfig;

  constructor(config: ConfluenceConfig) {
    this.config = config;
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      this.client = new BaseConfluenceClient({
        host: this.config.baseUrl,
        authentication: {
          basic: {
            email: this.config.email,
            apiToken: this.config.apiToken
          }
        }
      });
    } catch (error) {
      console.error("Failed to initialize Confluence client:", error);
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
   * Search for pages in a space
   */
  async searchPages(spaceKey: string, options?: { limit?: number; start?: number }): Promise<ConfluenceSearchResult | null> {
    if (!this.client) {
      console.error("Confluence client not initialized");
      return null;
    }

    try {
      const result = await this.client.content.getContent({
        spaceKey,
        type: "page",
        limit: options?.limit ?? 100,
        start: options?.start ?? 0,
        expand: ["body.storage", "version", "space", "metadata.labels"]
      });

      return {
        results: result.results as ConfluencePage[],
        size: result.size ?? 0,
        start: result.start ?? 0,
        limit: result.limit ?? 0
      };
    } catch (error) {
      console.error(`Failed to search Confluence pages in space ${spaceKey}:`, error);
      return null;
    }
  }

  /**
   * Get a single page by ID
   */
  async getPage(pageId: string): Promise<ConfluencePage | null> {
    if (!this.client) {
      console.error("Confluence client not initialized");
      return null;
    }

    try {
      const page = await this.client.content.getContentById({
        id: pageId,
        expand: ["body.storage", "version", "space", "metadata.labels"]
      });

      return page as ConfluencePage;
    } catch (error) {
      console.error(`Failed to get Confluence page ${pageId}:`, error);
      return null;
    }
  }

  /**
   * Get all pages from configured spaces
   */
  async getAllSpacePages(): Promise<ConfluencePage[]> {
    const allPages: ConfluencePage[] = [];

    for (const spaceKey of this.config.spaceKeys) {
      const result = await this.searchPages(spaceKey, { limit: 500 });
      if (result?.results) {
        allPages.push(...result.results);
      }
    }

    return allPages;
  }
}

/**
 * Create a Confluence client instance
 */
export function createConfluenceClient(config: ConfluenceConfig): ConfluenceClient {
  return new ConfluenceClient(config);
}
