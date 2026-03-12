import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { approveEnvelope, createApprovalEnvelope, executeEnvelope, getApprovalEnvelope } from "@/lib/assistant/approval-envelope-store";
import { createCommsDraft } from "@/lib/assistant/comms-engine";

let tempRoot = "";

beforeEach(async () => {
  tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "personal-os-approval-execution-"));
  process.env.PERSONAL_OS_ROOT = tempRoot;
  process.env.ASSISTANT_CACHE_DIR = path.join(tempRoot, ".cache");
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-12T14:00:00.000Z"));
});

afterEach(async () => {
  if (tempRoot) {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
  delete process.env.PERSONAL_OS_ROOT;
  delete process.env.ASSISTANT_CACHE_DIR;
});

describe("approval envelope execution", () => {
  it("executes an approved comms envelope exactly once with durable audit state", async () => {
    const draft = await createCommsDraft({
      destination: "leader@local",
      subject: "Execution update",
      body: "Approved update body",
      type: "stakeholder_update",
      status: "approved",
      approvedAt: "2026-03-12T14:05:00.000Z",
      approvedBy: "joydeep",
      approvalToken: "token-approved-draft"
    });

    const envelope = await createApprovalEnvelope({
      actionType: "comms_send",
      targetType: "comms_draft",
      targetId: draft.id,
      summary: `Send comms draft ${draft.id}`,
      evidence: ["Director approved the stakeholder message"],
      proposedBy: "assistant"
    });

    vi.setSystemTime(new Date("2026-03-12T14:05:00.000Z"));
    await approveEnvelope(envelope.id, "joydeep");

    vi.setSystemTime(new Date("2026-03-12T14:10:00.000Z"));
    const executed = await executeEnvelope(envelope.id, "joydeep");

    expect(executed).toMatchObject({
      status: "executed",
      executedBy: "joydeep",
      executedAt: "2026-03-12T14:10:00.000Z"
    });

    await expect(executeEnvelope(envelope.id, "joydeep")).rejects.toThrow("Invalid envelope transition");

    const stored = await getApprovalEnvelope(envelope.id);
    expect(stored?.audit.map((entry) => entry.event)).toEqual([
      "proposed",
      "approved",
      "executed",
      "transition_rejected"
    ]);
  });

  it("persists failed execution diagnostics when the provider fails", async () => {
    const draft = await createCommsDraft({
      destination: "leader@local",
      subject: "Execution update",
      body: "Approved update body",
      type: "stakeholder_update",
      status: "approved",
      approvedAt: "2026-03-12T14:05:00.000Z",
      approvedBy: "joydeep",
      approvalToken: "token-approved-draft"
    });

    const envelope = await createApprovalEnvelope({
      actionType: "comms_send",
      targetType: "comms_draft",
      targetId: draft.id,
      summary: `Send comms draft ${draft.id}`,
      evidence: ["Director approved the stakeholder message"],
      proposedBy: "assistant"
    });

    await approveEnvelope(envelope.id, "joydeep");

    vi.setSystemTime(new Date("2026-03-12T14:20:00.000Z"));
    await expect(
      executeEnvelope(envelope.id, "joydeep", {
        sendCommsDraft: vi.fn().mockResolvedValue({
          draftId: draft.id,
          status: "blocked",
          destination: draft.destination,
          message: "Provider unavailable"
        })
      })
    ).rejects.toThrow("Envelope execution failed");

    const stored = await getApprovalEnvelope(envelope.id);
    expect(stored).toMatchObject({
      status: "failed",
      failedAt: "2026-03-12T14:20:00.000Z",
      failedBy: "joydeep",
      failureCode: "approval_execution_failed"
    });
    expect(stored?.audit.map((entry) => entry.event)).toContain("execution_failed");
  });
});
