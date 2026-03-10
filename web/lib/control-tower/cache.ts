/**
 * Feature Request Cache Layer
 *
 * Caches feature requests to local filesystem for fast access.
 */

import { readJsonFile, writeJsonFile, getAssistantCachePath } from "@/lib/assistant/storage";
import type { FeatureRequest, FeatureRequestCache } from "./types";
import { readJiraCache } from "@/lib/integrations/jira";
import { readConfluenceCache } from "@/lib/integrations/confluence";

const CACHE_FILE = "feature-requests.json";

/**
 * Get the path to the feature request cache file
 */
function getFeatureRequestCachePath(): string {
  return getAssistantCachePath(CACHE_FILE);
}

/**
 * Read feature request cache from disk
 */
export async function readFeatureRequestCache(): Promise<FeatureRequestCache | null> {
  const cachePath = getFeatureRequestCachePath();
  const cache = await readJsonFile<FeatureRequestCache | null>(cachePath, null);
  return cache;
}

/**
 * Write feature request cache to disk
 */
export async function writeFeatureRequestCache(featureRequests: FeatureRequest[]): Promise<void> {
  // Get source metadata
  const jiraCache = await readJiraCache();
  const confluenceCache = await readConfluenceCache();

  const cache: FeatureRequestCache = {
    version: 1,
    generatedAt: new Date().toISOString(),
    sources: {
      jira: {
        issueCount: jiraCache?.issueCount ?? 0,
        lastSyncAt: jiraCache?.lastSyncAt ?? new Date(0).toISOString()
      },
      confluence: {
        pageCount: confluenceCache?.pageCount ?? 0,
        lastSyncAt: confluenceCache?.lastSyncAt ?? new Date(0).toISOString()
      },
      local: {
        noteCount: 0 // TODO: Count local notes when that's implemented
      }
    },
    featureRequests
  };

  const cachePath = getFeatureRequestCachePath();
  await writeJsonFile(cachePath, cache);
}

/**
 * Get cached feature requests
 */
export async function getCachedFeatureRequests(): Promise<FeatureRequest[]> {
  const cache = await readFeatureRequestCache();
  return cache?.featureRequests ?? [];
}

/**
 * Check if cache exists and is fresh
 */
export async function isCacheFresh(maxAgeMs: number = 3600000): Promise<boolean> {
  const cache = await readFeatureRequestCache();
  if (!cache) return false;

  const generatedAt = new Date(cache.generatedAt);
  const now = new Date();
  const ageMs = now.getTime() - generatedAt.getTime();

  return ageMs < maxAgeMs;
}
