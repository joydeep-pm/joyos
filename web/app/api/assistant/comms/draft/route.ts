import { NextRequest } from "next/server";
import { ok, fail } from "@/app/api/_utils";
import { readDateParam, requireAssistantFlag } from "@/app/api/assistant/_utils";
import { createCommsDraft } from "@/lib/assistant/comms-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function POST(request: NextRequest) {
  const blocked = requireAssistantFlag("assistant_comms_v1");
  if (blocked) return blocked;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      type?: "stakeholder_update" | "blocked_followup";
      destination?: string;
      date?: string;
      actor?: string;
    };

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
