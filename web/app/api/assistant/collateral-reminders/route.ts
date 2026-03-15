import { ok, fail } from "@/app/api/_utils";
import { listCollateralReminders } from "@/lib/assistant/collateral-reminder-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? undefined;

  const result = await invokeWithFallback({
    toolName: "assistant_get_collateral_reminders",
    args: { date },
    fallback: () => listCollateralReminders({ date })
  });

  if (!result.ok || !result.data) {
    return fail(500, result.error ?? { code: "ASSISTANT_COLLATERAL_REMINDERS_FAILED", message: "Unable to fetch collateral reminders." });
  }

  return ok(result.data, { source: result.source });
}
