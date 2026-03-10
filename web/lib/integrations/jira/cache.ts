/**
 * Jira Cache Layer
 *
 * Caches Jira issues to local filesystem for fast access.
 */

import { readJsonFile, writeJsonFile, getAssistantCachePath } from "@/lib/assistant/storage";
import type { NormalizedJiraIssue } from "./types";

const CACHE_FILE = "jira-issues.json";

export interface JiraCache {
  version: number;
  lastSyncAt: string;
  issueCount: number;
  issues: NormalizedJiraIssue[];
}

/**
 * Get the path to the Jira cache file
 */
function getJiraCachePath(): string {
  return getAssistantCachePath(CACHE_FILE);
}

/**
 * Read Jira cache from disk
 */
export async function readJiraCache(): Promise<JiraCache | null> {
  const cachePath = getJiraCachePath();
  const cache = await readJsonFile<JiraCache | null>(cachePath, null);
  return cache;
}

/**
 * Write Jira cache to disk
 */
export async function writeJiraCache(issues: NormalizedJiraIssue[]): Promise<void> {
  const cache: JiraCache = {
    version: 1,
    lastSyncAt: new Date().toISOString(),
    issueCount: issues.length,
    issues
  };

  const cachePath = getJiraCachePath();
  await writeJsonFile(cachePath, cache);
}

/**
 * Get cached Jira issues
 */
export async function getCachedJiraIssues(): Promise<NormalizedJiraIssue[]> {
  const cache = await readJiraCache();
  return cache?.issues ?? [];
}

/**
 * Check if cache exists and is fresh
 */
export async function isCacheFresh(maxAgeMs: number = 3600000): Promise<boolean> {
  const cache = await readJiraCache();
  if (!cache) return false;

  const lastSync = new Date(cache.lastSyncAt);
  const now = new Date();
  const ageMs = now.getTime() - lastSync.getTime();

  return ageMs < maxAgeMs;
}
