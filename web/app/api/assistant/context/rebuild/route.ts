import { ok, fail } from "@/app/api/_utils";
import { requireAssistantFlag } from "@/app/api/assistant/_utils";
import { rebuildAssistantContext } from "@/lib/assistant/context-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function POST() {
  const blocked = requireAssistantFlag("assistant_context_v1");
  if (blocked) return blocked;

  const result = await invokeWithFallback({
    toolName: "assistant_rebuild_context",
    fallback: rebuildAssistantContext
  });

  if (!result.ok || !result.data) {
    return fail(500, result.error ?? { code: "ASSISTANT_REBUILD_FAILED", message: "Unable to rebuild assistant context." });
  }

  const payload = result.data as { context?: unknown; durationMs?: number };
  const data = payload.context ?? result.data;

  return ok(data, {
    source: result.source,
    durationMs: payload.durationMs
  });
}
