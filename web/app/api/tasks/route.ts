import { NextRequest } from "next/server";
import { fail, ok, parseCsv } from "@/app/api/_utils";
import { createTask, listTasks } from "@/lib/file-store";
import { invokeWithFallback } from "@/lib/orchestrator";
import type { TaskPriority, TaskStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const category = parseCsv(query.get("category"));
  const priority = parseCsv(query.get("priority")) as TaskPriority[] | undefined;
  const status = parseCsv(query.get("status")) as TaskStatus[] | undefined;
  const includeDone = query.get("include_done") === "true";

  const result = await invokeWithFallback({
    toolName: "list_tasks",
    args: {
      category: category?.join(","),
      priority: priority?.join(","),
      status: status?.join(","),
      include_done: includeDone
    },
    fallback: () => listTasks({ category, priority, status, includeDone })
  });

  if (!result.ok) {
    return fail(500, result.error ?? { code: "TASK_LIST_FAILED", message: "Unable to list tasks." });
  }

  const data = Array.isArray(result.data)
    ? result.data
    : (result.data as { tasks?: unknown[] } | undefined)?.tasks ?? [];

  return ok(data, { source: result.source });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      title?: string;
      category?: string;
      priority?: TaskPriority;
      estimated_time?: number;
      due_date?: string;
      resource_refs?: string[];
      content?: string;
    };

    if (!body.title?.trim()) {
      return fail(400, { code: "TASK_TITLE_REQUIRED", message: "Task title is required." });
    }

    const result = await invokeWithFallback({
      toolName: "create_task",
      args: {
        title: body.title,
        category: body.category,
        priority: body.priority,
        estimated_time: body.estimated_time,
        content: body.content
      },
      fallback: () =>
        createTask({
          title: body.title as string,
          category: body.category,
          priority: body.priority,
          estimated_time: body.estimated_time,
          due_date: body.due_date,
          resource_refs: body.resource_refs,
          content: body.content
        })
    });

    if (!result.ok) {
      return fail(500, result.error ?? { code: "TASK_CREATE_FAILED", message: "Unable to create task." });
    }

    return ok(result.data, { source: result.source });
  } catch (error) {
    return fail(500, {
      code: "TASK_CREATE_EXCEPTION",
      message: error instanceof Error ? error.message : "Unexpected error while creating task."
    });
  }
}
