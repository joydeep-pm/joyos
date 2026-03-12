import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/control-tower/cache", () => ({
  getCachedFeatureRequests: vi.fn()
}));

vi.mock("@/lib/control-tower/reviews", () => ({
  readReviewStore: vi.fn()
}));

vi.mock("@/lib/control-tower/people-store", () => ({
  readPeopleStore: vi.fn()
}));

const { GET } = await import("@/app/api/control-tower/people/route");
const { getCachedFeatureRequests } = await import("@/lib/control-tower/cache");
const { readReviewStore } = await import("@/lib/control-tower/reviews");
const { readPeopleStore } = await import("@/lib/control-tower/people-store");

describe("GET /api/control-tower/people", () => {
  beforeEach(() => {
    vi.mocked(getCachedFeatureRequests).mockResolvedValue([
      {
        id: "fr-123",
        title: "Settlement monitoring dashboard",
        source: "client_escalation",
        stage: "pm_exploration",
        client: "Acme Bank",
        productCharter: "Payments",
        pmOwner: "Alice",
        jiraIssues: [],
        confluencePages: [],
        localNotes: [],
        riskSummary: { severity: "high", factors: ["Client escalation"] },
        blockerSummary: {
          hasBlockers: true,
          blockerCount: 1,
          blockers: [
            {
              type: "engineering",
              description: "Waiting on API",
              daysOpen: 12
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
      }
    ]);

    vi.mocked(readReviewStore).mockResolvedValue({
      version: 1,
      lastUpdated: "2026-03-10T08:15:00.000Z",
      reviews: [
        {
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
        }
      ]
    });

    vi.mocked(readPeopleStore).mockResolvedValue(null);
  });

  it("returns PM portfolios and diagnostics from live assembled data", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      summary: {
        totalPMs: 1,
        totalNeedingAttention: 1,
        generatedAt: expect.any(String)
      },
      pmPortfolios: [
        expect.objectContaining({
          pmName: "Alice",
          featureRequestCount: 1,
          attention: expect.objectContaining({
            level: "high"
          }),
          oneOnOne: expect.objectContaining({
            overdue: true,
            status: "missing_history"
          })
        })
      ],
      diagnostics: expect.arrayContaining([
        expect.objectContaining({
          code: "pm_one_on_one_history_missing",
          pmName: "Alice"
        })
      ])
    });
  });

  it("returns an empty success payload when no feature requests are cached", async () => {
    vi.mocked(getCachedFeatureRequests).mockResolvedValue([]);
    vi.mocked(readReviewStore).mockResolvedValue(null);
    vi.mocked(readPeopleStore).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      summary: {
        totalPMs: 0,
        totalNeedingAttention: 0,
        message: "No PM portfolio data available. Run sync to populate feature requests first."
      },
      pmPortfolios: [],
      diagnostics: []
    });
  });
});
