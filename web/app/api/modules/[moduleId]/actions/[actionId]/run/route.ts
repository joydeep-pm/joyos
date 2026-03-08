import { NextRequest } from "next/server";
import { fail, ok } from "@/app/api/_utils";
import { runModuleAction } from "@/lib/modules";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ moduleId: string; actionId: string }> }
) {
  try {
    const { moduleId, actionId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { args?: Record<string, unknown> };

    const result = await runModuleAction(moduleId, actionId, body.args ?? {});

    return ok(result.data, { source: result.source });
  } catch (error) {
    return fail(500, {
      code: "MODULE_ACTION_FAILED",
      message: error instanceof Error ? error.message : "Action execution failed."
    });
  }
}
