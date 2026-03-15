import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
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
    getCollateralReminders: vi.fn(),
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

describe("AssistantPage alignment", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.getAssistantContext).mockResolvedValue({
      ok: true,
      data: {
        generatedAt: "2026-03-12T08:00:00.000Z",
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

    vi.mocked(api.getAssistantBrief).mockResolvedValue({
      ok: true,
      data: {
        topOutcomes: [
          {
            id: "o1",
            taskId: "task-1",
            title: "Prepare leadership update",
            priority: "P0",
            score: 98,
            whyNow: "Leadership review is approaching.",
            goalReference: "Documentation"
          }
        ],
        middayCheckpoint: "Check whether the leadership draft is still on track.",
        eveningClosurePrompt: "What moved and what is still drifting?"
      }
    } as never);

    vi.mocked(api.getAssistantQueue).mockResolvedValue({ ok: true, data: [] } as never);
    vi.mocked(api.getCommsHistory).mockResolvedValue({ ok: true, data: { drafts: [] } } as never);
    vi.mocked(api.getAssistantReview).mockResolvedValue({
      ok: true,
      data: {
        scorecard: {
          committedCount: 3,
          completedCount: 1,
          rolloverCount: 1,
          closureRate: 0.33
        }
      }
    } as never);
    vi.mocked(api.getAssistantAlerts).mockResolvedValue({ ok: true, data: [] } as never);
    vi.mocked(api.getCollateralReminders).mockResolvedValue({ ok: true, data: [] } as never);
    vi.mocked(api.getOutcomeClosureKpi).mockResolvedValue({
      ok: true,
      data: { target: 0.7, metTarget: false }
    } as never);
    vi.mocked(api.getApprovalEnvelopes).mockResolvedValue({ ok: true, data: [] } as never);
  });

  it("renders intervention-first assistant headings", async () => {
    render(<AssistantPage />);

    await waitFor(() => {
      expect(screen.getByText("Director intervention workspace")).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: /Daily intervention brief and action queue/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Today's intervention candidates/i })).toBeInTheDocument();
    expect(screen.getByText(/Midday intervention check/i)).toBeInTheDocument();
    expect(screen.getByText("Weekly operating signal")).toBeInTheDocument();
    expect(screen.getByText("Intervention alerts")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Committed action queue/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Risk and drift requiring attention/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Meeting continuity review/i })).toBeInTheDocument();
  });
});
