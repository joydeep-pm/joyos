import { NextRequest } from "next/server";
import { ok, fail } from "@/app/api/_utils";
import { requireAssistantFlag } from "@/app/api/assistant/_utils";
import { sendCommsDraft } from "@/lib/assistant/comms-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const blocked = requireAssistantFlag("assistant_comms_v1");
  if (blocked) return blocked;

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { actor?: string };

    const result = await invokeWithFallback({
      toolName: "assistant_send_comms_draft",
      args: {
        id,
        actor: body.actor
      },
      fallback: () => sendCommsDraft(id, body.actor ?? "user")
    });

    if (!result.ok || !result.data) {
      return fail(500, result.error ?? { code: "ASSISTANT_SEND_FAILED", message: "Unable to send comms draft." });
    }

    return ok(result.data, { source: result.source });
  } catch (error) {
    return fail(500, {
      code: "ASSISTANT_SEND_EXCEPTION",
      message: error instanceof Error ? error.message : "Unexpected comms send error."
    });
  }
}
