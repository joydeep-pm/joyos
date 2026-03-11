import fs from "node:fs/promises";
import path from "node:path";

import { readJsonFile, writeJsonFile } from "@/lib/assistant/storage";
import type { FeatureRequestReviewRecord, FeatureRequestReviewSource, FeatureRequestReviewStatus } from "./types";
import { nanoid } from "nanoid";

function getReviewsDir(): string {
  const root = process.env.ASSISTANT_CACHE_DIR ?? path.join(process.cwd(), ".cache");
  return path.join(root, "control-tower");
}

function getReviewsFile(): string {
  return path.join(getReviewsDir(), "feature-request-reviews.json");
}

export interface FeatureRequestReviewStore {
  version: 1;
  lastUpdated: string;
  reviews: FeatureRequestReviewRecord[];
}

export interface UpsertFeatureRequestReviewInput {
  featureRequestId: string;
  reviewStatus: FeatureRequestReviewStatus;
  decisionSummary: string;
  decisionRationale: string;
  pendingDecisions: string[];
  nextActions: string[];
  reviewedBy: string;
  source: FeatureRequestReviewSource;
}

export interface UpdateFeatureRequestReviewInput {
  reviewStatus?: FeatureRequestReviewStatus;
  decisionSummary?: string;
  decisionRationale?: string;
  pendingDecisions?: string[];
  nextActions?: string[];
  reviewedBy?: string;
  source?: FeatureRequestReviewSource;
  lastReviewedAt?: string;
}

function createEmptyStore(timestamp: string): FeatureRequestReviewStore {
  return {
    version: 1,
    lastUpdated: timestamp,
    reviews: []
  };
}

export async function readReviewStore(): Promise<FeatureRequestReviewStore | null> {
  return readJsonFile<FeatureRequestReviewStore | null>(getReviewsFile(), null);
}

export async function writeReviewStore(store: FeatureRequestReviewStore): Promise<void> {
  await fs.mkdir(getReviewsDir(), { recursive: true });
  await writeJsonFile(getReviewsFile(), store);
}

export async function getReviewsForFeatureRequest(
  featureRequestId: string
): Promise<FeatureRequestReviewRecord[]> {
  const store = await readReviewStore();
  if (!store) {
    return [];
  }

  return store.reviews.filter((review) => review.featureRequestId === featureRequestId);
}

export async function upsertFeatureRequestReview(
  input: UpsertFeatureRequestReviewInput
): Promise<FeatureRequestReviewRecord> {
  const now = new Date().toISOString();
  const store = (await readReviewStore()) ?? createEmptyStore(now);
  const reviewIndex = store.reviews.findIndex(
    (review) => review.featureRequestId === input.featureRequestId
  );

  const nextReview: FeatureRequestReviewRecord =
    reviewIndex === -1
      ? {
          id: `review-${nanoid(10)}`,
          featureRequestId: input.featureRequestId,
          reviewStatus: input.reviewStatus,
          decisionSummary: input.decisionSummary,
          decisionRationale: input.decisionRationale,
          pendingDecisions: input.pendingDecisions,
          nextActions: input.nextActions,
          reviewedBy: input.reviewedBy,
          source: input.source,
          createdAt: now,
          updatedAt: now,
          lastReviewedAt: now
        }
      : {
          ...store.reviews[reviewIndex],
          reviewStatus: input.reviewStatus,
          decisionSummary: input.decisionSummary,
          decisionRationale: input.decisionRationale,
          pendingDecisions: input.pendingDecisions,
          nextActions: input.nextActions,
          reviewedBy: input.reviewedBy,
          source: input.source,
          updatedAt: now,
          lastReviewedAt: now
        };

  if (reviewIndex === -1) {
    store.reviews.push(nextReview);
  } else {
    store.reviews[reviewIndex] = nextReview;
  }

  store.lastUpdated = now;
  await writeReviewStore(store);

  return nextReview;
}

export async function updateFeatureRequestReview(
  featureRequestId: string,
  patch: UpdateFeatureRequestReviewInput
): Promise<FeatureRequestReviewRecord | null> {
  const store = await readReviewStore();
  if (!store) {
    return null;
  }

  const reviewIndex = store.reviews.findIndex(
    (review) => review.featureRequestId === featureRequestId
  );
  if (reviewIndex === -1) {
    return null;
  }

  const now = new Date().toISOString();
  const existing = store.reviews[reviewIndex];
  const updated: FeatureRequestReviewRecord = {
    ...existing,
    ...patch,
    updatedAt: now,
    lastReviewedAt: patch.lastReviewedAt ?? existing.lastReviewedAt
  };

  store.reviews[reviewIndex] = updated;
  store.lastUpdated = now;
  await writeReviewStore(store);

  return updated;
}

export { getReviewsDir, getReviewsFile };
