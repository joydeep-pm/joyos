import { ok, fail } from "@/app/api/_utils";
import { requireAssistantFlag } from "@/app/api/assistant/_utils";
import { getAssistantContext } from "@/lib/assistant/context-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function GET() {
  const blocked = requireAssistantFlag("assistant_context_v1");
  if (blocked) return blocked;

  const result = await invokeWithFallback({
    toolName: "assistant_get_context",
    fallback: () => getAssistantContext()
  });

  if (!result.ok || !result.data) {
    return fail(500, result.error ?? { code: "ASSISTANT_CONTEXT_FAILED", message: "Unable to build assistant context." });
  }

  const payload = result.data as { context?: unknown; cacheHit?: boolean; durationMs?: number };
  const data = payload.context ?? result.data;

  return ok(data, {
    source: result.source,
    cacheHit: payload.cacheHit,
    durationMs: payload.durationMs
  });
}
