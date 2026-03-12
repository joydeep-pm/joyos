import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";

import { readJsonFile, writeJsonFile } from "@/lib/assistant/storage";
import type { PeopleRecord } from "./people-types";

function getPeopleDir(): string {
  const root = process.env.ASSISTANT_CACHE_DIR ?? path.join(process.cwd(), ".cache");
  return path.join(root, "control-tower");
}

function getPeopleFile(): string {
  return path.join(getPeopleDir(), "people-records.json");
}

export interface PeopleStore {
  version: 1;
  lastUpdated: string;
  records: PeopleRecord[];
}

export interface UpsertPeopleRecordInput {
  pmName: string;
  lastOneOnOneDate?: string;
  nextOneOnOneDate?: string;
  coachingFocus: string[];
  privateNotes: string;
  lastUpdatedBy: string;
}

export interface UpdatePeopleRecordInput {
  lastOneOnOneDate?: string;
  nextOneOnOneDate?: string;
  coachingFocus?: string[];
  privateNotes?: string;
  lastUpdatedBy?: string;
}

function createEmptyStore(timestamp: string): PeopleStore {
  return {
    version: 1,
    lastUpdated: timestamp,
    records: []
  };
}

export async function readPeopleStore(): Promise<PeopleStore | null> {
  return readJsonFile<PeopleStore | null>(getPeopleFile(), null);
}

export async function writePeopleStore(store: PeopleStore): Promise<void> {
  await fs.mkdir(getPeopleDir(), { recursive: true });
  await writeJsonFile(getPeopleFile(), store);
}

export async function upsertPeopleRecord(input: UpsertPeopleRecordInput): Promise<PeopleRecord> {
  const now = new Date().toISOString();
  const store = (await readPeopleStore()) ?? createEmptyStore(now);
  const normalizedPmName = input.pmName.trim();
  const recordIndex = store.records.findIndex((record) => record.pmName === normalizedPmName);

  const nextRecord: PeopleRecord =
    recordIndex === -1
      ? {
          id: `pm-record-${nanoid(10)}`,
          pmName: normalizedPmName,
          lastOneOnOneDate: input.lastOneOnOneDate,
          nextOneOnOneDate: input.nextOneOnOneDate,
          coachingFocus: input.coachingFocus,
          privateNotes: input.privateNotes,
          lastUpdatedBy: input.lastUpdatedBy,
          createdAt: now,
          updatedAt: now
        }
      : {
          ...store.records[recordIndex],
          lastOneOnOneDate: input.lastOneOnOneDate,
          nextOneOnOneDate: input.nextOneOnOneDate,
          coachingFocus: input.coachingFocus,
          privateNotes: input.privateNotes,
          lastUpdatedBy: input.lastUpdatedBy,
          updatedAt: now
        };

  if (recordIndex === -1) {
    store.records.push(nextRecord);
  } else {
    store.records[recordIndex] = nextRecord;
  }

  store.lastUpdated = now;
  await writePeopleStore(store);

  return nextRecord;
}

export async function updatePeopleRecord(
  pmName: string,
  patch: UpdatePeopleRecordInput
): Promise<PeopleRecord | null> {
  const store = await readPeopleStore();
  if (!store) {
    return null;
  }

  const normalizedPmName = pmName.trim();
  const recordIndex = store.records.findIndex((record) => record.pmName === normalizedPmName);
  if (recordIndex === -1) {
    return null;
  }

  const existing = store.records[recordIndex];
  const now = new Date().toISOString();
  const updated: PeopleRecord = {
    ...existing,
    ...patch,
    updatedAt: now
  };

  store.records[recordIndex] = updated;
  store.lastUpdated = now;
  await writePeopleStore(store);

  return updated;
}

export { getPeopleDir, getPeopleFile };
