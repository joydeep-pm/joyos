import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    resolveCollateralReminder: vi.fn(),
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

function seedBaseMocks() {
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
      topOutcomes: [],
      middayCheckpoint: "Check progress.",
      eveningClosurePrompt: "Close the loop."
    }
  } as never);

  vi.mocked(api.getAssistantQueue).mockResolvedValue({ ok: true, data: [] } as never);
  vi.mocked(api.getCommsHistory).mockResolvedValue({ ok: true, data: { drafts: [] } } as never);
  vi.mocked(api.getAssistantReview).mockResolvedValue({
    ok: true,
    data: {
      scorecard: {
        committedCount: 0,
        completedCount: 0,
        rolloverCount: 0,
        closureRate: 0
      }
    }
  } as never);
  vi.mocked(api.getAssistantAlerts).mockResolvedValue({ ok: true, data: [] } as never);
  vi.mocked(api.resolveCollateralReminder).mockResolvedValue({ ok: true, data: undefined } as never);
  vi.mocked(api.getOutcomeClosureKpi).mockResolvedValue({ ok: true, data: { target: 0.7, metTarget: true } } as never);
  vi.mocked(api.getApprovalEnvelopes).mockResolvedValue({ ok: true, data: [] } as never);
}

describe("AssistantPage collateral reminders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedBaseMocks();
  });

  it("renders visible quarterly collateral reminders with asset and timing context", async () => {
    vi.mocked(api.getCollateralReminders).mockResolvedValue({
      ok: true,
      data: [
        {
          id: "product_deck:gold-loan:2026-01-15",
          assetType: "product_deck",
          vertical: "Gold Loan",
          cadenceMonths: 3,
          quarterLabel: "2026 Q1",
          dueDate: "2026-01-15",
          status: "overdue",
          severity: "high",
          lastRefreshedAt: "2025-10-15",
          daysUntilDue: -60
        }
      ]
    } as never);

    render(<AssistantPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Quarterly collateral reminders/i })).toBeInTheDocument();
    });

    expect(screen.getByText("Product Deck")).toBeInTheDocument();
    expect(screen.getByText("Gold Loan")).toBeInTheDocument();
    expect(screen.getByText("2026 Q1")).toBeInTheDocument();
    expect(screen.getByText(/60 days overdue/i)).toBeInTheDocument();
    expect(screen.getByText(/Refresh by 2026-01-15 · Last refreshed 2025-10-15/i)).toBeInTheDocument();
  });

  it("renders an explicit empty state when no collateral reminders are due", async () => {
    vi.mocked(api.getCollateralReminders).mockResolvedValue({ ok: true, data: [] } as never);

    render(<AssistantPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Quarterly collateral reminders/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/No Product Deck or Product Factsheet refresh is currently due./i)).toBeInTheDocument();
  });

  it("resolves a visible collateral reminder and reloads the list", async () => {
    vi.mocked(api.getCollateralReminders)
      .mockResolvedValueOnce({
        ok: true,
        data: [
          {
            id: "product_deck:gold-loan:2026-01-15",
            assetType: "product_deck",
            vertical: "Gold Loan",
            cadenceMonths: 3,
            quarterLabel: "2026 Q1",
            dueDate: "2026-01-15",
            status: "overdue",
            severity: "high",
            lastRefreshedAt: "2025-10-15",
            daysUntilDue: -60
          }
        ]
      } as never)
      .mockResolvedValueOnce({ ok: true, data: [] } as never);

    vi.mocked(api.resolveCollateralReminder).mockResolvedValue({
      ok: true,
      data: {
        id: "product_deck:gold-loan:2026-01-15",
        assetType: "product_deck",
        vertical: "Gold Loan",
        cadenceMonths: 3,
        quarterLabel: "2026 Q1",
        dueDate: "2026-01-15",
        status: "resolved",
        severity: "low",
        lastRefreshedAt: "2025-10-15",
        daysUntilDue: -60,
        resolvedAt: "2026-03-15T11:00:00.000Z"
      }
    } as never);

    const user = userEvent.setup();
    render(<AssistantPage />);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /Mark resolved/i }).length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByRole("button", { name: /Mark resolved/i })[0]);

    await waitFor(() => {
      expect(api.resolveCollateralReminder).toHaveBeenCalledWith("product_deck:gold-loan:2026-01-15");
    });

    await waitFor(() => {
      expect(screen.getAllByText(/No Product Deck or Product Factsheet refresh is currently due./i).length).toBeGreaterThan(0);
    });
  });
});
