import { ok, fail } from "@/app/api/_utils";
import { readDateParam, requireAssistantFlag } from "@/app/api/assistant/_utils";
import { createCommsDraft } from "@/lib/assistant/comms-engine";
import { invokeWithFallback } from "@/lib/orchestrator";
import type { CommsDraft } from "@/lib/types";

interface CreateCommsDraftRequestBody {
  type?: "stakeholder_update" | "blocked_followup";
  destination?: string;
  date?: string;
  actor?: string;
  subject?: string;
  body?: string;
  sourceDate?: string;
  requiresApproval?: boolean;
  status?: CommsDraft["status"];
}

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isArtifactSubmittedDraft(
  body: CreateCommsDraftRequestBody
): body is CreateCommsDraftRequestBody & { subject: string; body: string; destination: string; type: NonNullable<CreateCommsDraftRequestBody["type"]> } {
  return Boolean(body.type && isNonEmptyString(body.destination) && isNonEmptyString(body.subject) && isNonEmptyString(body.body));
}

export async function POST(request: Request) {
  const blocked = requireAssistantFlag("assistant_comms_v1");
  if (blocked) return blocked;

  try {
    const body = (await request.json().catch(() => ({}))) as CreateCommsDraftRequestBody;

    if (isArtifactSubmittedDraft(body)) {
      const artifactDraft: CommsDraft = {
        id: `comms-${crypto.randomUUID()}`,
        type: body.type,
        status: body.status ?? "draft",
        destination: body.destination.trim(),
        subject: body.subject.trim(),
        body: body.body.trim(),
        requiresApproval: body.requiresApproval ?? true,
        createdAt: new Date().toISOString(),
        sourceDate: body.sourceDate ?? body.date ?? new Date().toISOString()
      };

      const result = await invokeWithFallback({
        toolName: "assistant_create_comms_draft",
        args: artifactDraft as unknown as Record<string, unknown>,
        fallback: () => createCommsDraft(artifactDraft)
      });

      if (!result.ok || !result.data) {
        return fail(500, result.error ?? { code: "ASSISTANT_DRAFT_FAILED", message: "Unable to create comms draft." });
      }

      return ok(result.data, { source: result.source });
    }

    const date = readDateParam(body.date ?? null);

    const result = await invokeWithFallback({
      toolName: "assistant_create_comms_draft",
      args: {
        type: body.type,
        destination: body.destination,
        date,
        actor: body.actor
      },
      fallback: () =>
        createCommsDraft({
          type: body.type,
          destination: body.destination,
          date,
          actor: body.actor
        })
    });

    if (!result.ok || !result.data) {
      return fail(500, result.error ?? { code: "ASSISTANT_DRAFT_FAILED", message: "Unable to create comms draft." });
    }

    return ok(result.data, { source: result.source });
  } catch (error) {
    return fail(500, {
      code: "ASSISTANT_DRAFT_EXCEPTION",
      message: error instanceof Error ? error.message : "Unexpected comms draft error."
    });
  }
}
