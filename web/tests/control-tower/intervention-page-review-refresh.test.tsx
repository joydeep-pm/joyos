import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import InterventionPage from "@/app/intervention/page";

vi.mock("@/components/intervention/PmOwnerGroup", () => ({
  PmOwnerGroup: ({ group, onOpenDetail }: { group: typeof initialBrief.pmGroups[number]; onOpenDetail?: (id: string) => void }) => (
    <div>
      {group.featureRequests.map((featureRequest) => (
        <button key={featureRequest.id} onClick={() => onOpenDetail?.(featureRequest.id)}>
          {featureRequest.title}
        </button>
      ))}
    </div>
  )
}));

vi.mock("@/components/intervention/FeatureRequestDetail", async () => {
  const actual = await vi.importActual<typeof import("@/components/intervention/FeatureRequestDetail")>(
    "@/components/intervention/FeatureRequestDetail"
  );

  return actual;
});

const initialBrief = {
  date: "2026-03-11",
  summary: "1 feature request requires intervention.",
  totalFeatureRequests: 1,
  totalRequiringIntervention: 1,
  pmGroups: [
    {
      pmOwner: "Alice",
      totalFeatureRequests: 1,
      totalRequiringIntervention: 1,
      averageRiskSeverity: "medium",
      featureRequests: [
        {
          id: "fr-123",
          title: "Repayment workflow",
          source: "pm_ask",
          client: "Test Bank",
          productCharter: "Lending",
          pmOwner: "Alice",
          stage: "director_review",
          jiraIssues: [],
          confluencePages: [],
          localNotes: [],
          riskSummary: { severity: "medium", factors: ["Missing decision"] },
          blockerSummary: { hasBlockers: false, blockerCount: 0, blockers: [] },
          latestUpdate: { date: "2026-03-10T12:00:00.000Z", source: "jira", summary: "Waiting for review" },
          recommendedNextStep: "Capture director decision",
          createdAt: "2026-03-01T12:00:00.000Z",
          updatedAt: "2026-03-10T12:00:00.000Z",
          lastSyncedAt: "2026-03-10T12:00:00.000Z",
          requiresIntervention: true,
          interventionReasons: [
            {
              code: "director_review_pending",
              label: "Director review pending",
              severity: "medium",
              description: "Waiting on director review"
            }
          ],
          interventionPriority: 22,
          review: { present: false, record: null }
        }
      ]
    }
  ]
};

const refreshedBrief = {
  ...initialBrief,
  pmGroups: [
    {
      ...initialBrief.pmGroups[0],
      featureRequests: [
        {
          ...initialBrief.pmGroups[0].featureRequests[0],
          updatedAt: "2026-03-11T09:30:00.000Z",
          review: {
            present: true,
            record: {
              id: "review-123",
              featureRequestId: "fr-123",
              reviewStatus: "approved_for_grooming",
              decisionSummary: "Ready for refinement",
              decisionRationale: "Dependencies are confirmed.",
              pendingDecisions: ["Confirm rollout window"],
              nextActions: ["Move to grooming"],
              reviewedBy: "Joy Director",
              source: "director_review",
              createdAt: "2026-03-11T09:25:00.000Z",
              updatedAt: "2026-03-11T09:30:00.000Z",
              lastReviewedAt: "2026-03-11T09:30:00.000Z"
            }
          }
        }
      ]
    }
  ]
};

describe("intervention page review refresh", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("refreshes the selected detail view after saving a review", async () => {
    let interventionFetchCount = 0;

    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (url === "/api/control-tower/real-status") {
        return {
          ok: true,
          json: async () => ({ success: true, statuses: {} })
        };
      }

      if (url === "/api/control-tower/reviews" && method === "POST") {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            data: {
              created: true,
              review: refreshedBrief.pmGroups[0].featureRequests[0].review.record
            }
          })
        };
      }

      if (url === "/api/control-tower/intervention") {
        interventionFetchCount += 1;
        return {
          ok: true,
          json: async () => ({
            success: true,
            brief: interventionFetchCount === 1 ? initialBrief : refreshedBrief
          })
        };
      }

      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    });

    render(<InterventionPage />);

    expect(await screen.findByText("Intervention Brief")).toBeTruthy();
    fireEvent.click(await screen.findByText("Repayment workflow"));

    expect(await screen.findByText("Awaiting review")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Review status"), {
      target: { value: "approved_for_grooming" }
    });
    fireEvent.change(screen.getByLabelText("Decision summary"), {
      target: { value: "Ready for refinement" }
    });
    fireEvent.change(screen.getByLabelText("Decision rationale"), {
      target: { value: "Dependencies are confirmed." }
    });
    fireEvent.change(screen.getByLabelText("Pending decisions"), {
      target: { value: "Confirm rollout window" }
    });
    fireEvent.change(screen.getByLabelText("Next actions"), {
      target: { value: "Move to grooming" }
    });
    fireEvent.change(screen.getByLabelText("Reviewed by"), {
      target: { value: "Joy Director" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Save review" }));

    expect(await screen.findByText("Review saved and refreshed from the latest intervention data.")).toBeTruthy();
    expect((await screen.findAllByText("Approved for grooming")).length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue("Ready for refinement")).toBeTruthy();
    expect(await screen.findByText("Joy Director")).toBeTruthy();

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(([url]) => url === "/api/control-tower/intervention")
      ).toHaveLength(2);
    });
  });

  it("keeps the intervention brief visible when sync fails due to missing configuration", async () => {
    // Regression: ISSUE-001 — sync failure replaced the full intervention view with a fatal error state
    // Found by /qa on 2026-03-23
    // Report: .gstack/qa-reports/qa-report-localhost-3005-2026-03-23.md
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (url === "/api/control-tower/real-status") {
        return {
          ok: true,
          json: async () => ({ success: true, statuses: {} })
        };
      }

      if (url === "/api/control-tower/intervention") {
        return {
          ok: true,
          json: async () => ({
            success: true,
            brief: initialBrief
          })
        };
      }

      if (url === "/api/control-tower/feature-requests/sync" && method === "POST") {
        return {
          ok: true,
          json: async () => ({
            success: false,
            configurationRequired: true,
            error: "Neither Jira nor Confluence is configured. Please set environment variables."
          })
        };
      }

      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    });

    render(<InterventionPage />);

    expect(await screen.findByText("Intervention Brief")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Sync LEN" }));

    expect(await screen.findByText("Sync unavailable")).toBeTruthy();
    expect(
      await screen.findByText("Neither Jira nor Confluence is configured. Please set environment variables.")
    ).toBeTruthy();

    expect(screen.getByText("Signal summary")).toBeTruthy();
    expect(screen.getByText("Where intervention matters now.")).toBeTruthy();
    expect(screen.queryByText(/^Error$/)).toBeNull();
  });
});
