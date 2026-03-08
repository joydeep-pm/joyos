import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { parseTaskDocument } from "@/lib/markdown";
import { getWorkspacePaths } from "@/lib/path";
import type {
  AssistantContext,
  AssistantContextIndexFile,
  DriftAlert,
  DriftAlertType,
  GoalSignal,
  KnowledgeSignal,
  LinkMode,
  TaskDocument,
  TaskGoalLink,
  TaskPriority,
  TaskSignal,
  TaskStatus
} from "@/lib/types";
import { fileStats, getAssistantCachePath, readJsonFile, writeJsonFile } from "@/lib/assistant/storage";

const INDEX_FILE = "context-index.json";
const SUMMARY_FILE = "context-summaries.json";
const CONTEXT_INDEX_VERSION = 1;

interface SourceFileDescriptor {
  path: string;
  mtimeMs: number;
  size: number;
}

interface TaskWithMeta {
  task: TaskDocument;
  filePath: string;
  mtimeMs: number;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

function overlapScore(a: string[], b: string[]): number {
  const left = new Set(a);
  const right = new Set(b);

  if (left.size === 0 || right.size === 0) return 0;

  const overlap = [...left].filter((item) => right.has(item)).length;
  return overlap / new Set([...left, ...right]).size;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function priorityWeight(priority: TaskPriority): number {
  if (priority === "P0") return 1;
  if (priority === "P1") return 0.8;
  if (priority === "P2") return 0.5;
  return 0.2;
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function hasUncheckedActions(body: string): boolean {
  return /-\s*\[\s\]/.test(body);
}

function deriveKnowledgeRefs(task: TaskDocument): string[] {
  const refs = new Set<string>();

  for (const ref of task.frontmatter.resource_refs ?? []) {
    if (ref.includes("Knowledge/")) refs.add(ref.replace(/^\.\//, ""));
  }

  const matches = task.body.match(/Knowledge\/[A-Za-z0-9_\-/\.]+\.md/g) ?? [];
  for (const match of matches) refs.add(match);

  return [...refs];
}

async function listMarkdownFilesRecursive(root: string): Promise<string[]> {
  const result: string[] = [];

  async function walk(current: string) {
    let entries: Dirent[] = [];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md") {
        result.push(full);
      }
    }
  }

  await walk(root);

  return result.sort((left, right) => left.localeCompare(right));
}

async function collectSourceFiles(): Promise<SourceFileDescriptor[]> {
  const workspace = getWorkspacePaths();
  const sourceFiles: SourceFileDescriptor[] = [];

  const goalsStats = await fileStats(workspace.goalsPath);
  if (goalsStats) {
    sourceFiles.push({
      path: workspace.goalsPath,
      mtimeMs: goalsStats.mtimeMs,
      size: goalsStats.size
    });
  }

  const taskFiles = await listMarkdownFilesRecursive(workspace.tasksDir);
  const knowledgeFiles = await listMarkdownFilesRecursive(workspace.knowledgeDir);

  for (const file of [...taskFiles, ...knowledgeFiles]) {
    const stats = await fileStats(file);
    if (!stats) continue;
    sourceFiles.push({
      path: file,
      mtimeMs: stats.mtimeMs,
      size: stats.size
    });
  }

  return sourceFiles.sort((left, right) => left.path.localeCompare(right.path));
}

function sourceFilesEqual(left: SourceFileDescriptor[], right: SourceFileDescriptor[]): boolean {
  if (left.length !== right.length) return false;

  for (let i = 0; i < left.length; i += 1) {
    const a = left[i];
    const b = right[i];
    if (a.path !== b.path || a.mtimeMs !== b.mtimeMs || a.size !== b.size) {
      return false;
    }
  }

  return true;
}

async function loadTasksWithMeta(): Promise<TaskWithMeta[]> {
  const workspace = getWorkspacePaths();
  const files = await listMarkdownFilesRecursive(workspace.tasksDir);
  const output: TaskWithMeta[] = [];

  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    const stat = await fs.stat(file);
    output.push({
      filePath: file,
      mtimeMs: stat.mtimeMs,
      task: parseTaskDocument(path.basename(file), raw)
    });
  }

  return output;
}

function buildGoalSignals(goalsRaw: string): GoalSignal[] {
  const lines = goalsRaw.split("\n");
  const goals: GoalSignal[] = [];
  const slugCount = new Map<string, number>();

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line.startsWith("### ") && !line.startsWith("## ")) continue;

    if (
      line.startsWith("## Priority Framework") ||
      line.startsWith("## Current Context") ||
      line.startsWith("## Success Criteria") ||
      line.startsWith("## Strategic Context")
    ) {
      continue;
    }

    const title = line.replace(/^#+\s*/, "").trim();
    if (!title) continue;

    const summaryLines: string[] = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      const next = lines[j].trim();
      if (!next) {
        if (summaryLines.length) break;
        continue;
      }
      if (next.startsWith("#")) break;
      summaryLines.push(next.replace(/^[-*]\s*/, ""));
      if (summaryLines.length >= 2) break;
    }

    const summary = summaryLines.join(" ").trim();
    if (!summary) continue;

    const baseSlug = slugify(title) || "goal";
    const seen = (slugCount.get(baseSlug) ?? 0) + 1;
    slugCount.set(baseSlug, seen);

    goals.push({
      id: seen === 1 ? baseSlug : `${baseSlug}-${seen}`,
      title,
      summary,
      keywords: Array.from(new Set(tokenize(`${title} ${summary}`))).slice(0, 12),
      source: "GOALS.md"
    });
  }

  return goals;
}

function buildKnowledgeSignals(rawKnowledge: { file: string; content: string }[], root: string): KnowledgeSignal[] {
  return rawKnowledge.map(({ file, content }, index) => {
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const titleFromHeading = lines.find((line) => line.startsWith("# "))?.replace(/^#\s*/, "").trim();
    const title = titleFromHeading || path.basename(file, ".md").replace(/[-_]/g, " ");

    const summaryLine = lines.find((line) => !line.startsWith("#")) ?? "No summary available.";

    return {
      id: `knowledge-${index + 1}`,
      path: path.relative(root, file).replace(/\\/g, "/"),
      title,
      summary: summaryLine.slice(0, 240),
      keywords: Array.from(new Set(tokenize(`${title} ${summaryLine}`))).slice(0, 14),
      linkedTaskIds: []
    };
  });
}

function inferTaskGoalLinks(taskSignals: TaskSignal[], goals: GoalSignal[]): TaskGoalLink[] {
  const links: TaskGoalLink[] = [];

  for (const taskSignal of taskSignals) {
    const taskTokens = tokenize(`${taskSignal.title} ${taskSignal.knowledgeRefs.join(" ")}`);
    let bestScore = 0;
    let bestGoal: GoalSignal | null = null;

    for (const goal of goals) {
      const directMatch =
        taskSignal.title.toLowerCase().includes(goal.title.toLowerCase()) ||
        taskSignal.title.toLowerCase().includes(goal.summary.toLowerCase());
      const inferredScore = overlapScore(taskTokens, goal.keywords);

      if (directMatch || inferredScore >= 0.12) {
        const score = directMatch ? 1 : Number(inferredScore.toFixed(2));
        const mode: LinkMode = directMatch ? "direct" : "inferred";
        links.push({
          taskId: taskSignal.taskId,
          goalId: goal.id,
          mode,
          score
        });
      }

      if (inferredScore > bestScore) {
        bestScore = inferredScore;
        bestGoal = goal;
      }
    }

    const isHighPriority = taskSignal.priority === "P0" || taskSignal.priority === "P1";
    const hasAnyLink = links.some((link) => link.taskId === taskSignal.taskId);

    if (isHighPriority && !hasAnyLink && bestGoal) {
      links.push({
        taskId: taskSignal.taskId,
        goalId: bestGoal.id,
        mode: "inferred",
        score: Number(Math.max(0.05, bestScore).toFixed(2))
      });
    }
  }

  return links;
}

function computeUrgency(priority: TaskPriority, status: TaskStatus, dueDate?: string): number {
  let score = priorityWeight(priority);

  const due = parseDate(dueDate);
  if (due) {
    const now = Date.now();
    const diffDays = (due.getTime() - now) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) score += 0.4;
    else if (diffDays <= 1) score += 0.3;
    else if (diffDays <= 3) score += 0.2;
    else if (diffDays <= 7) score += 0.1;
  }

  if (status === "b") score -= 0.25;
  if (status === "d") score = 0;

  return Number(clamp(score, 0, 1).toFixed(2));
}

function buildDriftAlerts(taskSignals: TaskSignal[], taskMtimes: Record<string, number>): DriftAlert[] {
  const alerts: DriftAlert[] = [];

  const now = Date.now();
  for (const taskSignal of taskSignals) {
    if (taskSignal.status === "d") continue;

    const isHighPriority = taskSignal.priority === "P0" || taskSignal.priority === "P1";
    const due = parseDate(taskSignal.dueDate);

    if (isHighPriority && due && due.getTime() < now) {
      alerts.push({
        id: `${taskSignal.taskId}-overdue`,
        taskId: taskSignal.taskId,
        type: "overdue_high_priority",
        severity: "high",
        message: `${taskSignal.title} is overdue and still high priority.`
      });
      taskSignal.driftFlags.push("overdue_high_priority");
    }

    const mtime = taskMtimes[taskSignal.filename] ?? now;
    const staleMs = now - mtime;
    if (taskSignal.status === "b" && staleMs >= 48 * 60 * 60 * 1000) {
      alerts.push({
        id: `${taskSignal.taskId}-blocked-stale`,
        taskId: taskSignal.taskId,
        type: "blocked_stale",
        severity: "medium",
        message: `${taskSignal.title} has been blocked for more than 48 hours.`
      });
      taskSignal.driftFlags.push("blocked_stale");
    }

    if (isHighPriority && !taskSignal.hasNextAction) {
      alerts.push({
        id: `${taskSignal.taskId}-missing-next`,
        taskId: taskSignal.taskId,
        type: "missing_next_action",
        severity: "medium",
        message: `${taskSignal.title} is high priority but lacks a clear next action.`
      });
      taskSignal.driftFlags.push("missing_next_action");
    }
  }

  return alerts;
}

async function buildContext(): Promise<AssistantContext> {
  const workspace = getWorkspacePaths();

  let goalsRaw = "";
  try {
    goalsRaw = await fs.readFile(workspace.goalsPath, "utf8");
  } catch {
    goalsRaw = "";
  }

  const goalSignals = buildGoalSignals(goalsRaw);

  const tasksWithMeta = await loadTasksWithMeta();
  const taskSignals: TaskSignal[] = tasksWithMeta.map(({ task }) => ({
    taskId: task.filename,
    filename: task.filename,
    title: task.frontmatter.title,
    priority: task.frontmatter.priority,
    status: task.frontmatter.status,
    dueDate: task.frontmatter.due_date,
    alignmentScore: 0,
    urgencyScore: computeUrgency(task.frontmatter.priority, task.frontmatter.status, task.frontmatter.due_date),
    goalIds: [],
    knowledgeRefs: deriveKnowledgeRefs(task),
    hasNextAction: hasUncheckedActions(task.body),
    driftFlags: []
  }));

  const knowledgeFiles = await listMarkdownFilesRecursive(workspace.knowledgeDir);
  const rawKnowledge = await Promise.all(
    knowledgeFiles.map(async (file) => ({
      file,
      content: await fs.readFile(file, "utf8")
    }))
  );

  const knowledgeSignals = buildKnowledgeSignals(rawKnowledge, workspace.root);

  for (const task of taskSignals) {
    for (const signal of knowledgeSignals) {
      if (task.knowledgeRefs.includes(signal.path)) {
        signal.linkedTaskIds.push(task.taskId);
      }
    }
  }

  const links = inferTaskGoalLinks(taskSignals, goalSignals);

  for (const task of taskSignals) {
    const taskLinks = links.filter((link) => link.taskId === task.taskId);
    task.goalIds = taskLinks.map((link) => link.goalId);
    task.alignmentScore = Number(
      Math.max(
        0,
        ...taskLinks.map((link) => link.score)
      ).toFixed(2)
    );
  }

  const taskMtimes = Object.fromEntries(tasksWithMeta.map(({ task, mtimeMs }) => [task.filename, mtimeMs]));
  const driftAlerts = buildDriftAlerts(taskSignals, taskMtimes);

  const activeHighPriority = taskSignals.filter(
    (task) => task.status !== "d" && (task.priority === "P0" || task.priority === "P1")
  );

  const context: AssistantContext = {
    generatedAt: new Date().toISOString(),
    indexVersion: CONTEXT_INDEX_VERSION,
    goals: goalSignals,
    tasks: taskSignals,
    knowledge: knowledgeSignals,
    links,
    driftAlerts,
    stats: {
      activeTasks: taskSignals.filter((task) => task.status !== "d").length,
      linkedHighPriorityTasks: activeHighPriority.filter((task) => task.goalIds.length > 0).length,
      unlinkedHighPriorityTasks: activeHighPriority.filter((task) => task.goalIds.length === 0).length,
      staleBlockedTasks: driftAlerts.filter((alert) => alert.type === "blocked_stale").length
    }
  };

  return context;
}

export async function getAssistantContext(options: { force?: boolean } = {}): Promise<{
  context: AssistantContext;
  cacheHit: boolean;
  durationMs: number;
}> {
  const started = Date.now();
  const indexPath = getAssistantCachePath(INDEX_FILE);
  const summaryPath = getAssistantCachePath(SUMMARY_FILE);

  const currentSources = await collectSourceFiles();

  const cachedIndex = await readJsonFile<AssistantContextIndexFile | null>(indexPath, null);
  const cachedSummary = await readJsonFile<AssistantContext | null>(summaryPath, null);

  if (!options.force && cachedIndex && cachedSummary) {
    const matches = sourceFilesEqual(
      currentSources,
      cachedIndex.files.map((file) => ({ path: file.path, mtimeMs: file.mtimeMs, size: file.size }))
    );

    if (matches) {
      return {
        context: cachedSummary,
        cacheHit: true,
        durationMs: Date.now() - started
      };
    }
  }

  const context = await buildContext();

  const indexPayload: AssistantContextIndexFile = {
    version: CONTEXT_INDEX_VERSION,
    generatedAt: context.generatedAt,
    files: currentSources
  };

  await writeJsonFile(indexPath, indexPayload);
  await writeJsonFile(summaryPath, context);

  return {
    context,
    cacheHit: false,
    durationMs: Date.now() - started
  };
}

export async function rebuildAssistantContext(): Promise<{
  context: AssistantContext;
  durationMs: number;
}> {
  const rebuilt = await getAssistantContext({ force: true });
  return {
    context: rebuilt.context,
    durationMs: rebuilt.durationMs
  };
}
