import { PRIORITY_RANK } from "@/lib/constants";
import type { TaskDocument } from "@/lib/types";

function dueDateBoost(dueDate?: string): number {
  if (!dueDate) return 0;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return 0;

  const now = new Date();
  const days = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (days < 0) return 25;
  if (days <= 1) return 18;
  if (days <= 3) return 10;

  return 0;
}

function statusBoost(status: TaskDocument["frontmatter"]["status"]): number {
  if (status === "s") return 8;
  if (status === "n") return 0;
  if (status === "b") return -30;
  return -100;
}

export function scoreTask(task: TaskDocument): number {
  const priorityScore = PRIORITY_RANK[task.frontmatter.priority] ?? 40;
  return priorityScore + dueDateBoost(task.frontmatter.due_date) + statusBoost(task.frontmatter.status);
}

export function rankTasks(tasks: TaskDocument[]): TaskDocument[] {
  return [...tasks].sort((left, right) => scoreTask(right) - scoreTask(left));
}

export function topFocusTasks(tasks: TaskDocument[], limit = 3): TaskDocument[] {
  return rankTasks(tasks.filter((task) => task.frontmatter.status !== "d" && task.frontmatter.status !== "b")).slice(0, limit);
}
