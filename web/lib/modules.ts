import { parseBacklogItems, processBacklog } from "@/lib/backlog";
import {
  appendCapture,
  clearBacklog,
  createTask,
  getSystemStatus,
  listTasks,
  processBacklogFromFile,
  readBacklogRaw,
  updateTaskStatus
} from "@/lib/file-store";
import { readModuleRegistry } from "@/lib/module-registry";
import { invokeWithFallback } from "@/lib/orchestrator";
import type { ActionModuleDefinition, ModuleActionDefinition, TaskPriority, TaskStatus } from "@/lib/types";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function asStringArray(value: unknown): string[] | undefined {
  if (isStringArray(value)) return value;
  if (typeof value === "string") {
    const parts = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return parts.length ? parts : undefined;
  }

  return undefined;
}

export async function listActionModules(): Promise<ActionModuleDefinition[]> {
  const registry = await readModuleRegistry();
  return registry.modules;
}

export async function getActionModule(moduleId: string): Promise<ActionModuleDefinition | null> {
  const modules = await listActionModules();
  return modules.find((module) => module.id === moduleId) ?? null;
}

export async function getModuleAction(moduleId: string, actionId: string): Promise<ModuleActionDefinition | null> {
  const actionModule = await getActionModule(moduleId);
  if (!actionModule) return null;

  return actionModule.actions.find((action) => action.id === actionId) ?? null;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  return value.trim();
}

function requireStatus(value: unknown): TaskStatus {
  const status = requireString(value, "status") as TaskStatus;
  if (!["n", "s", "b", "d"].includes(status)) {
    throw new Error("status must be one of n, s, b, d.");
  }

  return status;
}

function optionalPriority(value: unknown): TaskPriority | undefined {
  if (typeof value !== "string") return undefined;
  if (["P0", "P1", "P2", "P3"].includes(value)) return value as TaskPriority;
  return undefined;
}

export async function runModuleAction(moduleId: string, actionId: string, args: Record<string, unknown> = {}) {
  const action = await getModuleAction(moduleId, actionId);
  if (!action) {
    throw new Error(`Unknown module action: ${moduleId}/${actionId}`);
  }

  switch (action.id) {
    case "capture_item": {
      const text = requireString(args.text, "text");
      const data = await appendCapture(text);
      return { source: "fallback", data };
    }
    case "process_backlog": {
      const providedItems = asStringArray(args.items);

      const result = await invokeWithFallback({
        toolName: "process_backlog_with_dedup",
        args: {
          items: providedItems ?? parseBacklogItems(await readBacklogRaw()),
          auto_create: false
        },
        fallback: async () => {
          if (providedItems?.length) {
            const existingTasks = await listTasks({ includeDone: true });
            return processBacklog(providedItems, existingTasks);
          }

          return processBacklogFromFile();
        }
      });

      if (!result.ok || !result.data) {
        throw new Error(result.error?.message ?? "Backlog processing failed.");
      }

      return { source: result.source, data: result.data };
    }
    case "clear_backlog": {
      const result = await invokeWithFallback({
        toolName: "clear_backlog",
        fallback: async () => {
          await clearBacklog();
          return { cleared: true };
        }
      });

      if (!result.ok) {
        throw new Error(result.error?.message ?? "Backlog clear failed.");
      }

      return { source: result.source, data: result.data ?? { cleared: true } };
    }
    case "create_task": {
      const title = requireString(args.title, "title");
      const category = typeof args.category === "string" ? args.category : "other";
      const priority = optionalPriority(args.priority) ?? "P2";

      const result = await invokeWithFallback({
        toolName: "create_task",
        args: {
          title,
          category,
          priority,
          estimated_time: typeof args.estimated_time === "number" ? args.estimated_time : 60,
          content: typeof args.content === "string" ? args.content : undefined
        },
        fallback: () =>
          createTask({
            title,
            category,
            priority,
            estimated_time: typeof args.estimated_time === "number" ? args.estimated_time : 60,
            due_date: typeof args.due_date === "string" ? args.due_date : undefined,
            resource_refs: isStringArray(args.resource_refs) ? args.resource_refs : undefined,
            content: typeof args.content === "string" ? args.content : undefined
          })
      });

      if (!result.ok || !result.data) {
        throw new Error(result.error?.message ?? "Task creation failed.");
      }

      return { source: result.source, data: result.data };
    }
    case "update_task_status": {
      const filename = requireString(args.filename, "filename");
      const status = requireStatus(args.status);

      const result = await invokeWithFallback({
        toolName: "update_task_status",
        args: {
          task_file: filename,
          status
        },
        fallback: () => updateTaskStatus(filename, status)
      });

      if (!result.ok || !result.data) {
        throw new Error(result.error?.message ?? "Status update failed.");
      }

      return { source: result.source, data: result.data };
    }
    case "list_tasks": {
      const category = asStringArray(args.category);
      const priority = asStringArray(args.priority) as TaskPriority[] | undefined;
      const status = asStringArray(args.status) as TaskStatus[] | undefined;
      const includeDone = args.includeDone === true;

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
        throw new Error(result.error?.message ?? "Task listing failed.");
      }

      const data = Array.isArray(result.data)
        ? result.data
        : (result.data as { tasks?: unknown[] } | undefined)?.tasks ?? [];

      return { source: result.source, data };
    }
    case "system_status": {
      const result = await invokeWithFallback({
        toolName: "get_system_status",
        fallback: getSystemStatus
      });

      if (!result.ok || !result.data) {
        throw new Error(result.error?.message ?? "System status failed.");
      }

      return { source: result.source, data: result.data };
    }
    default:
      throw new Error(`Action handler not implemented: ${action.id}`);
  }
}
