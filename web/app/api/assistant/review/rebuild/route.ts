import { NextRequest } from "next/server";
import { ok, fail } from "@/app/api/_utils";
import { readWeekParam, requireAssistantFlag } from "@/app/api/assistant/_utils";
import { rebuildWeeklyReview } from "@/lib/assistant/review-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function POST(request: NextRequest) {
  const reviewFlag = requireAssistantFlag("assistant_review_v1");
  if (reviewFlag) return reviewFlag;
  const alertsFlag = requireAssistantFlag("assistant_alerts_v1");
  if (alertsFlag) return alertsFlag;

  const weekId = readWeekParam(request.nextUrl.searchParams.get("week"));

  const result = await invokeWithFallback({
    toolName: "assistant_rebuild_weekly_review",
    args: { week: weekId },
    fallback: () => rebuildWeeklyReview(weekId)
  });

  if (!result.ok || !result.data) {
    return fail(500, result.error ?? { code: "ASSISTANT_REVIEW_REBUILD_FAILED", message: "Unable to rebuild weekly review." });
  }

  return ok(result.data, { source: result.source });
}
