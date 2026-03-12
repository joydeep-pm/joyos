import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";

vi.mock("@/lib/control-tower/cache", () => ({
  getCachedFeatureRequests: vi.fn()
}));

vi.mock("@/lib/control-tower/reviews", () => ({
  readReviewStore: vi.fn()
}));

const { POST } = await import("@/app/api/control-tower/people/notes/route");
const { getCachedFeatureRequests } = await import("@/lib/control-tower/cache");
const { readReviewStore } = await import("@/lib/control-tower/reviews");

describe("POST /api/control-tower/people/notes", () => {
  const testCacheDir = path.join(process.cwd(), ".cache-test", "people-mutation-route");

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-12T10:00:00.000Z"));
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
        blockerSummary: { hasBlockers: false, blockerCount: 0, blockers: [] },
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

  it("creates a persisted PM people record for a known PM portfolio", async () => {
    const response = await POST(
      new Request("http://localhost/api/control-tower/people/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pmName: "Alice",
          lastOneOnOneDate: "2026-03-05",
          nextOneOnOneDate: "2026-03-28",
          coachingFocus: ["Escalate blockers sooner"],
          privateNotes: "Track implementation follow-through.",
          lastUpdatedBy: "Joydeep"
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        record: {
          id: expect.stringMatching(/^pm-record-/),
          pmName: "Alice",
          lastOneOnOneDate: "2026-03-05",
          nextOneOnOneDate: "2026-03-28",
          coachingFocus: ["Escalate blockers sooner"],
          privateNotes: "Track implementation follow-through.",
          lastUpdatedBy: "Joydeep",
          createdAt: "2026-03-12T10:00:00.000Z",
          updatedAt: "2026-03-12T10:00:00.000Z"
        },
        created: true
      }
    });
  });

  it("returns a stable validation failure code when required fields are missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/control-tower/people/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pmName: "Alice"
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "control_tower_people_invalid_request",
        message: "Missing required people note fields.",
        details: {
          missingFields: ["coachingFocus", "privateNotes", "lastUpdatedBy"]
        }
      }
    });
  });

  it("returns a stable missing-target code when the PM cannot be assembled", async () => {
    const response = await POST(
      new Request("http://localhost/api/control-tower/people/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pmName: "Missing PM",
          coachingFocus: ["Clarify ownership"],
          privateNotes: "No matching PM.",
          lastUpdatedBy: "Joydeep"
        })
      })
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "control_tower_people_pm_not_found",
        message: "PM not found in assembled people workspace: Missing PM"
      }
    });
  });
});
