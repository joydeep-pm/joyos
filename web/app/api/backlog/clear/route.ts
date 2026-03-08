import { clearBacklog } from "@/lib/file-store";
import { invokeWithFallback } from "@/lib/orchestrator";
import { fail, ok } from "@/app/api/_utils";

export async function POST() {
  const result = await invokeWithFallback({
    toolName: "clear_backlog",
    fallback: async () => {
      await clearBacklog();
      return { cleared: true };
    }
  });

  if (!result.ok) {
    return fail(500, result.error ?? { code: "BACKLOG_CLEAR_FAILED", message: "Unable to clear backlog." });
  }

  return ok(result.data ?? { cleared: true }, { source: result.source });
}
