import { fail, ok } from "@/app/api/_utils";
import { generateStrategyOutput } from "@/lib/strategy-generator";
import type { StrategyOutputType } from "@/lib/strategy-generator";

interface Body {
  type?: StrategyOutputType;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Body;
    const type = body.type;

    if (!type || !["business_status_update", "roadmap_update", "executive_snapshot", "board_summary"].includes(type)) {
      return fail(400, {
        code: "INVALID_STRATEGY_OUTPUT_TYPE",
        message: "type must be one of business_status_update, roadmap_update, executive_snapshot, board_summary"
      });
    }

    const output = await generateStrategyOutput(type);
    return ok(output, { source: "fallback" });
  } catch (error) {
    return fail(500, {
      code: "STRATEGY_GENERATE_FAILED",
      message: error instanceof Error ? error.message : "Unable to generate strategy output"
    });
  }
}
