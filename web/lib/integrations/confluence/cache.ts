/**
 * Confluence Cache Layer
 *
 * Caches Confluence pages to local filesystem for fast access.
 */

import path from "node:path";
import { readJsonFile, writeJsonFile } from "@/lib/assistant/storage";
import type { NormalizedConfluencePage } from "./types";

const CACHE_FILE = "confluence-pages.json";

export interface ConfluenceCache {
  version: number;
  lastSyncAt: string;
  pageCount: number;
  pages: NormalizedConfluencePage[];
}

/**
 * Get the path to the Confluence cache file
 */
function getConfluenceCachePath(): string {
  const projectRoot = process.cwd();
  const cacheDir = path.join(projectRoot, "..", ".cache");
  return path.join(cacheDir, CACHE_FILE);
}

/**
 * Read Confluence cache from disk
 */
export async function readConfluenceCache(): Promise<ConfluenceCache | null> {
  const cachePath = getConfluenceCachePath();
  const cache = await readJsonFile<ConfluenceCache | null>(cachePath, null);
  return cache;
}

/**
 * Write Confluence cache to disk
 */
export async function writeConfluenceCache(pages: NormalizedConfluencePage[]): Promise<void> {
  const cache: ConfluenceCache = {
    version: 1,
    lastSyncAt: new Date().toISOString(),
    pageCount: pages.length,
    pages
  };

  const cachePath = getConfluenceCachePath();
  await writeJsonFile(cachePath, cache);
}

/**
 * Get cached Confluence pages
 */
export async function getCachedConfluencePages(): Promise<NormalizedConfluencePage[]> {
  const cache = await readConfluenceCache();
  return cache?.pages ?? [];
}

/**
 * Check if cache exists and is fresh
 */
export async function isCacheFresh(maxAgeMs: number = 3600000): Promise<boolean> {
  const cache = await readConfluenceCache();
  if (!cache) return false;

  const lastSync = new Date(cache.lastSyncAt);
  const now = new Date();
  const ageMs = now.getTime() - lastSync.getTime();

  return ageMs < maxAgeMs;
}
