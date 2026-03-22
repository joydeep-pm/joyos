import { NextRequest } from "next/server";
import { fail, ok } from "@/app/api/_utils";
import { updateRoadmapItemStatus } from "@/lib/strategy-status-store";
import type { StrategyRoadmapStatus } from "@/lib/types";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { status?: StrategyRoadmapStatus };

    if (!body.status || !["not_started", "in_progress", "at_risk", "blocked", "done"].includes(body.status)) {
      return fail(400, {
        code: "INVALID_ROADMAP_STATUS",
        message: "status must be one of not_started, in_progress, at_risk, blocked, done"
      });
    }

    const items = await updateRoadmapItemStatus(id, body.status);
    return ok(items, { source: "fallback" });
  } catch (error) {
    return fail(500, {
      code: "ROADMAP_STATUS_UPDATE_FAILED",
      message: error instanceof Error ? error.message : "Unable to update roadmap status"
    });
  }
}
