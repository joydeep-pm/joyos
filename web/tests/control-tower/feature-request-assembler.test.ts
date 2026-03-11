import { describe, expect, it } from "vitest";

import { assembleFeatureRequests } from "@/lib/control-tower/feature-request-assembler";
import type { FeatureRequest, FeatureRequestReviewRecord } from "@/lib/control-tower";

describe("feature request assembler", () => {
  const baseFeatureRequest: FeatureRequest = {
    id: "fr-123",
    title: "Payment reversal dashboard",
    source: "client_escalation",
    stage: "director_review",
    client: "Acme Bank",
    productCharter: "Payments",
    pmOwner: "Alice",
    jiraIssues: [
      {
        key: "PAY-123",
        status: "In Progress",
        statusCategory: "In Progress",
        assignee: "bob@example.com",
        lastUpdated: "2026-03-10T09:00:00.000Z"
      }
    ],
    confluencePages: [
      {
        id: "page-1",
        title: "PRD",
        url: "https://example.com/prd",
        lastModified: "2026-03-09T09:00:00.000Z"
      }
    ],
    localNotes: [{ path: "notes/fr-123.md", summary: "Director wants launch plan." }],
    riskSummary: {
      severity: "high",
      factors: ["Client escalation"]
    },
    blockerSummary: {
      hasBlockers: false,
      blockerCount: 0,
      blockers: []
    },
    latestUpdate: {
      date: "2026-03-10T09:00:00.000Z",
      source: "jira",
      summary: "Waiting for review"
    },
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-10T09:00:00.000Z",
    lastSyncedAt: "2026-03-11T09:00:00.000Z"
  };

  const baseReview: FeatureRequestReviewRecord = {
    id: "review-123",
    featureRequestId: "fr-123",
    reviewStatus: "needs_follow_up",
    decisionSummary: "Needs rollout details before grooming.",
    decisionRationale: "Engineering is ready, but launch ownership is unclear.",
    pendingDecisions: ["Confirm rollout owner"],
    nextActions: ["Get launch checklist from implementation"],
    reviewedBy: "Director",
    source: "director_review",
    createdAt: "2026-03-11T08:00:00.000Z",
    updatedAt: "2026-03-11T08:15:00.000Z",
    lastReviewedAt: "2026-03-11T08:15:00.000Z"
  };

  it("returns enriched feature requests with readiness and persisted review metadata attached", () => {
    const result = assembleFeatureRequests({
      featureRequests: [baseFeatureRequest],
      reviewRecords: [baseReview]
    });

    expect(result.featureRequests).toHaveLength(1);
    expect(result.featureRequests[0]).toMatchObject({
      id: "fr-123",
      readiness: {
        verdict: "ready",
        recommendedNextStep: expect.any(String)
      },
      review: {
        present: true,
        record: {
          reviewStatus: "needs_follow_up",
          decisionSummary: "Needs rollout details before grooming.",
          pendingDecisions: ["Confirm rollout owner"],
          nextActions: ["Get launch checklist from implementation"],
          lastReviewedAt: "2026-03-11T08:15:00.000Z",
          updatedAt: "2026-03-11T08:15:00.000Z"
        }
      },
      interventionReasons: expect.any(Array),
      requiresIntervention: true,
      interventionPriority: expect.any(Number)
    });
  });

  it("marks review as absent when no persisted review exists", () => {
    const result = assembleFeatureRequests({
      featureRequests: [baseFeatureRequest],
      reviewRecords: []
    });

    expect(result.featureRequests[0].review).toEqual({
      present: false,
      record: null
    });
  });

  it("returns structured review diagnostics when a persisted review targets a missing feature request", () => {
    const result = assembleFeatureRequests({
      featureRequests: [baseFeatureRequest],
      reviewRecords: [
        baseReview,
        {
          ...baseReview,
          id: "review-missing",
          featureRequestId: "fr-missing"
        }
      ]
    });

    expect(result.diagnostics).toEqual([
      {
        code: "review_feature_request_missing",
        severity: "error",
        featureRequestId: "fr-missing",
        reviewId: "review-missing",
        message: "Persisted review record references missing feature request fr-missing"
      }
    ]);
  });
});
