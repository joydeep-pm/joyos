/**
 * Real Status Override Layer
 *
 * Jira status often does not reflect the true operational state of a ticket.
 * This module provides a local override store so the director can record
 * the actual status against each feature request, using the M2P taxonomy.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { readJsonFile, writeJsonFile } from "@/lib/assistant/storage";
import {
  PRE_GROOMING_STATUSES, POST_GROOMING_STATUSES,
  REAL_STATUS_LABELS, REAL_STATUS_COLORS,
  type RealStatusValue, type RealStatusEntry, type RealStatusStore,
} from "@/lib/control-tower/real-status-types";

export {
  PRE_GROOMING_STATUSES, POST_GROOMING_STATUSES,
  REAL_STATUS_LABELS, REAL_STATUS_COLORS,
};
export type { RealStatusValue, RealStatusEntry, RealStatusStore };

// ── Storage helpers ───────────────────────────────────────────────────────────

function getStoreDir(): string {
  const root = process.env.ASSISTANT_CACHE_DIR ?? path.join(process.cwd(), ".cache");
  return path.join(root, "control-tower");
}

function getStoreFile(): string {
  return path.join(getStoreDir(), "real-status.json");
}

function emptyStore(): RealStatusStore {
  return { version: 1, lastUpdated: new Date().toISOString(), entries: [] };
}

export async function readRealStatusStore(): Promise<RealStatusStore> {
  const store = await readJsonFile<RealStatusStore | null>(getStoreFile(), null);
  return store ?? emptyStore();
}

export async function writeRealStatusStore(store: RealStatusStore): Promise<void> {
  await fs.mkdir(getStoreDir(), { recursive: true });
  await writeJsonFile(getStoreFile(), store);
}

// ── Business logic ────────────────────────────────────────────────────────────

/** Upsert a real status override for a feature request */
export async function setRealStatus(
  featureRequestId: string,
  jiraKeys: string[],
  status: RealStatusValue,
  note: string
): Promise<RealStatusEntry> {
  const store = await readRealStatusStore();
  const now = new Date().toISOString();

  const existing = store.entries.findIndex((e) => e.featureRequestId === featureRequestId);

  const entry: RealStatusEntry = {
    featureRequestId,
    jiraKeys,
    status,
    note,
    setAt: now,
    setBy: "director",
    reviewedToday: true,
    reviewedTodayAt: now,
  };

  if (existing >= 0) {
    store.entries[existing] = { ...store.entries[existing], ...entry };
  } else {
    store.entries.push(entry);
  }

  store.lastUpdated = now;
  await writeRealStatusStore(store);
  return entry;
}

/** Mark a feature request as reviewed today without changing its status */
export async function markReviewedToday(featureRequestId: string): Promise<void> {
  const store = await readRealStatusStore();
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const idx = store.entries.findIndex((e) => e.featureRequestId === featureRequestId);
  if (idx >= 0) {
    store.entries[idx].reviewedToday = true;
    store.entries[idx].reviewedTodayAt = now;
  } else {
    // Create a stub entry just to record the review
    store.entries.push({
      featureRequestId,
      jiraKeys: [],
      status: "grooming_in_progress",
      note: "",
      setAt: now,
      setBy: "director",
      reviewedToday: true,
      reviewedTodayAt: now,
    });
  }

  store.lastUpdated = now;
  await writeRealStatusStore(store);
}

/** Reset reviewedToday flags for all entries (called at start of day) */
export async function resetDailyReviewFlags(): Promise<void> {
  const store = await readRealStatusStore();
  const today = new Date().toISOString().slice(0, 10);

  for (const entry of store.entries) {
    if (entry.reviewedTodayAt) {
      const entryDate = entry.reviewedTodayAt.slice(0, 10);
      if (entryDate !== today) {
        entry.reviewedToday = false;
      }
    }
  }

  await writeRealStatusStore(store);
}

/** Get a map of featureRequestId → RealStatusEntry */
export async function getRealStatusMap(): Promise<Record<string, RealStatusEntry>> {
  const store = await readRealStatusStore();
  const map: Record<string, RealStatusEntry> = {};
  for (const entry of store.entries) {
    map[entry.featureRequestId] = entry;
  }
  return map;
}
