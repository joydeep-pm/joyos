import { NextRequest } from "next/server";
import { ok, fail } from "@/app/api/_utils";
import { parseBacklogItems, processBacklog } from "@/lib/backlog";
import { listTasks, processBacklogFromFile, readBacklogRaw } from "@/lib/file-store";
import { invokeWithFallback } from "@/lib/orchestrator";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { items?: string[] };
    const items = Array.isArray(body.items) && body.items.length > 0 ? body.items : parseBacklogItems(await readBacklogRaw());

    const result = await invokeWithFallback({
      toolName: "process_backlog_with_dedup",
      args: { items, auto_create: false },
      fallback: async () => {
        if (body.items?.length) {
          const tasks = await listTasks({ includeDone: true });
          return processBacklog(body.items, tasks);
        }
        return processBacklogFromFile();
      }
    });

    if (!result.ok || !result.data) {
      return fail(500, result.error ?? { code: "BACKLOG_PROCESS_FAILED", message: "Unable to process backlog." });
    }

    return ok(result.data, { source: result.source });
  } catch (error) {
    return fail(500, {
      code: "BACKLOG_PROCESS_EXCEPTION",
      message: error instanceof Error ? error.message : "Unexpected backlog processing error."
    });
  }
}
