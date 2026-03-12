import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import AssistantPage from "@/app/assistant/page";
import type {
  ApprovalEnvelopeRecord,
  AssistantCommsHistory,
  AssistantContext,
  DailyBrief,
  OutcomeClosureKpi,
  WeeklyReview
} from "@/lib/types";

const context: AssistantContext = {
  generatedAt: "2026-03-12T08:00:00.000Z",
  indexVersion: 1,
  goals: [],
  tasks: [],
  knowledge: [],
  links: [],
  driftAlerts: [],
  stats: {
    activeTasks: 0,
    linkedHighPriorityTasks: 0,
    unlinkedHighPriorityTasks: 0,
    staleBlockedTasks: 0
  }
};

const brief: DailyBrief = {
  date: "2026-03-12",
  generatedAt: "2026-03-12T08:00:00.000Z",
  topOutcomes: [],
  predictedRisks: [],
  middayCheckpoint: "Midday check",
  eveningClosurePrompt: "Evening close"
};

const review: WeeklyReview = {
  generatedAt: "2026-03-12T08:00:00.000Z",
  window: {
    weekId: "2026-W11",
    startDate: "2026-03-09",
    endDate: "2026-03-15",
    timezone: "UTC",
    weekStart: "monday"
  },
  outcomes: [],
  scorecard: {
    committedCount: 0,
    completedCount: 0,
    rolloverCount: 0,
    closureRate: 0
  },
  alerts: []
};

const kpi: OutcomeClosureKpi = {
  weekId: "2026-W11",
  closureRate: 0,
  target: 0.7,
  metTarget: false
};

const latestDraft = {
  id: "draft-123",
  type: "stakeholder_update" as const,
  status: "approved" as const,
  destination: "leader@local",
  subject: "Execution update",
  body: "Approved update body",
  requiresApproval: true,
  createdAt: "2026-03-12T08:05:00.000Z",
  approvedAt: "2026-03-12T08:10:00.000Z",
  approvedBy: "joydeep",
  approvalToken: "token-approved-draft",
  sourceDate: "2026-03-12"
};

const comms: AssistantCommsHistory = {
  drafts: [latestDraft],
  audit: []
};

const proposedEnvelope: ApprovalEnvelopeRecord = {
  id: "envelope-123",
  status: "proposed",
  actionType: "comms_send",
  targetType: "comms_draft",
  targetId: latestDraft.id,
  summary: `Send stakeholder update draft ${latestDraft.id}`,
  evidence: ["Draft created from reviewed artifact"],
  proposedBy: "assistant",
  createdAt: "2026-03-12T08:15:00.000Z",
  updatedAt: "2026-03-12T08:15:00.000Z",
  audit: [
    {
      id: "audit-proposed",
      event: "proposed",
      actor: "assistant",
      timestamp: "2026-03-12T08:15:00.000Z",
      details: "Envelope proposed"
    }
  ]
};

const executedEnvelope: ApprovalEnvelopeRecord = {
  ...proposedEnvelope,
  status: "executed",
  approvedAt: "2026-03-12T08:16:00.000Z",
  approvedBy: "joydeep",
  executedAt: "2026-03-12T08:17:00.000Z",
  executedBy: "joydeep",
  updatedAt: "2026-03-12T08:17:00.000Z",
  audit: [
    ...proposedEnvelope.audit,
    {
      id: "audit-approved",
      event: "approved",
      actor: "joydeep",
      timestamp: "2026-03-12T08:16:00.000Z",
      details: "Approved"
    },
    {
      id: "audit-executed",
      event: "executed",
      actor: "joydeep",
      timestamp: "2026-03-12T08:17:00.000Z",
      details: "Executed"
    }
  ]
};

const failedEnvelope: ApprovalEnvelopeRecord = {
  ...proposedEnvelope,
  status: "failed",
  approvedAt: "2026-03-12T08:16:00.000Z",
  approvedBy: "joydeep",
  failedAt: "2026-03-12T08:17:00.000Z",
  failedBy: "joydeep",
  failureCode: "approval_execution_failed",
  failureMessage: "Approval metadata is missing.",
  updatedAt: "2026-03-12T08:17:00.000Z",
  audit: [
    ...proposedEnvelope.audit,
    {
      id: "audit-approved",
      event: "approved",
      actor: "joydeep",
      timestamp: "2026-03-12T08:16:00.000Z",
      details: "Approved"
    },
    {
      id: "audit-failed",
      event: "execution_failed",
      actor: "joydeep",
      timestamp: "2026-03-12T08:17:00.000Z",
      details: "Approval metadata is missing."
    }
  ]
};

const apiMock = vi.hoisted(() => ({
  getAssistantContext: vi.fn(),
  getAssistantBrief: vi.fn(),
  getAssistantQueue: vi.fn(),
  getCommsHistory: vi.fn(),
  getAssistantReview: vi.fn(),
  getAssistantAlerts: vi.fn(),
  getOutcomeClosureKpi: vi.fn(),
  commitAssistantPlan: vi.fn(),
  rebuildAssistantContext: vi.fn(),
  updateAssistantQueueStatus: vi.fn(),
  resolveAssistantAlert: vi.fn(),
  createCommsDraft: vi.fn(),
  approveCommsDraft: vi.fn(),
  sendCommsDraft: vi.fn(),
  getApprovalEnvelopes: vi.fn(),
  createApprovalEnvelope: vi.fn(),
  getApprovalEnvelope: vi.fn(),
  transitionApprovalEnvelope: vi.fn()
}));

vi.mock("@/lib/client-api", () => ({
  api: apiMock
}));

describe("assistant approval workflow UI", () => {
  beforeEach(() => {
    apiMock.getAssistantContext.mockResolvedValue({ ok: true, data: context });
    apiMock.getAssistantBrief.mockResolvedValue({ ok: true, data: brief });
    apiMock.getAssistantQueue.mockResolvedValue({ ok: true, data: [] });
    apiMock.getCommsHistory.mockResolvedValue({ ok: true, data: comms });
    apiMock.getAssistantReview.mockResolvedValue({ ok: true, data: review });
    apiMock.getAssistantAlerts.mockResolvedValue({ ok: true, data: [] });
    apiMock.getOutcomeClosureKpi.mockResolvedValue({ ok: true, data: kpi });
    apiMock.getApprovalEnvelopes.mockResolvedValue({ ok: true, data: [proposedEnvelope] });
    apiMock.createApprovalEnvelope.mockResolvedValue({ ok: true, data: proposedEnvelope });
    apiMock.getApprovalEnvelope.mockResolvedValue({ ok: true, data: executedEnvelope });
    apiMock.transitionApprovalEnvelope
      .mockResolvedValueOnce({ ok: true, data: { ...proposedEnvelope, status: "approved", approvedBy: "joydeep", approvedAt: "2026-03-12T08:16:00.000Z", updatedAt: "2026-03-12T08:16:00.000Z" } })
      .mockResolvedValueOnce({ ok: true, data: executedEnvelope });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders envelope status and drives approve/execute actions from the assistant UI", async () => {
    render(<AssistantPage />);

    expect(await screen.findByText("Approval workflow")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create approval envelope" })).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Create approval envelope" }));

    await waitFor(() => {
      expect(apiMock.createApprovalEnvelope).toHaveBeenCalledWith({
        actionType: "comms_send",
        targetType: "comms_draft",
        targetId: "draft-123",
        summary: "Send stakeholder update draft draft-123",
        evidence: [
          "Draft created from reviewed artifact",
          "Approved by joydeep",
          "Approval token present: yes"
        ],
        proposedBy: "assistant"
      });
    });

    expect(screen.getAllByText("Send stakeholder update draft draft-123").length).toBeGreaterThan(0);
    expect(screen.getAllByText("PROPOSED").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Approve envelope" }));

    await waitFor(() => {
      expect(apiMock.transitionApprovalEnvelope).toHaveBeenCalledWith("envelope-123", {
        action: "approve",
        actor: "user"
      });
    });

    await waitFor(() => {
      expect((screen.getByText("Status:", { selector: "span" }).parentElement?.textContent ?? "").toLowerCase()).toContain("executed");
    });

    expect(apiMock.transitionApprovalEnvelope).toHaveBeenCalledTimes(1);
    expect(apiMock.getApprovalEnvelope).toHaveBeenCalledWith("envelope-123");
    expect((await screen.findAllByText("EXECUTED")).length).toBeGreaterThan(0);
    expect(screen.getByText("Status:", { selector: "span" })).toBeTruthy();
    expect(screen.getByText("executed")).toBeTruthy();
  });

  it("renders failed execution diagnostics from the persisted envelope record", async () => {
    apiMock.getApprovalEnvelope.mockResolvedValue({ ok: true, data: failedEnvelope });
    apiMock.transitionApprovalEnvelope
      .mockReset()
      .mockResolvedValueOnce({ ok: true, data: { ...proposedEnvelope, status: "approved", approvedBy: "joydeep", approvedAt: "2026-03-12T08:16:00.000Z", updatedAt: "2026-03-12T08:16:00.000Z" } })
      .mockResolvedValueOnce({ ok: false, error: { code: "approval_envelope_transition_failed", message: "Envelope execution failed" } });

    render(<AssistantPage />);

    expect(await screen.findByText("Approval workflow")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Create approval envelope" }));
    await waitFor(() => {
      expect(apiMock.createApprovalEnvelope).toHaveBeenCalledWith({
        actionType: "comms_send",
        targetType: "comms_draft",
        targetId: "draft-123",
        summary: "Send stakeholder update draft draft-123",
        evidence: [
          "Draft created from reviewed artifact",
          "Approved by joydeep",
          "Approval token present: yes"
        ],
        proposedBy: "assistant"
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Approve envelope" }));
    await waitFor(() => {
      expect(apiMock.transitionApprovalEnvelope).toHaveBeenCalledWith("envelope-123", {
        action: "approve",
        actor: "user"
      });
    });

    await waitFor(() => {
      expect((screen.getByText("Status:", { selector: "span" }).parentElement?.textContent ?? "").toLowerCase()).toContain("failed");
    });

    expect(apiMock.transitionApprovalEnvelope).toHaveBeenCalledTimes(1);
    expect(apiMock.getApprovalEnvelope).toHaveBeenCalledWith("envelope-123");
    expect((await screen.findAllByText("FAILED")).length).toBeGreaterThan(0);
    expect(screen.getByText("approval_execution_failed")).toBeTruthy();
    expect(screen.getByText("Approval metadata is missing.")).toBeTruthy();
  });
});
