import { describe, expect, it } from "vitest";

import { assemblePmPortfolios } from "@/lib/control-tower/people-assembler";
import type { FeatureRequest, FeatureRequestReviewRecord } from "@/lib/control-tower";

describe("people assembler", () => {
  const baseFeatureRequest: FeatureRequest = {
    id: "fr-123",
    title: "Settlement monitoring dashboard",
    source: "client_escalation",
    stage: "pm_exploration",
    client: "Acme Bank",
    productCharter: "Payments",
    pmOwner: "Alice",
    jiraIssues: [],
    confluencePages: [
      {
        id: "page-1",
        title: "Monitoring PRD",
        url: "https://example.com/prd",
        lastModified: "2026-03-09T09:00:00.000Z"
      }
    ],
    localNotes: [{ path: "notes/fr-123.md", summary: "Client wants closer tracking." }],
    riskSummary: {
      severity: "high",
      factors: ["Client escalation"]
    },
    blockerSummary: {
      hasBlockers: true,
      blockerCount: 1,
      blockers: [
        {
          type: "engineering",
          description: "Backend contract unresolved",
          daysOpen: 11
        }
      ]
    },
    latestUpdate: {
      date: "2026-03-08T09:00:00.000Z",
      source: "jira",
      summary: "Waiting on backend response"
    },
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-08T09:00:00.000Z",
    lastSyncedAt: "2026-03-11T09:00:00.000Z"
  };

  const baseReview: FeatureRequestReviewRecord = {
    id: "review-123",
    featureRequestId: "fr-123",
    reviewStatus: "needs_follow_up",
    decisionSummary: "Needs dependency confirmation.",
    decisionRationale: "Engineering owner has not confirmed delivery.",
    pendingDecisions: ["Confirm backend owner"],
    nextActions: ["Raise in sync"],
    reviewedBy: "Director",
    source: "director_review",
    createdAt: "2026-03-10T08:00:00.000Z",
    updatedAt: "2026-03-10T08:15:00.000Z",
    lastReviewedAt: "2026-03-10T08:15:00.000Z"
  };

  it("groups assembled feature requests by PM and returns attention summaries with diagnostics", () => {
    const result = assemblePmPortfolios({
      featureRequests: [
        baseFeatureRequest,
        {
          ...baseFeatureRequest,
          id: "fr-124",
          title: "Ledger export improvements",
          stage: "prod_deploy",
          riskSummary: { severity: "low", factors: [] },
          blockerSummary: { hasBlockers: false, blockerCount: 0, blockers: [] },
          latestUpdate: {
            date: "2026-03-10T09:00:00.000Z",
            source: "jira",
            summary: "Delivered"
          },
          updatedAt: "2026-03-10T09:00:00.000Z"
        }
      ],
      reviewRecords: [baseReview]
    });

    expect(result.pmPortfolios).toHaveLength(1);
    expect(result.pmPortfolios[0]).toMatchObject({
      pmName: "Alice",
      featureRequestCount: 2,
      attention: {
        level: "high",
        reasons: expect.arrayContaining([
          expect.stringContaining("intervention"),
          expect.stringContaining("1:1")
        ])
      },
      peopleRecord: {
        present: false,
        record: null
      },
      oneOnOne: {
        overdue: true,
        daysSinceLastOneOnOne: null,
        status: "missing_history"
      },
      evidenceSummary: {
        totalEvidence: expect.any(Number),
        positiveCount: expect.any(Number),
        developmentalCount: expect.any(Number)
      },
      portfolio: expect.arrayContaining([
        expect.objectContaining({
          id: "fr-123",
          review: {
            present: true,
            record: expect.objectContaining({
              reviewStatus: "needs_follow_up"
            })
          }
        })
      ])
    });

    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "pm_one_on_one_history_missing",
          severity: "warn",
          pmName: "Alice"
        })
      ])
    );
  });

  it("returns diagnostics for feature requests that cannot be mapped to a PM", () => {
    const result = assemblePmPortfolios({
      featureRequests: [
        {
          ...baseFeatureRequest,
          id: "fr-no-owner",
          pmOwner: undefined
        }
      ],
      reviewRecords: []
    });

    expect(result.pmPortfolios).toEqual([]);
    expect(result.diagnostics).toEqual([
      {
        code: "pm_owner_missing",
        severity: "warn",
        featureRequestId: "fr-no-owner",
        message: "Feature request fr-no-owner cannot be assigned to a PM portfolio because pmOwner is missing."
      }
    ]);
  });
});
