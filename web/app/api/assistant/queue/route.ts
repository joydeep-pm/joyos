import { ok, fail } from "@/app/api/_utils";
import { requireAssistantFlag } from "@/app/api/assistant/_utils";
import { listAssistantQueueItems } from "@/lib/assistant/queue-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function GET() {
  const blocked = requireAssistantFlag("assistant_loop_v1");
  if (blocked) return blocked;

  const result = await invokeWithFallback({
    toolName: "assistant_get_queue",
    fallback: listAssistantQueueItems
  });

  if (!result.ok || !result.data) {
    return fail(500, result.error ?? { code: "ASSISTANT_QUEUE_FAILED", message: "Unable to read assistant queue." });
  }

  return ok(result.data, { source: result.source });
}
