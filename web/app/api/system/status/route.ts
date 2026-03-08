import { ok, fail } from "@/app/api/_utils";
import { getSystemStatus } from "@/lib/file-store";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function GET() {
  const result = await invokeWithFallback({
    toolName: "get_system_status",
    fallback: getSystemStatus
  });

  if (!result.ok || !result.data) {
    return fail(500, result.error ?? { code: "STATUS_FAILED", message: "Unable to fetch system status." });
  }

  return ok(result.data, { source: result.source });
}
