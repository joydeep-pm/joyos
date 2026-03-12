import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import PeoplePage from "@/app/people/page";

vi.mock("@/components/artifacts/ArtifactViewer", () => ({
  ArtifactViewer: ({ artifact }: { artifact: { title: string } }) => <div>{artifact.title}</div>
}));

const initialPayload = {
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
        present: false,
        record: null
      },
      oneOnOne: {
        overdue: true,
        daysSinceLastOneOnOne: null,
        status: "missing_history"
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
  diagnostics: [
    {
      code: "pm_one_on_one_history_missing",
      severity: "warn",
      pmName: "Alice",
      message: "No persisted 1:1 history exists yet for Alice."
    }
  ]
};

const refreshedPayload = {
  ...initialPayload,
  pmPortfolios: [
    {
      ...initialPayload.pmPortfolios[0],
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
          createdAt: "2026-03-12T09:00:00.000Z",
          updatedAt: "2026-03-12T09:00:00.000Z"
        }
      },
      oneOnOne: {
        overdue: false,
        daysSinceLastOneOnOne: 7,
        status: "up_to_date"
      }
    }
  ],
  diagnostics: []
};

describe("people page notes workflow", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("saves PM notes and refreshes the workspace from the assembled people read path", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialPayload
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            created: true,
            record: refreshedPayload.pmPortfolios[0].peopleRecord.record
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => refreshedPayload
      });

    render(<PeoplePage />);

    expect(await screen.findByText("PM coaching, 1:1 readiness, and portfolio evidence")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Last 1:1 date for Alice"), {
      target: { value: "2026-03-05" }
    });
    fireEvent.change(screen.getByLabelText("Next 1:1 date for Alice"), {
      target: { value: "2026-03-28" }
    });
    fireEvent.change(screen.getByLabelText("Coaching focus for Alice"), {
      target: { value: "Escalate blockers sooner" }
    });
    fireEvent.change(screen.getByLabelText("Private notes for Alice"), {
      target: { value: "Track implementation follow-through." }
    });
    fireEvent.change(screen.getByLabelText("Updated by for Alice"), {
      target: { value: "Joydeep" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Save notes for Alice" }));

    expect(await screen.findByText("Saved notes and refreshed the latest PM workspace state.")).toBeTruthy();
    expect(await screen.findByDisplayValue("Track implementation follow-through.")).toBeTruthy();
    expect(await screen.findByText("1:1 timing is being tracked from persisted history.")).toBeTruthy();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/control-tower/people", { cache: "no-store" });
    });
  });
});
