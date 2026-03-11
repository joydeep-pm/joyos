import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";

import {
  getReviewsForFeatureRequest,
  readReviewStore,
  upsertFeatureRequestReview,
  updateFeatureRequestReview
} from "@/lib/control-tower/reviews";

describe("review store", () => {
  const testCacheDir = path.join(process.cwd(), ".cache-test", "reviews");

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-11T10:00:00.000Z"));
    process.env.ASSISTANT_CACHE_DIR = testCacheDir;
    await fs.rm(testCacheDir, { recursive: true, force: true });
  });

  it("persists a private review overlay record with stable timestamps and provenance", async () => {
    const review = await upsertFeatureRequestReview({
      featureRequestId: "fr-123",
      reviewStatus: "approved_for_grooming",
      decisionSummary: "Ready for engineering grooming.",
      decisionRationale: "Scope is clear and dependencies are resolved.",
      pendingDecisions: ["Confirm rollout owner"],
      nextActions: ["Schedule grooming session"],
      reviewedBy: "Director",
      source: "director_review"
    });

    expect(review).toMatchObject({
      id: expect.stringMatching(/^review-/),
      featureRequestId: "fr-123",
      reviewStatus: "approved_for_grooming",
      decisionSummary: "Ready for engineering grooming.",
      decisionRationale: "Scope is clear and dependencies are resolved.",
      pendingDecisions: ["Confirm rollout owner"],
      nextActions: ["Schedule grooming session"],
      reviewedBy: "Director",
      source: "director_review",
      createdAt: "2026-03-11T10:00:00.000Z",
      updatedAt: "2026-03-11T10:00:00.000Z",
      lastReviewedAt: "2026-03-11T10:00:00.000Z"
    });

    const store = await readReviewStore();
    expect(store).toMatchObject({
      version: 1,
      lastUpdated: "2026-03-11T10:00:00.000Z",
      reviews: [review]
    });
  });

  it("updates the existing record on upsert instead of creating duplicates", async () => {
    const original = await upsertFeatureRequestReview({
      featureRequestId: "fr-123",
      reviewStatus: "needs_follow_up",
      decisionSummary: "Need implementation estimate.",
      decisionRationale: "Timeline is unclear.",
      pendingDecisions: ["Who owns backend changes?"],
      nextActions: ["Ask engineering for sizing"],
      reviewedBy: "Director",
      source: "director_review"
    });

    vi.setSystemTime(new Date("2026-03-12T08:30:00.000Z"));

    const updated = await upsertFeatureRequestReview({
      featureRequestId: "fr-123",
      reviewStatus: "approved_for_grooming",
      decisionSummary: "Estimate arrived and request is ready.",
      decisionRationale: "Engineering sizing is now documented.",
      pendingDecisions: [],
      nextActions: ["Move into estimation"],
      reviewedBy: "Director",
      source: "director_review"
    });

    expect(updated.id).toBe(original.id);
    expect(updated.createdAt).toBe("2026-03-11T10:00:00.000Z");
    expect(updated.updatedAt).toBe("2026-03-12T08:30:00.000Z");
    expect(updated.lastReviewedAt).toBe("2026-03-12T08:30:00.000Z");

    const store = await readReviewStore();
    expect(store?.reviews).toHaveLength(1);
    expect(store?.reviews[0]).toMatchObject({
      featureRequestId: "fr-123",
      reviewStatus: "approved_for_grooming",
      decisionSummary: "Estimate arrived and request is ready.",
      nextActions: ["Move into estimation"]
    });
  });

  it("supports patch updates while preserving untouched review fields", async () => {
    await upsertFeatureRequestReview({
      featureRequestId: "fr-123",
      reviewStatus: "needs_follow_up",
      decisionSummary: "Need rollout clarity.",
      decisionRationale: "Operations handoff is missing.",
      pendingDecisions: ["Who handles launch comms?"],
      nextActions: ["Follow up with implementation"],
      reviewedBy: "Director",
      source: "director_review"
    });

    vi.setSystemTime(new Date("2026-03-13T14:45:00.000Z"));

    const patched = await updateFeatureRequestReview("fr-123", {
      pendingDecisions: ["Confirm launch owner", "Confirm rollout checklist"],
      nextActions: ["Escalate to implementation manager"]
    });

    expect(patched).toMatchObject({
      featureRequestId: "fr-123",
      reviewStatus: "needs_follow_up",
      decisionSummary: "Need rollout clarity.",
      decisionRationale: "Operations handoff is missing.",
      pendingDecisions: ["Confirm launch owner", "Confirm rollout checklist"],
      nextActions: ["Escalate to implementation manager"],
      updatedAt: "2026-03-13T14:45:00.000Z",
      lastReviewedAt: "2026-03-11T10:00:00.000Z"
    });
  });

  it("retrieves only reviews for the requested feature request", async () => {
    await upsertFeatureRequestReview({
      featureRequestId: "fr-123",
      reviewStatus: "approved_for_grooming",
      decisionSummary: "Ready.",
      decisionRationale: "All dependencies resolved.",
      pendingDecisions: [],
      nextActions: ["Book grooming"],
      reviewedBy: "Director",
      source: "director_review"
    });

    await upsertFeatureRequestReview({
      featureRequestId: "fr-999",
      reviewStatus: "rejected",
      decisionSummary: "Not proceeding.",
      decisionRationale: "Does not align to roadmap.",
      pendingDecisions: [],
      nextActions: ["Close request"],
      reviewedBy: "Director",
      source: "director_review"
    });

    const reviews = await getReviewsForFeatureRequest("fr-123");

    expect(reviews).toHaveLength(1);
    expect(reviews[0].featureRequestId).toBe("fr-123");
    expect(reviews[0].reviewStatus).toBe("approved_for_grooming");
  });
});
