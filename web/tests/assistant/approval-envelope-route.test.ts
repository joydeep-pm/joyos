import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createCommsDraft } from "@/lib/assistant/comms-engine";
import { writeJsonFile } from "@/lib/assistant/storage";

const { POST: createEnvelope } = await import("@/app/api/assistant/approval-envelopes/route");
const { GET: readEnvelope, POST: transitionEnvelope } = await import("@/app/api/assistant/approval-envelopes/[id]/route");

let tempRoot = "";

beforeEach(async () => {
  tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "personal-os-approval-route-"));
  process.env.PERSONAL_OS_ROOT = tempRoot;
  process.env.ASSISTANT_CACHE_DIR = path.join(tempRoot, ".cache");
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-12T13:00:00.000Z"));
});

afterEach(async () => {
  if (tempRoot) {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
  delete process.env.PERSONAL_OS_ROOT;
  delete process.env.ASSISTANT_CACHE_DIR;
});

describe("approval envelope routes", () => {
  it("creates and reads a proposed envelope through stable route contracts", async () => {
    const createResponse = await createEnvelope(
      new Request("http://localhost/api/assistant/approval-envelopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "comms_send",
          targetType: "comms_draft",
          targetId: "draft-123",
          summary: "Send stakeholder update draft draft-123",
          evidence: ["Draft created from reviewed artifact"],
          proposedBy: "assistant"
        })
      })
    );

    expect(createResponse.status).toBe(200);
    const created = await createResponse.json();
    expect(created.ok).toBe(true);

    const readResponse = await readEnvelope(
      new Request(`http://localhost/api/assistant/approval-envelopes/${created.data.id}`),
      { params: Promise.resolve({ id: created.data.id }) }
    );

    expect(readResponse.status).toBe(200);
    await expect(readResponse.json()).resolves.toMatchObject({
      ok: true,
      data: {
        id: created.data.id,
        status: "proposed"
      }
    });
  });

  it("returns stable route codes for invalid requests and invalid transitions", async () => {
    const invalidResponse = await createEnvelope(
      new Request("http://localhost/api/assistant/approval-envelopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "comms_send"
        })
      })
    );

    expect(invalidResponse.status).toBe(400);
    await expect(invalidResponse.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "approval_envelope_invalid_request"
      }
    });

    const createResponse = await createEnvelope(
      new Request("http://localhost/api/assistant/approval-envelopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "comms_send",
          targetType: "comms_draft",
          targetId: "draft-123",
          summary: "Send stakeholder update draft draft-123",
          evidence: ["Draft created from reviewed artifact"],
          proposedBy: "assistant"
        })
      })
    );

    const created = await createResponse.json();

    vi.setSystemTime(new Date("2026-03-12T13:10:00.000Z"));
    await transitionEnvelope(
      new Request(`http://localhost/api/assistant/approval-envelopes/${created.data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", actor: "joydeep" })
      }),
      { params: Promise.resolve({ id: created.data.id }) }
    );

    const invalidTransition = await transitionEnvelope(
      new Request(`http://localhost/api/assistant/approval-envelopes/${created.data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deny", actor: "joydeep", reason: "Too late" })
      }),
      { params: Promise.resolve({ id: created.data.id }) }
    );

    expect(invalidTransition.status).toBe(409);
    await expect(invalidTransition.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "approval_envelope_invalid_transition"
      }
    });
  });

  it("rejects execution attempts without prior approval through stable route codes", async () => {
    const createResponse = await createEnvelope(
      new Request("http://localhost/api/assistant/approval-envelopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "comms_send",
          targetType: "comms_draft",
          targetId: "draft-123",
          summary: "Send stakeholder update draft draft-123",
          evidence: ["Draft created from reviewed artifact"],
          proposedBy: "assistant"
        })
      })
    );

    const created = await createResponse.json();
    const executionResponse = await transitionEnvelope(
      new Request(`http://localhost/api/assistant/approval-envelopes/${created.data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute", actor: "joydeep" })
      }),
      { params: Promise.resolve({ id: created.data.id }) }
    );

    expect(executionResponse.status).toBe(409);
    await expect(executionResponse.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "approval_envelope_execution_requires_approval"
      }
    });
  });

  it("returns executed envelope state after a successful approved comms execution", async () => {
    const draft = await createCommsDraft({
      destination: "leader@local",
      subject: "Execution update",
      body: "Approved update body",
      type: "stakeholder_update",
      status: "approved",
      approvedAt: "2026-03-12T13:05:00.000Z",
      approvedBy: "joydeep",
      approvalToken: "token-approved-draft"
    });

    const createResponse = await createEnvelope(
      new Request("http://localhost/api/assistant/approval-envelopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "comms_send",
          targetType: "comms_draft",
          targetId: draft.id,
          summary: `Send stakeholder update draft ${draft.id}`,
          evidence: ["Draft created from reviewed artifact"],
          proposedBy: "assistant"
        })
      })
    );

    const created = await createResponse.json();

    vi.setSystemTime(new Date("2026-03-12T13:10:00.000Z"));
    await transitionEnvelope(
      new Request(`http://localhost/api/assistant/approval-envelopes/${created.data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", actor: "joydeep" })
      }),
      { params: Promise.resolve({ id: created.data.id }) }
    );

    vi.setSystemTime(new Date("2026-03-12T13:15:00.000Z"));
    const executeResponse = await transitionEnvelope(
      new Request(`http://localhost/api/assistant/approval-envelopes/${created.data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute", actor: "joydeep" })
      }),
      { params: Promise.resolve({ id: created.data.id }) }
    );

    expect(executeResponse.status).toBe(200);
    const executePayload = await executeResponse.json();
    expect(executePayload).toMatchObject({
      ok: true,
      data: {
        id: created.data.id,
        status: "executed",
        executedBy: "joydeep",
        executedAt: "2026-03-12T13:15:00.000Z"
      }
    });
    expect(executePayload.data.audit).toEqual([
      expect.objectContaining({ event: "proposed" }),
      expect.objectContaining({ event: "approved" }),
      expect.objectContaining({ event: "executed" })
    ]);
    expect(executePayload.data).not.toHaveProperty("failureCode");
    expect(executePayload.data).not.toHaveProperty("failureMessage");
  });

  it("returns stable route codes when approved execution fails or is replayed", async () => {
    const draft = await createCommsDraft({
      destination: "leader@local",
      subject: "Execution update",
      body: "Approved update body",
      type: "stakeholder_update",
      status: "approved",
      approvedAt: "2026-03-12T13:05:00.000Z",
      approvedBy: "joydeep",
      approvalToken: "token-approved-draft"
    });

    await writeJsonFile(path.join(tempRoot, ".cache", "assistant-comms.json"), {
      version: 1,
      drafts: [
        {
          ...draft,
          status: "approved",
          approvedAt: undefined,
          approvedBy: undefined,
          approvalToken: undefined
        }
      ],
      audit: []
    });

    const createResponse = await createEnvelope(
      new Request("http://localhost/api/assistant/approval-envelopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "comms_send",
          targetType: "comms_draft",
          targetId: draft.id,
          summary: `Send stakeholder update draft ${draft.id}`,
          evidence: ["Draft created from reviewed artifact"],
          proposedBy: "assistant"
        })
      })
    );

    const created = await createResponse.json();

    await transitionEnvelope(
      new Request(`http://localhost/api/assistant/approval-envelopes/${created.data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", actor: "joydeep" })
      }),
      { params: Promise.resolve({ id: created.data.id }) }
    );

    const failedExecution = await transitionEnvelope(
      new Request(`http://localhost/api/assistant/approval-envelopes/${created.data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute", actor: "joydeep" })
      }),
      { params: Promise.resolve({ id: created.data.id }) }
    );

    expect(failedExecution.status).toBe(500);
    await expect(failedExecution.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "approval_envelope_transition_failed",
        message: "Envelope execution failed"
      }
    });

    const failedStateResponse = await readEnvelope(
      new Request(`http://localhost/api/assistant/approval-envelopes/${created.data.id}`),
      { params: Promise.resolve({ id: created.data.id }) }
    );

    expect(failedStateResponse.status).toBe(200);
    await expect(failedStateResponse.json()).resolves.toMatchObject({
      ok: true,
      data: {
        id: created.data.id,
        status: "failed",
        failedBy: "joydeep",
        failureCode: "approval_execution_failed",
        failureMessage: "Approval metadata is missing.",
        audit: [
          expect.objectContaining({ event: "proposed" }),
          expect.objectContaining({ event: "approved" }),
          expect.objectContaining({ event: "execution_failed" })
        ]
      }
    });

    const replayResponse = await transitionEnvelope(
      new Request(`http://localhost/api/assistant/approval-envelopes/${created.data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute", actor: "joydeep" })
      }),
      { params: Promise.resolve({ id: created.data.id }) }
    );

    expect(replayResponse.status).toBe(409);
    await expect(replayResponse.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "approval_envelope_invalid_transition"
      }
    });
  });
});
