import { ok, fail } from "@/app/api/_utils";
import { requireAssistantFlag } from "@/app/api/assistant/_utils";
import { getCommsHistory } from "@/lib/assistant/comms-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function GET() {
  const blocked = requireAssistantFlag("assistant_comms_v1");
  if (blocked) return blocked;

  const result = await invokeWithFallback({
    toolName: "assistant_get_comms_history",
    fallback: getCommsHistory
  });

  if (!result.ok || !result.data) {
    return fail(500, result.error ?? { code: "ASSISTANT_HISTORY_FAILED", message: "Unable to fetch comms history." });
  }

  return ok(result.data, { source: result.source });
}
