import { ok, fail } from "@/app/api/_utils";
import { getStrategyWorkspace } from "@/lib/strategy";

export async function GET() {
  try {
    const workspace = await getStrategyWorkspace();
    return ok(workspace, { source: "fallback" });
  } catch (error) {
    return fail(500, {
      code: "STRATEGY_READ_FAILED",
      message: error instanceof Error ? error.message : "Unable to read strategy workspace"
    });
  }
}
