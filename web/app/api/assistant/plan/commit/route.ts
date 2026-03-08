import { NextRequest } from "next/server";
import { ok, fail } from "@/app/api/_utils";
import { readDateParam, requireAssistantFlag } from "@/app/api/assistant/_utils";
import { commitDayPlan } from "@/lib/assistant/queue-engine";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function POST(request: NextRequest) {
  const blocked = requireAssistantFlag("assistant_loop_v1");
  if (blocked) return blocked;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      date?: string;
      taskIds?: string[];
      notes?: string;
    };

    const date = readDateParam(body.date ?? null);
    const taskIds = Array.isArray(body.taskIds) ? body.taskIds.filter((item): item is string => typeof item === "string") : undefined;

    const result = await invokeWithFallback({
      toolName: "assistant_commit_plan",
      args: {
        date,
        task_ids: taskIds,
        notes: body.notes
      },
      fallback: () =>
        commitDayPlan({
          date,
          taskIds,
          notes: body.notes
        })
    });

    if (!result.ok || !result.data) {
      return fail(500, result.error ?? { code: "ASSISTANT_COMMIT_FAILED", message: "Unable to commit daily plan." });
    }

    return ok(result.data, { source: result.source });
  } catch (error) {
    return fail(500, {
      code: "ASSISTANT_COMMIT_EXCEPTION",
      message: error instanceof Error ? error.message : "Unexpected commit-day-plan error."
    });
  }
}
