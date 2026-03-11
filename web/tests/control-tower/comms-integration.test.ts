import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";

import { POST } from "@/app/api/assistant/comms/draft/route";
import { getCommsHistory } from "@/lib/assistant/comms-engine";
import { artifactToCommsDraft } from "@/lib/control-tower/artifacts/comms-integration";
import type { Artifact } from "@/lib/control-tower/artifacts/types";

vi.mock("@/lib/orchestrator", () => ({
  invokeWithFallback: vi.fn(async ({ fallback }) => ({
    ok: true,
    source: "fallback",
    data: await fallback()
  }))
}));

describe("artifact to comms draft integration", () => {
  const testCacheDir = path.join(process.cwd(), ".cache-test", "comms-integration");

  const artifact: Artifact = {
    id: "artifact-123",
    type: "follow_up",
    status: "draft",
    title: "Follow-up: Payment reversal dashboard",
    content:
      "Hi Alice,\n\nPlease confirm the rollout owner before we schedule grooming.\n\n- Pending decision: rollout owner\n- Next action: implementation lead follow-up",
    metadata: {
      featureRequestId: "fr-123",
      featureRequestTitle: "Payment reversal dashboard",
      generatedBy: "system",
      generatedAt: "2026-03-11T10:00:00.000Z",
      pmOwner: "alice@example.com",
      client: "Acme Bank"
    },
    createdAt: "2026-03-11T10:00:00.000Z",
    updatedAt: "2026-03-11T10:00:00.000Z"
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-11T10:00:00.000Z"));
    process.env.ASSISTANT_CACHE_DIR = testCacheDir;
    await fs.rm(testCacheDir, { recursive: true, force: true });
  });

  it("persists artifact-authored subject, body, and destination instead of regenerating generic draft content", async () => {
    const commsDraft = artifactToCommsDraft(artifact);

    const response = await POST(
      new Request("http://localhost/api/assistant/comms/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commsDraft)
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        type: "blocked_followup",
        status: "draft",
        requiresApproval: true,
        destination: "alice@example.com",
        subject: "Follow-up: Payment reversal dashboard",
        body: artifact.content,
        sourceDate: artifact.createdAt
      }
    });

    const history = await getCommsHistory();
    expect(history.drafts).toHaveLength(1);
    expect(history.drafts[0]).toMatchObject({
      type: "blocked_followup",
      status: "draft",
      requiresApproval: true,
      destination: "alice@example.com",
      subject: "Follow-up: Payment reversal dashboard",
      body: artifact.content,
      sourceDate: artifact.createdAt
    });
    expect(history.audit).toEqual([
      expect.objectContaining({
        event: "draft_created",
        actor: "assistant",
        details: expect.stringContaining("alice@example.com")
      })
    ]);
  });

  it("keeps approval gating intact for artifact-submitted drafts", async () => {
    const commsDraft = artifactToCommsDraft({
      ...artifact,
      type: "clarification_request",
      title: "Clarification Needed: Payment reversal dashboard"
    });

    const response = await POST(
      new Request("http://localhost/api/assistant/comms/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commsDraft)
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      data: {
        status: "draft",
        requiresApproval: true,
        destination: "alice@example.com",
        subject: "Clarification Needed: Payment reversal dashboard",
        body: artifact.content
      }
    });
    expect(payload.data).not.toHaveProperty("sentAt");
    expect(payload.data).not.toHaveProperty("approvedAt");
  });
});
