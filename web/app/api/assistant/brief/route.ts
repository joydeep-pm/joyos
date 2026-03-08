import { NextRequest } from "next/server";
import { ok, fail } from "@/app/api/_utils";
import { readDateParam, requireAssistantFlag } from "@/app/api/assistant/_utils";
import { generateDailyBrief } from "@/lib/assistant/brief-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function GET(request: NextRequest) {
  const blocked = requireAssistantFlag("assistant_loop_v1");
  if (blocked) return blocked;

  const date = readDateParam(request.nextUrl.searchParams.get("date"));

  const result = await invokeWithFallback({
    toolName: "assistant_get_brief",
    args: { date },
    fallback: () => generateDailyBrief(date)
  });

  if (!result.ok || !result.data) {
    return fail(500, result.error ?? { code: "ASSISTANT_BRIEF_FAILED", message: "Unable to generate daily brief." });
  }

  return ok(result.data, { source: result.source });
}
