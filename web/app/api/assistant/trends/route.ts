import { NextRequest } from "next/server";
import { ok, fail } from "@/app/api/_utils";
import { readWeekParam, requireAssistantFlag } from "@/app/api/assistant/_utils";
import { getTrendPoints } from "@/lib/assistant/trend-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

function readWindowWeeks(value: string | null): number {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed)) return 8;
  return Math.max(1, Math.min(Math.floor(parsed), 52));
}

export async function GET(request: NextRequest) {
  const reviewFlag = requireAssistantFlag("assistant_review_v1");
  if (reviewFlag) return reviewFlag;
  const alertsFlag = requireAssistantFlag("assistant_alerts_v1");
  if (alertsFlag) return alertsFlag;

  const weekId = readWeekParam(request.nextUrl.searchParams.get("week"));
  const windowWeeks = readWindowWeeks(request.nextUrl.searchParams.get("window_weeks"));

  const result = await invokeWithFallback({
    toolName: "assistant_get_trends",
    args: {
      week: weekId,
      window_weeks: windowWeeks
    },
    fallback: () =>
      getTrendPoints({
        endingWeekId: weekId,
        windowWeeks
      })
  });

  if (!result.ok || !result.data) {
    return fail(500, result.error ?? { code: "ASSISTANT_TRENDS_FAILED", message: "Unable to fetch trend points." });
  }

  return ok(result.data, { source: result.source });
}
