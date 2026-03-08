import { NextRequest } from "next/server";
import { ok, fail } from "@/app/api/_utils";
import { requireAssistantFlag } from "@/app/api/assistant/_utils";
import { resolveAssistantAlert } from "@/lib/assistant/alert-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const blocked = requireAssistantFlag("assistant_alerts_v1");
  if (blocked) return blocked;

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { actionId?: string; actor?: string };

    const result = await invokeWithFallback({
      toolName: "assistant_resolve_alert",
      args: {
        alert_id: id,
        action_id: body.actionId,
        actor: body.actor
      },
      fallback: () =>
        resolveAssistantAlert({
          alertId: id,
          actionId: body.actionId,
          actor: body.actor ?? "user"
        })
    });

    if (!result.ok || !result.data) {
      return fail(500, result.error ?? { code: "ASSISTANT_ALERT_RESOLVE_FAILED", message: "Unable to resolve alert." });
    }

    return ok(result.data, { source: result.source });
  } catch (error) {
    return fail(500, {
      code: "ASSISTANT_ALERT_RESOLVE_EXCEPTION",
      message: error instanceof Error ? error.message : "Unexpected alert resolve error."
    });
  }
}
