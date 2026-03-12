import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  approveEnvelope,
  createApprovalEnvelope,
  denyEnvelope,
  getApprovalEnvelope,
  listApprovalEnvelopes
} from "@/lib/assistant/approval-envelope-store";

let tempRoot = "";

beforeEach(async () => {
  tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "personal-os-approval-envelope-"));
  process.env.PERSONAL_OS_ROOT = tempRoot;
  process.env.ASSISTANT_CACHE_DIR = path.join(tempRoot, ".cache");
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-12T12:00:00.000Z"));
});

afterEach(async () => {
  if (tempRoot) {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
  delete process.env.PERSONAL_OS_ROOT;
  delete process.env.ASSISTANT_CACHE_DIR;
});

describe("approval envelope store", () => {
  it("persists a proposed approval envelope with durable audit state", async () => {
    const envelope = await createApprovalEnvelope({
      actionType: "comms_send",
      targetType: "comms_draft",
      targetId: "draft-123",
      summary: "Send stakeholder update draft draft-123",
      evidence: ["Draft created from reviewed artifact"],
      proposedBy: "assistant"
    });

    expect(envelope).toMatchObject({
      id: expect.stringMatching(/^envelope_/),
      status: "proposed",
      actionType: "comms_send",
      targetType: "comms_draft",
      targetId: "draft-123",
      summary: "Send stakeholder update draft draft-123",
      evidence: ["Draft created from reviewed artifact"],
      proposedBy: "assistant",
      createdAt: "2026-03-12T12:00:00.000Z",
      updatedAt: "2026-03-12T12:00:00.000Z",
      audit: [
        expect.objectContaining({
          event: "proposed",
          actor: "assistant"
        })
      ]
    });
  });

  it("supports approve and deny transitions with audit entries", async () => {
    const envelope = await createApprovalEnvelope({
      actionType: "comms_send",
      targetType: "comms_draft",
      targetId: "draft-123",
      summary: "Send stakeholder update draft draft-123",
      evidence: ["Draft created from reviewed artifact"],
      proposedBy: "assistant"
    });

    vi.setSystemTime(new Date("2026-03-12T12:10:00.000Z"));
    const approved = await approveEnvelope(envelope.id, "joydeep");
    expect(approved).toMatchObject({
      status: "approved",
      approvedBy: "joydeep",
      approvedAt: "2026-03-12T12:10:00.000Z"
    });

    vi.setSystemTime(new Date("2026-03-12T12:20:00.000Z"));
    await expect(denyEnvelope(envelope.id, "joydeep", "No longer needed")).rejects.toThrow(
      "Invalid envelope transition"
    );

    const stored = await getApprovalEnvelope(envelope.id);
    expect(stored?.audit.map((entry) => entry.event)).toEqual(["proposed", "approved", "transition_rejected"]);
  });

  it("lists persisted approval envelopes in newest-first order", async () => {
    await createApprovalEnvelope({
      actionType: "comms_send",
      targetType: "comms_draft",
      targetId: "draft-123",
      summary: "Send stakeholder update draft draft-123",
      evidence: ["Draft created from reviewed artifact"],
      proposedBy: "assistant"
    });

    vi.setSystemTime(new Date("2026-03-12T12:05:00.000Z"));

    await createApprovalEnvelope({
      actionType: "jira_writeback",
      targetType: "jira_issue",
      targetId: "PAY-321",
      summary: "Update Jira issue PAY-321",
      evidence: ["Feature request review approved"],
      proposedBy: "assistant"
    });

    const envelopes = await listApprovalEnvelopes();
    expect(envelopes).toHaveLength(2);
    expect(envelopes[0]?.targetId).toBe("PAY-321");
  });
});
