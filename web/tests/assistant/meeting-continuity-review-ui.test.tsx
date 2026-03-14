import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import AssistantPage from "@/app/assistant/page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>
}));

vi.mock("@/lib/client-api", () => ({
  api: {
    getAssistantContext: vi.fn(),
    getAssistantBrief: vi.fn(),
    getAssistantQueue: vi.fn(),
    getCommsHistory: vi.fn(),
    getAssistantReview: vi.fn(),
    getAssistantAlerts: vi.fn(),
    getOutcomeClosureKpi: vi.fn(),
    getApprovalEnvelopes: vi.fn(),
    commitAssistantPlan: vi.fn(),
    rebuildAssistantContext: vi.fn(),
    updateAssistantQueueStatus: vi.fn(),
    resolveAssistantAlert: vi.fn(),
    createCommsDraft: vi.fn(),
    approveCommsDraft: vi.fn(),
    sendCommsDraft: vi.fn(),
    createApprovalEnvelope: vi.fn(),
    getApprovalEnvelope: vi.fn(),
    transitionApprovalEnvelope: vi.fn()
  }
}));

const { api } = await import("@/lib/client-api");

function seedBaseResponses() {
  vi.mocked(api.getAssistantBrief).mockResolvedValue({
    ok: true,
    data: {
      topOutcomes: [],
      middayCheckpoint: "Check meeting follow-ups midday.",
      eveningClosurePrompt: "Close the open loops you touched today."
    }
  } as never);

  vi.mocked(api.getAssistantQueue).mockResolvedValue({ ok: true, data: [] } as never);
  vi.mocked(api.getCommsHistory).mockResolvedValue({ ok: true, data: { drafts: [], audit: [] } } as never);
  vi.mocked(api.getAssistantReview).mockResolvedValue({
    ok: true,
    data: {
      generatedAt: "2026-03-14T08:00:00.000Z",
      window: { weekId: "2026-W11", startDate: "2026-03-09", endDate: "2026-03-15", timezone: "UTC", weekStart: "monday" },
      outcomes: [],
      scorecard: { committedCount: 0, completedCount: 0, rolloverCount: 0, closureRate: 0 },
      alerts: []
    }
  } as never);
  vi.mocked(api.getAssistantAlerts).mockResolvedValue({ ok: true, data: [] } as never);
  vi.mocked(api.getOutcomeClosureKpi).mockResolvedValue({ ok: true, data: { weekId: "2026-W11", closureRate: 0, target: 0.7, metTarget: false } } as never);
  vi.mocked(api.getApprovalEnvelopes).mockResolvedValue({ ok: true, data: [] } as never);
}

describe("AssistantPage meeting continuity review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedBaseResponses();
  });

  it("renders unresolved meeting commitments with blockers, ambiguity, and routing hints", async () => {
    vi.mocked(api.getAssistantContext).mockResolvedValue({
      ok: true,
      data: {
        generatedAt: "2026-03-14T08:00:00.000Z",
        indexVersion: 1,
        goals: [],
        tasks: [],
        knowledge: [],
        meetingContinuity: [
          {
            id: "meeting-1",
            sourcePath: "Knowledge/Meetings/2026-03-14-bnpl-review.md",
            sourceType: "meeting_note",
            title: "BNPL client escalation review",
            date: "2026-03-14",
            attendees: ["Joydeep", "Aarti"],
            decisions: ["Clarify acceptance criteria before grooming"],
            openCommitments: ["Aarti to draft clearer acceptance criteria by tomorrow"],
            blockers: ["Story clarity is insufficient for grooming"],
            openQuestions: ["Which waiver events must be shown to client-side users?"],
            routingTargets: [{ type: "feature_request", label: "Feature request update", pathHint: "Knowledge/Feature-Requests/..." }],
            linkedArtifacts: [],
            ambiguityFlags: ["open_questions_present"],
            status: "ambiguous"
          }
        ],
        links: [],
        driftAlerts: [],
        stats: {
          activeTasks: 0,
          linkedHighPriorityTasks: 0,
          unlinkedHighPriorityTasks: 0,
          staleBlockedTasks: 0,
          openMeetingCommitments: 1
        }
      }
    } as never);

    render(<AssistantPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Meeting continuity review/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/Open commitments: 1/i)).toBeInTheDocument();
    expect(screen.getByText("BNPL client escalation review")).toBeInTheDocument();
    expect(screen.getByText(/1 blocker still need attention/i)).toBeInTheDocument();
    expect(screen.getByText(/Blocker: Story clarity is insufficient for grooming/i)).toBeInTheDocument();
    expect(screen.getByText(/Ambiguity: Which waiver events must be shown to client-side users/i)).toBeInTheDocument();
    expect(screen.getByText(/Suggested route: Feature request update/i)).toBeInTheDocument();
  });

  it("shows an empty state when no unresolved meeting commitments exist", async () => {
    vi.mocked(api.getAssistantContext).mockResolvedValue({
      ok: true,
      data: {
        generatedAt: "2026-03-14T08:00:00.000Z",
        indexVersion: 1,
        goals: [],
        tasks: [],
        knowledge: [],
        meetingContinuity: [],
        links: [],
        driftAlerts: [],
        stats: {
          activeTasks: 0,
          linkedHighPriorityTasks: 0,
          unlinkedHighPriorityTasks: 0,
          staleBlockedTasks: 0,
          openMeetingCommitments: 0
        }
      }
    } as never);

    render(<AssistantPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Meeting continuity review/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/No unresolved meeting commitments are visible yet/i)).toBeInTheDocument();
  });
});
