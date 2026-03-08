import { NextRequest } from "next/server";
import { ok, fail } from "@/app/api/_utils";
import { readWeekParam, requireAssistantFlag } from "@/app/api/assistant/_utils";
import { getWeeklyReview } from "@/lib/assistant/review-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function GET(request: NextRequest) {
  const reviewFlag = requireAssistantFlag("assistant_review_v1");
  if (reviewFlag) return reviewFlag;
  const alertsFlag = requireAssistantFlag("assistant_alerts_v1");
  if (alertsFlag) return alertsFlag;

  const weekId = readWeekParam(request.nextUrl.searchParams.get("week"));

  const result = await invokeWithFallback({
    toolName: "assistant_get_weekly_review",
    args: { week: weekId },
    fallback: () => getWeeklyReview({ weekId })
  });

  if (!result.ok || !result.data) {
    return fail(500, result.error ?? { code: "ASSISTANT_REVIEW_FAILED", message: "Unable to fetch weekly review." });
  }

  return ok(result.data, { source: result.source });
}
