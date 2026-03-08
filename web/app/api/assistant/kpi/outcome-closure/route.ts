import { NextRequest } from "next/server";
import { ok, fail } from "@/app/api/_utils";
import { readWeekParam, requireAssistantFlag } from "@/app/api/assistant/_utils";
import { getOutcomeClosureKpi } from "@/lib/assistant/kpi-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function GET(request: NextRequest) {
  const blocked = requireAssistantFlag("assistant_review_v1");
  if (blocked) return blocked;

  const weekId = readWeekParam(request.nextUrl.searchParams.get("week"));

  const result = await invokeWithFallback({
    toolName: "assistant_get_outcome_closure_kpi",
    args: { week: weekId },
    fallback: () => getOutcomeClosureKpi(weekId)
  });

  if (!result.ok || !result.data) {
    return fail(500, result.error ?? { code: "ASSISTANT_KPI_FAILED", message: "Unable to fetch weekly KPI." });
  }

  return ok(result.data, { source: result.source });
}
