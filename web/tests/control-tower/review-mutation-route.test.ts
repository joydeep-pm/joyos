import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";

vi.mock("@/lib/control-tower/cache", () => ({
  getCachedFeatureRequests: vi.fn()
}));

const { POST } = await import("@/app/api/control-tower/reviews/route");
const { getCachedFeatureRequests } = await import("@/lib/control-tower/cache");

describe("POST /api/control-tower/reviews", () => {
  const testCacheDir = path.join(process.cwd(), ".cache-test", "review-mutation-route");

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-11T10:00:00.000Z"));
    process.env.ASSISTANT_CACHE_DIR = testCacheDir;
    await fs.rm(testCacheDir, { recursive: true, force: true });
    vi.mocked(getCachedFeatureRequests).mockResolvedValue([
      {
        id: "fr-123",
        title: "Payment reversal dashboard",
        source: "client_escalation",
        stage: "director_review",
        client: "Acme Bank",
        productCharter: "Payments",
        pmOwner: "Alice",
        jiraIssues: [],
        confluencePages: [],
        localNotes: [],
        riskSummary: { severity: "medium", factors: [] },
        blockerSummary: { hasBlockers: false, blockerCount: 0, blockers: [] },
        latestUpdate: {
          date: "2026-03-10T09:00:00.000Z",
          source: "jira",
          summary: "Waiting for review"
        },
        createdAt: "2026-03-01T09:00:00.000Z",
        updatedAt: "2026-03-10T09:00:00.000Z",
        lastSyncedAt: "2026-03-11T09:00:00.000Z"
      }
    ]);
  });

  it("creates a persisted review record for a known feature request", async () => {
    const response = await POST(
      new Request("http://localhost/api/control-tower/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureRequestId: "fr-123",
          reviewStatus: "approved_for_grooming",
          decisionSummary: "Ready for grooming.",
          decisionRationale: "Dependencies are resolved.",
          pendingDecisions: ["Confirm rollout owner"],
          nextActions: ["Schedule grooming"],
          reviewedBy: "Director",
          source: "director_review"
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        review: {
          id: expect.stringMatching(/^review-/),
          featureRequestId: "fr-123",
          reviewStatus: "approved_for_grooming",
          decisionSummary: "Ready for grooming.",
          decisionRationale: "Dependencies are resolved.",
          pendingDecisions: ["Confirm rollout owner"],
          nextActions: ["Schedule grooming"],
          reviewedBy: "Director",
          source: "director_review",
          createdAt: "2026-03-11T10:00:00.000Z",
          updatedAt: "2026-03-11T10:00:00.000Z",
          lastReviewedAt: "2026-03-11T10:00:00.000Z"
        },
        created: true
      }
    });
  });

  it("updates the existing review in place instead of creating a duplicate", async () => {
    const createResponse = await POST(
      new Request("http://localhost/api/control-tower/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureRequestId: "fr-123",
          reviewStatus: "needs_follow_up",
          decisionSummary: "Need rollout details.",
          decisionRationale: "Ownership is unclear.",
          pendingDecisions: ["Who owns launch?"],
          nextActions: ["Ask implementation"],
          reviewedBy: "Director",
          source: "director_review"
        })
      })
    );

    const createdBody = await createResponse.json();

    vi.setSystemTime(new Date("2026-03-12T08:30:00.000Z"));

    const updateResponse = await POST(
      new Request("http://localhost/api/control-tower/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureRequestId: "fr-123",
          reviewStatus: "approved_for_grooming",
          decisionSummary: "Ready after rollout details landed.",
          decisionRationale: "Launch ownership is now confirmed.",
          pendingDecisions: [],
          nextActions: ["Move into estimation"],
          reviewedBy: "Director",
          source: "director_review"
        })
      })
    );

    expect(updateResponse.status).toBe(200);
    await expect(updateResponse.json()).resolves.toMatchObject({
      ok: true,
      data: {
        review: {
          id: createdBody.data.review.id,
          featureRequestId: "fr-123",
          reviewStatus: "approved_for_grooming",
          decisionSummary: "Ready after rollout details landed.",
          decisionRationale: "Launch ownership is now confirmed.",
          pendingDecisions: [],
          nextActions: ["Move into estimation"],
          createdAt: "2026-03-11T10:00:00.000Z",
          updatedAt: "2026-03-12T08:30:00.000Z",
          lastReviewedAt: "2026-03-12T08:30:00.000Z"
        },
        created: false
      }
    });
  });

  it("returns a stable validation failure code when required fields are missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/control-tower/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureRequestId: "fr-123",
          reviewStatus: "approved_for_grooming"
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "control_tower_review_invalid_request",
        message: "Missing required review fields.",
        details: {
          missingFields: [
            "decisionSummary",
            "decisionRationale",
            "pendingDecisions",
            "nextActions",
            "reviewedBy",
            "source"
          ]
        }
      }
    });
  });

  it("returns a stable missing-target code when the feature request cannot be assembled", async () => {
    const response = await POST(
      new Request("http://localhost/api/control-tower/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureRequestId: "fr-missing",
          reviewStatus: "approved_for_grooming",
          decisionSummary: "Ready for grooming.",
          decisionRationale: "Dependencies are resolved.",
          pendingDecisions: [],
          nextActions: ["Schedule grooming"],
          reviewedBy: "Director",
          source: "director_review"
        })
      })
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "control_tower_review_feature_request_not_found",
        message: "Feature request not found: fr-missing",
        details: {
          featureRequestId: "fr-missing",
          diagnostics: []
        }
      }
    });
  });
});
