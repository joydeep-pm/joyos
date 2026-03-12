import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";

vi.mock("@/lib/control-tower/cache", () => ({
  getCachedFeatureRequests: vi.fn()
}));

vi.mock("@/lib/control-tower/reviews", () => ({
  readReviewStore: vi.fn()
}));

const { POST } = await import("@/app/api/control-tower/people/drafts/route");
const { getCachedFeatureRequests } = await import("@/lib/control-tower/cache");
const { readReviewStore } = await import("@/lib/control-tower/reviews");

describe("POST /api/control-tower/people/drafts", () => {
  const testCacheDir = path.join(process.cwd(), ".cache-test", "people-draft-route");

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-12T11:00:00.000Z"));
    process.env.ASSISTANT_CACHE_DIR = testCacheDir;
    await fs.rm(testCacheDir, { recursive: true, force: true });

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
      reviews: []
    });
  });

  it("generates a server-backed 1:1 prep artifact from assembled PM state", async () => {
    await fs.mkdir(path.join(testCacheDir, "control-tower"), { recursive: true });
    await fs.writeFile(
      path.join(testCacheDir, "control-tower", "people-records.json"),
      JSON.stringify({
        version: 1,
        lastUpdated: "2026-03-12T10:30:00.000Z",
        records: [
          {
            id: "pm-record-123",
            pmName: "Alice",
            lastOneOnOneDate: "2026-03-05",
            nextOneOnOneDate: "2026-03-28",
            coachingFocus: ["Escalate blockers sooner"],
            privateNotes: "Track implementation follow-through.",
            lastUpdatedBy: "Joydeep",
            createdAt: "2026-03-12T10:00:00.000Z",
            updatedAt: "2026-03-12T10:30:00.000Z"
          }
        ]
      }, null, 2),
      "utf8"
    );

    const response = await POST(
      new Request("http://localhost/api/control-tower/people/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pmName: "Alice",
          draftType: "one_on_one_prep"
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        artifact: {
          type: "status_update",
          title: "1:1 Prep - Alice",
          content: expect.stringContaining("Track implementation follow-through."),
          metadata: {
            pmOwner: "Alice"
          }
        }
      }
    });
  });

  it("returns a stable missing-target code when the PM cannot be assembled", async () => {
    const response = await POST(
      new Request("http://localhost/api/control-tower/people/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pmName: "Missing PM",
          draftType: "idp_feedback"
        })
      })
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "control_tower_people_draft_pm_not_found",
        message: "PM not found in assembled people workspace: Missing PM"
      }
    });
  });
});
