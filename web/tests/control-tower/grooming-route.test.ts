import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/control-tower/cache", () => ({
  getCachedFeatureRequests: vi.fn()
}));

const { GET } = await import("@/app/api/control-tower/grooming/route");
const { getCachedFeatureRequests } = await import("@/lib/control-tower/cache");

describe("GET /api/control-tower/grooming", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds the grooming summary from cached feature requests", async () => {
    vi.mocked(getCachedFeatureRequests).mockResolvedValue([
      {
        id: "fr-ready",
        title: "Ready request",
        source: "pm_ask",
        stage: "prioritized",
        client: "Axis Bank",
        productCharter: "Compliance & KYC",
        pmOwner: "Bob",
        jiraIssues: [
          {
            key: "KYC-890",
            status: "Ready",
            statusCategory: "To Do",
            lastUpdated: "2026-03-20T09:00:00.000Z"
          }
        ],
        confluencePages: [
          {
            id: "conf-1",
            title: "Ready PRD",
            url: "https://example.com/prd",
            lastModified: "2026-03-21T09:00:00.000Z"
          }
        ],
        localNotes: [],
        riskSummary: {
          severity: "low",
          factors: []
        },
        blockerSummary: {
          hasBlockers: false,
          blockerCount: 0,
          blockers: []
        },
        latestUpdate: {
          date: "2026-03-21T09:00:00.000Z",
          source: "confluence",
          summary: "PRD updated"
        },
        createdAt: "2026-03-10T09:00:00.000Z",
        updatedAt: "2026-03-21T09:00:00.000Z",
        lastSyncedAt: "2026-03-21T09:00:00.000Z"
      }
    ] as never);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      totalFeatureRequests: 1,
      readyCount: 1,
      blockedCount: 0,
      readiness: {
        ready: [
          expect.objectContaining({
            id: "fr-ready",
            title: "Ready request"
          })
        ],
        evaluations: [
          expect.objectContaining({
            featureRequest: expect.objectContaining({
              id: "fr-ready"
            }),
            readiness: expect.objectContaining({
              verdict: "ready"
            })
          })
        ]
      }
    });
  });
});
