import { NextRequest } from "next/server";
import { ok, fail } from "@/app/api/_utils";
import { requireAssistantFlag } from "@/app/api/assistant/_utils";
import { updateAssistantQueueItemStatus } from "@/lib/assistant/queue-engine";
import { invokeWithFallback } from "@/lib/orchestrator";
import type { AssistantQueueStatus } from "@/lib/types";

const ALLOWED: AssistantQueueStatus[] = ["queued", "in_progress", "awaiting_input", "done", "dropped"];

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const blocked = requireAssistantFlag("assistant_loop_v1");
  if (blocked) return blocked;

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { status?: AssistantQueueStatus };

    if (!body.status || !ALLOWED.includes(body.status)) {
      return fail(400, {
        code: "ASSISTANT_INVALID_QUEUE_STATUS",
        message: `status must be one of: ${ALLOWED.join(", ")}`
      });
    }

    const result = await invokeWithFallback({
      toolName: "assistant_update_queue_status",
      args: {
        id,
        status: body.status
      },
      fallback: () => updateAssistantQueueItemStatus(id, body.status as AssistantQueueStatus)
    });

    if (!result.ok || !result.data) {
      return fail(500, result.error ?? { code: "ASSISTANT_QUEUE_UPDATE_FAILED", message: "Unable to update queue item." });
    }

    return ok(result.data, { source: result.source });
  } catch (error) {
    return fail(500, {
      code: "ASSISTANT_QUEUE_UPDATE_EXCEPTION",
      message: error instanceof Error ? error.message : "Unexpected queue update error."
    });
  }
}
