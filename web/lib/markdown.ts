import matter from "gray-matter";
import type { TaskDocument, TaskFrontmatter, TaskPriority, TaskStatus } from "@/lib/types";

const DEFAULT_PRIORITY: TaskPriority = "P2";
const DEFAULT_STATUS: TaskStatus = "n";

function asTaskPriority(value: unknown): TaskPriority {
  return value === "P0" || value === "P1" || value === "P2" || value === "P3"
    ? value
    : DEFAULT_PRIORITY;
}

function asTaskStatus(value: unknown): TaskStatus {
  return value === "n" || value === "s" || value === "b" || value === "d"
    ? value
    : DEFAULT_STATUS;
}

export function normalizeTaskFrontmatter(data: Record<string, unknown>, fallbackTitle: string): TaskFrontmatter {
  return {
    title: typeof data.title === "string" && data.title.trim() ? data.title : fallbackTitle,
    category: typeof data.category === "string" && data.category.trim() ? data.category : "other",
    priority: asTaskPriority(data.priority),
    status: asTaskStatus(data.status),
    created_date: typeof data.created_date === "string" ? data.created_date : undefined,
    due_date: typeof data.due_date === "string" ? data.due_date : undefined,
    estimated_time: typeof data.estimated_time === "number" ? data.estimated_time : undefined,
    resource_refs: Array.isArray(data.resource_refs)
      ? data.resource_refs.filter((item): item is string => typeof item === "string")
      : undefined
  };
}

export function parseTaskDocument(filename: string, raw: string): TaskDocument {
  const parsed = matter(raw);
  const fallbackTitle = filename.replace(/\.md$/i, "").replace(/[-_]/g, " ");

  return {
    filename,
    frontmatter: normalizeTaskFrontmatter(parsed.data as Record<string, unknown>, fallbackTitle),
    body: parsed.content.trim()
  };
}

export function serializeTaskDocument(task: TaskDocument): string {
  const frontmatter: Record<string, unknown> = {
    title: task.frontmatter.title,
    category: task.frontmatter.category,
    priority: task.frontmatter.priority,
    status: task.frontmatter.status
  };

  if (task.frontmatter.created_date) frontmatter.created_date = task.frontmatter.created_date;
  if (task.frontmatter.due_date) frontmatter.due_date = task.frontmatter.due_date;
  if (typeof task.frontmatter.estimated_time === "number") frontmatter.estimated_time = task.frontmatter.estimated_time;
  if (task.frontmatter.resource_refs?.length) frontmatter.resource_refs = task.frontmatter.resource_refs;

  return matter.stringify(`${task.body.trim()}\n`, frontmatter);
}
