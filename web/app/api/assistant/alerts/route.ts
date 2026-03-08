import { NextRequest } from "next/server";
import { ok, fail } from "@/app/api/_utils";
import { readDateParam, requireAssistantFlag } from "@/app/api/assistant/_utils";
import { getAssistantAlerts } from "@/lib/assistant/alert-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function GET(request: NextRequest) {
  const blocked = requireAssistantFlag("assistant_alerts_v1");
  if (blocked) return blocked;

  const date = readDateParam(request.nextUrl.searchParams.get("date"));

  const result = await invokeWithFallback({
    toolName: "assistant_get_alerts",
    args: { date },
    fallback: () => getAssistantAlerts({ date })
  });

  if (!result.ok || !result.data) {
    return fail(500, result.error ?? { code: "ASSISTANT_ALERTS_FAILED", message: "Unable to fetch alerts." });
  }

  return ok(result.data, { source: result.source });
}
