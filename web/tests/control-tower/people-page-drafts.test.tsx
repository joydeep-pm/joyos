import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import PeoplePage from "@/app/people/page";

vi.mock("@/components/artifacts/ArtifactViewer", () => ({
  ArtifactViewer: ({ artifact }: { artifact: { title: string; content: string } }) => (
    <div>
      <div>{artifact.title}</div>
      <div>{artifact.content}</div>
    </div>
  )
}));

const peoplePayload = {
  success: true,
  summary: {
    generatedAt: "2026-03-12T09:00:00.000Z",
    totalPMs: 1,
    totalNeedingAttention: 1,
    message: "1 PM portfolio needs attention."
  },
  pmPortfolios: [
    {
      pmName: "Alice",
      featureRequestCount: 1,
      attention: {
        level: "high",
        reasons: ["1 feature request requires intervention", "1:1 history missing"]
      },
      peopleRecord: {
        present: true,
        record: {
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
      },
      oneOnOne: {
        overdue: false,
        daysSinceLastOneOnOne: 7,
        status: "up_to_date"
      },
      evidenceSummary: {
        totalEvidence: 1,
        positiveCount: 0,
        developmentalCount: 1
      },
      portfolio: [
        {
          id: "fr-123",
          title: "Settlement monitoring dashboard",
          stage: "pm_exploration",
          latestUpdate: {
            summary: "Waiting on backend response"
          },
          interventionReasons: [
            {
              type: "engineering_stale",
              message: "Waiting on engineering for 12 days"
            }
          ],
          review: {
            present: false,
            record: null
          },
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
          readiness: {
            verdict: "blocked"
          }
        }
      ]
    }
  ],
  diagnostics: []
};

describe("people page draft workflow", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("generates a server-backed draft and opens it in the artifact viewer", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => peoplePayload
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            artifact: {
              id: "artifact-123",
              type: "idp_feedback",
              title: "IDP Feedback - Alice",
              content: "Server-authored IDP draft with Track implementation follow-through.",
              status: "draft",
              createdAt: "2026-03-12T11:00:00.000Z",
              updatedAt: "2026-03-12T11:00:00.000Z",
              metadata: {
                featureRequestId: "pm-alice",
                featureRequestTitle: "PM portfolio for Alice",
                generatedAt: "2026-03-12T11:00:00.000Z",
                generatedBy: "Product Control Tower",
                pmOwner: "Alice"
              }
            }
          }
        })
      });

    render(<PeoplePage />);

    expect(await screen.findByText("PM coaching, 1:1 readiness, and portfolio evidence")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Draft IDP" }));

    expect(await screen.findByText("IDP Feedback - Alice")).toBeTruthy();
    expect(await screen.findByText("Server-authored IDP draft with Track implementation follow-through.")).toBeTruthy();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/control-tower/people/drafts",
        expect.objectContaining({
          method: "POST"
        })
      );
    });
  });
});
