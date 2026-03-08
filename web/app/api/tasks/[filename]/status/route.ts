import { NextRequest } from "next/server";
import { fail, ok } from "@/app/api/_utils";
import { updateTaskStatus } from "@/lib/file-store";
import { invokeWithFallback } from "@/lib/orchestrator";
import type { TaskStatus } from "@/lib/types";

export async function PATCH(request: NextRequest, context: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await context.params;
    const body = (await request.json()) as { status?: TaskStatus };

    if (!body.status || !["n", "s", "b", "d"].includes(body.status)) {
      return fail(400, { code: "INVALID_STATUS", message: "Status must be one of n, s, b, d." });
    }

    const result = await invokeWithFallback({
      toolName: "update_task_status",
      args: {
        task_file: filename,
        status: body.status
      },
      fallback: () => updateTaskStatus(filename, body.status as TaskStatus)
    });

    if (!result.ok) {
      return fail(500, result.error ?? { code: "TASK_UPDATE_FAILED", message: "Unable to update task status." });
    }

    return ok(result.data, { source: result.source });
  } catch (error) {
    return fail(500, {
      code: "TASK_UPDATE_EXCEPTION",
      message: error instanceof Error ? error.message : "Unexpected error while updating status."
    });
  }
}
