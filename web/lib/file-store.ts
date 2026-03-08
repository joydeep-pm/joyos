import fs from "node:fs/promises";
import path from "node:path";
import { BACKLOG_PLACEHOLDER } from "@/lib/constants";
import { getAssistantFeatureFlags } from "@/lib/assistant/flags";
import { parseBacklogItems, processBacklog } from "@/lib/backlog";
import { parseTaskDocument, serializeTaskDocument } from "@/lib/markdown";
import { getWorkspacePaths } from "@/lib/path";
import type {
  BacklogProcessResult,
  GoalsResponse,
  SystemStatus,
  TaskDocument,
  TaskFilters,
  TaskFrontmatter,
  TaskPriority,
  TaskStatus
} from "@/lib/types";

function normalizeFilename(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return `${base || "task"}.md`;
}

function ensureMdExtension(name: string): string {
  return name.endsWith(".md") ? name : `${name}.md`;
}

function nowDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function ensureWorkspace() {
  const paths = getWorkspacePaths();
  await fs.mkdir(paths.tasksDir, { recursive: true });
  await fs.mkdir(paths.knowledgeDir, { recursive: true });

  try {
    await fs.access(paths.backlogPath);
  } catch {
    await fs.writeFile(paths.backlogPath, BACKLOG_PLACEHOLDER, "utf8");
  }

  return paths;
}

function filterTask(task: TaskDocument, filters: TaskFilters): boolean {
  if (!filters.includeDone && task.frontmatter.status === "d") return false;
  if (filters.category?.length && !filters.category.includes(task.frontmatter.category)) return false;
  if (filters.priority?.length && !filters.priority.includes(task.frontmatter.priority)) return false;
  if (filters.status?.length && !filters.status.includes(task.frontmatter.status)) return false;

  return true;
}

function statusTimeInsights(hour: number): string[] {
  if (hour >= 6 && hour < 12) return ["Morning window: lock one deep-work milestone before noon."];
  if (hour >= 12 && hour < 17) return ["Midday window: push execution tasks and clear one blocker."];
  if (hour >= 17 && hour < 22) return ["Evening window: close admin loops and prep tomorrow's top 3."];
  return ["Off-hours: capture ideas quickly and keep momentum lightweight."];
}

export async function listTasks(filters: TaskFilters = {}): Promise<TaskDocument[]> {
  const paths = await ensureWorkspace();
  const files = await fs.readdir(paths.tasksDir);
  const mdFiles = files.filter((file) => file.endsWith(".md") && file !== "README.md");

  const tasks = await Promise.all(
    mdFiles.map(async (file) => {
      const raw = await fs.readFile(path.join(paths.tasksDir, file), "utf8");
      return parseTaskDocument(file, raw);
    })
  );

  return tasks.filter((task) => filterTask(task, filters));
}

export async function getTask(filename: string): Promise<TaskDocument | null> {
  const paths = await ensureWorkspace();
  const safeName = ensureMdExtension(filename);
  const taskPath = path.join(paths.tasksDir, safeName);

  try {
    const raw = await fs.readFile(taskPath, "utf8");
    return parseTaskDocument(safeName, raw);
  } catch {
    return null;
  }
}

export async function createTask(input: {
  title: string;
  category?: string;
  priority?: TaskPriority;
  estimated_time?: number;
  due_date?: string;
  resource_refs?: string[];
  content?: string;
}): Promise<TaskDocument> {
  if (!input.title.trim()) throw new Error("Task title is required.");

  const paths = await ensureWorkspace();
  const baseFilename = normalizeFilename(input.title);
  let filename = baseFilename;
  let iteration = 2;

  while (true) {
    try {
      await fs.access(path.join(paths.tasksDir, filename));
      filename = baseFilename.replace(/\.md$/, `-${iteration}.md`);
      iteration += 1;
    } catch {
      break;
    }
  }

  const frontmatter: TaskFrontmatter = {
    title: input.title.trim(),
    category: input.category?.trim() || "other",
    priority: input.priority || "P2",
    status: "n",
    created_date: nowDate(),
    due_date: input.due_date,
    estimated_time: input.estimated_time,
    resource_refs: input.resource_refs
  };

  const body = input.content?.trim()
    ? input.content
    : `# ${frontmatter.title}\n\n## Context\nAligned to current priorities and backlog triage.\n\n## Next Actions\n- [ ] Define completion criteria\n- [ ] Execute first concrete step\n\n## Progress Log\n- ${nowDate()}: Task created from web interface.\n`;

  const document: TaskDocument = {
    filename,
    frontmatter,
    body
  };

  await fs.writeFile(path.join(paths.tasksDir, filename), serializeTaskDocument(document), "utf8");
  return document;
}

export async function updateTaskStatus(filename: string, status: TaskStatus): Promise<TaskDocument> {
  const existing = await getTask(filename);
  if (!existing) {
    throw new Error(`Task not found: ${filename}`);
  }

  existing.frontmatter.status = status;

  if (existing.body.includes("## Progress Log")) {
    existing.body = `${existing.body}\n- ${nowDate()}: Status updated to ${status}.`;
  } else {
    existing.body = `${existing.body}\n\n## Progress Log\n- ${nowDate()}: Status updated to ${status}.`;
  }

  const paths = await ensureWorkspace();
  await fs.writeFile(path.join(paths.tasksDir, ensureMdExtension(filename)), serializeTaskDocument(existing), "utf8");

  return existing;
}

export async function readBacklogRaw(): Promise<string> {
  const paths = await ensureWorkspace();
  return fs.readFile(paths.backlogPath, "utf8");
}

export async function appendCapture(item: string): Promise<{ appended: string; backlog_items: number }> {
  const clean = item.trim();
  if (!clean) throw new Error("Capture text cannot be empty.");

  const raw = await readBacklogRaw();
  const nextLine = `- ${clean}`;

  const next = raw.trim().length === 0 ? `${BACKLOG_PLACEHOLDER}\n${nextLine}\n` : `${raw.trimEnd()}\n${nextLine}\n`;
  const paths = await ensureWorkspace();

  await fs.writeFile(paths.backlogPath, next, "utf8");

  return {
    appended: clean,
    backlog_items: parseBacklogItems(next).length
  };
}

export async function clearBacklog(): Promise<void> {
  const paths = await ensureWorkspace();
  await fs.writeFile(paths.backlogPath, BACKLOG_PLACEHOLDER, "utf8");
}

export async function processBacklogFromFile(): Promise<BacklogProcessResult> {
  const raw = await readBacklogRaw();
  const items = parseBacklogItems(raw);
  const tasks = await listTasks({ includeDone: true });

  return processBacklog(items, tasks);
}

export async function getGoals(): Promise<GoalsResponse> {
  const paths = await ensureWorkspace();

  try {
    const raw = await fs.readFile(paths.goalsPath, "utf8");

    const findAfter = (heading: string): string | undefined => {
      const lines = raw.split("\n");
      const index = lines.findIndex((line) => line.trim() === heading);
      if (index < 0) return undefined;

      for (let i = index + 1; i < lines.length; i += 1) {
        const line = lines[i].trim();
        if (!line) continue;
        if (line.startsWith("#")) break;
        return line;
      }

      return undefined;
    };

    return {
      raw,
      highlights: {
        role: findAfter("### What's your current role?"),
        vision: findAfter("### What's your primary professional vision? What are you building toward?"),
        yearlySuccess: findAfter("### In 12 months, what would make you think 'this was a successful year'?"),
        quarterObjective: findAfter("### What are your objectives for THIS QUARTER (next 90 days)?"),
        topPriorities: findAfter("## What are your top 3 priorities right now?")
      }
    };
  } catch {
    return {
      raw: "",
      highlights: {}
    };
  }
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const tasks = await listTasks({ includeDone: false });
  const rawBacklog = await readBacklogRaw();

  const priority_distribution = tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.frontmatter.priority] = (acc[task.frontmatter.priority] ?? 0) + 1;
    return acc;
  }, {});

  const status_distribution = tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.frontmatter.status] = (acc[task.frontmatter.status] ?? 0) + 1;
    return acc;
  }, {});

  const category_distribution = tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.frontmatter.category] = (acc[task.frontmatter.category] ?? 0) + 1;
    return acc;
  }, {});

  const now = new Date();

  return {
    total_active_tasks: tasks.length,
    priority_distribution,
    status_distribution,
    category_distribution,
    backlog_items: parseBacklogItems(rawBacklog).length,
    time_insights: statusTimeInsights(now.getHours()),
    timestamp: now.toISOString()
  };
}

export async function getSettings() {
  const paths = await ensureWorkspace();
  return {
    root: paths.root,
    tasksDir: paths.tasksDir,
    knowledgeDir: paths.knowledgeDir,
    backlogPath: paths.backlogPath,
    goalsPath: paths.goalsPath,
    mcpBridgeUrl: process.env.MCP_BRIDGE_URL ?? null,
    assistantFlags: getAssistantFeatureFlags()
  };
}
