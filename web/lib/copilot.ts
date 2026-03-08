import { parseBacklogItems } from "@/lib/backlog";
import { getAssistantAlerts, resolveAssistantAlert } from "@/lib/assistant/alert-engine";
import { createCommsDraft, approveCommsDraft, sendCommsDraft } from "@/lib/assistant/comms-engine";
import { getAssistantContext } from "@/lib/assistant/context-engine";
import { getOutcomeClosureKpi } from "@/lib/assistant/kpi-engine";
import { commitDayPlan, listAssistantQueueItems } from "@/lib/assistant/queue-engine";
import { getWeeklyReview } from "@/lib/assistant/review-engine";
import { generateDailyBrief } from "@/lib/assistant/brief-engine";
import { getTrendPoints } from "@/lib/assistant/trend-engine";
import {
  appendCapture,
  clearBacklog,
  getGoals,
  getSystemStatus,
  listTasks,
  processBacklogFromFile,
  readBacklogRaw,
  updateTaskStatus
} from "@/lib/file-store";
import { topFocusTasks } from "@/lib/scoring";
import type { AssistantAlert, AssistantQueueItem, CopilotReply, DailyBrief, TaskDocument, TaskStatus, WeeklyReview } from "@/lib/types";

function suggestionSet(...items: string[]): string[] {
  return Array.from(new Set(items));
}

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function similarity(a: string, b: string): number {
  const left = new Set(tokens(a));
  const right = new Set(tokens(b));

  if (left.size === 0 || right.size === 0) return 0;

  const overlap = [...left].filter((item) => right.has(item)).length;
  return overlap / new Set([...left, ...right]).size;
}

function pickTask(query: string, tasks: TaskDocument[]): TaskDocument | null {
  const needle = query.toLowerCase().trim();

  const exact = tasks.find((task) => task.frontmatter.title.toLowerCase() === needle);
  if (exact) return exact;

  const contains = tasks.find((task) => task.frontmatter.title.toLowerCase().includes(needle));
  if (contains) return contains;

  const scored = tasks
    .map((task) => ({ task, score: similarity(needle, task.frontmatter.title) }))
    .sort((left, right) => right.score - left.score);

  return scored[0] && scored[0].score >= 0.2 ? scored[0].task : null;
}

function parseStatusIntent(text: string): { query: string; status: TaskStatus } | null {
  const done = text.match(/(?:mark|set|move|complete)\s+(.+?)\s+(?:as\s+)?done/);
  if (done?.[1]) return { query: done[1], status: "d" };

  const start = text.match(/(?:start|resume|set)\s+(.+?)\s+(?:as\s+)?(?:in\s+progress|started)/);
  if (start?.[1]) return { query: start[1], status: "s" };

  const block = text.match(/(?:block|set)\s+(.+?)\s+(?:as\s+)?blocked/);
  if (block?.[1]) return { query: block[1], status: "b" };

  const reopen = text.match(/(?:reopen|reset|set)\s+(.+?)\s+(?:as\s+)?(?:not\s+started|todo|open)/);
  if (reopen?.[1]) return { query: reopen[1], status: "n" };

  return null;
}

function formatFocus(tasks: TaskDocument[]): string {
  if (tasks.length === 0) {
    return "I could not find active tasks. Capture notes or triage backlog first.";
  }

  const lines = tasks.map(
    (task, index) =>
      `${index + 1}. [${task.frontmatter.priority}] ${task.frontmatter.title}${task.frontmatter.due_date ? ` (due ${task.frontmatter.due_date})` : ""}`
  );

  return `Top focus right now:\n${lines.join("\n")}`;
}

function formatBrief(brief: DailyBrief): string {
  if (brief.topOutcomes.length === 0) {
    return "Daily brief is empty. Triage backlog and activate more tasks.";
  }

  const outcomes = brief.topOutcomes
    .map(
      (item, index) =>
        `${index + 1}. [${item.priority}] ${item.title}\n   Why now: ${item.whyNow}\n   Goal: ${item.goalReference}`
    )
    .join("\n");

  const risks = brief.predictedRisks.length
    ? brief.predictedRisks.map((risk) => `- (${risk.severity}) ${risk.message}`).join("\n")
    : "- No major drift risk flagged.";

  return `Daily brief for ${brief.date}:\n${outcomes}\n\nRisks:\n${risks}`;
}

function formatQueue(items: AssistantQueueItem[]): string {
  if (items.length === 0) {
    return "Action queue is empty. Run 'commit day plan' to seed it.";
  }

  return `Assistant queue:\n${items
    .slice(0, 6)
    .map((item, index) => `${index + 1}. ${item.title} [${item.priority}] -> ${item.status} (${item.id})`)
    .join("\n")}`;
}

function formatWeeklyReview(review: WeeklyReview, target: number): string {
  const header = `Weekly review ${review.window.weekId} (${review.window.startDate} to ${review.window.endDate})`;
  const score = `Committed: ${review.scorecard.committedCount}, Completed: ${review.scorecard.completedCount}, Rollover: ${review.scorecard.rolloverCount}, Closure: ${Math.round(review.scorecard.closureRate * 100)}% (target ${Math.round(target * 100)}%)`;
  const outcomes = review.outcomes
    .slice(0, 5)
    .map((item, index) => `${index + 1}. [${item.priority}] ${item.title} -> ${item.completed ? "done" : "open"}`)
    .join("\n");

  return `${header}\n${score}${outcomes ? `\nTop outcomes:\n${outcomes}` : ""}`;
}

function formatAssistantAlerts(alerts: AssistantAlert[]): string {
  if (alerts.length === 0) return "No active drift/WIP alerts right now.";

  return `Active alerts:\n${alerts
    .slice(0, 6)
    .map((alert, index) => {
      if (alert.type === "wip_limit") {
        return `${index + 1}. [${alert.severity}] ${alert.message} (${alert.id})`;
      }
      return `${index + 1}. [${alert.severity}] ${alert.taskTitle}: ${alert.fromPriority} -> ${alert.toPriority} (${alert.id})`;
    })
    .join("\n")}`;
}

function statusLabel(status: TaskStatus): string {
  if (status === "d") return "done";
  if (status === "s") return "in progress";
  if (status === "b") return "blocked";
  return "not started";
}

function parseCapture(message: string): string | null {
  const patterns = [
    /^capture\s+(.+)$/i,
    /^note\s*:\s*(.+)$/i,
    /^add\s+(.+)\s+to\s+backlog$/i,
    /^backlog\s*:\s*(.+)$/i
  ];

  for (const pattern of patterns) {
    const matched = message.match(pattern);
    if (matched?.[1]) return matched[1].trim();
  }

  return null;
}

export async function handleCopilotMessage(message: string): Promise<CopilotReply> {
  const text = message.trim();
  if (!text) {
    return {
      source: "fallback",
      reply: "Share what you want to do, for example: 'what should I work on today?'",
      suggestions: suggestionSet("what should I work on today?", "process backlog", "show blocked tasks")
    };
  }

  const lowered = text.toLowerCase();

  if (/(help|what can you do|commands)/.test(lowered)) {
    return {
      source: "fallback",
      reply:
        "I can generate a daily brief, commit top outcomes, show queue/drift context, draft outbound updates with approval, plus task and backlog actions. Examples: 'daily brief', 'commit day plan', 'draft stakeholder update', 'process backlog'.",
      suggestions: suggestionSet(
        "daily brief",
        "commit day plan",
        "show assistant queue",
        "draft stakeholder update"
      )
    };
  }

  if (/(assistant context|context signals|rebuild context)/.test(lowered)) {
    const force = /(rebuild|refresh)/.test(lowered);
    const context = await getAssistantContext({ force });
    const stats = context.context.stats;

    return {
      source: "fallback",
      reply: `Context ${force ? "rebuilt" : "loaded"} in ${context.durationMs}ms. Active tasks: ${stats.activeTasks}, linked high-priority: ${stats.linkedHighPriorityTasks}, unlinked high-priority: ${stats.unlinkedHighPriorityTasks}, stale blocked: ${stats.staleBlockedTasks}.`,
      suggestions: suggestionSet("daily brief", "commit day plan", "show assistant queue")
    };
  }

  if (/(daily brief|morning brief|assistant brief)/.test(lowered)) {
    const date = new Date().toISOString().slice(0, 10);
    const brief = await generateDailyBrief(date);
    return {
      source: "fallback",
      reply: formatBrief(brief),
      suggestions: suggestionSet("commit day plan", "show assistant queue", "draft stakeholder update")
    };
  }

  if (/(commit day plan|commit plan|lock top 3|commit top 3)/.test(lowered)) {
    const date = new Date().toISOString().slice(0, 10);
    const committed = await commitDayPlan({ date });
    return {
      source: "fallback",
      reply: `Committed ${committed.items.length} outcomes for ${date}. Queue updated.`,
      suggestions: suggestionSet("show assistant queue", "daily brief", "draft stakeholder update"),
      executed: {
        id: "assistant_commit_plan",
        summary: committed.commitment.id
      }
    };
  }

  if (/(weekly review|review week|outcome closure)/.test(lowered)) {
    const [review, kpi] = await Promise.all([getWeeklyReview(), getOutcomeClosureKpi()]);
    return {
      source: "fallback",
      reply: formatWeeklyReview(review, kpi.target),
      suggestions: suggestionSet("show drift alerts", "show assistant queue", "daily brief")
    };
  }

  if (/(show drift alerts|show alerts|wip alerts|priority drift)/.test(lowered)) {
    const alerts = await getAssistantAlerts();
    return {
      source: "fallback",
      reply: formatAssistantAlerts(alerts),
      suggestions: suggestionSet("resolve alert <id>", "weekly review", "draft blocker follow-up")
    };
  }

  const resolveAlertMatch = lowered.match(/resolve\s+alert\s+([^\s]+)/);
  if (resolveAlertMatch?.[1]) {
    const resolved = await resolveAssistantAlert({
      alertId: resolveAlertMatch[1],
      actor: "copilot-user"
    });
    return {
      source: "fallback",
      reply: resolved.actionResult ?? `Resolved alert ${resolved.alertId}.`,
      suggestions: suggestionSet("show drift alerts", "weekly review")
    };
  }

  if (/(trend snapshot|show trends|weekly trends)/.test(lowered)) {
    const points = await getTrendPoints();
    const lines = points
      .slice(-5)
      .map((point) => `${point.date}: committed ${point.committed}, completed ${point.completed}, closure ${Math.round(point.closureRate * 100)}%`)
      .join("\n");
    return {
      source: "fallback",
      reply: `Recent trend snapshots:\n${lines}`,
      suggestions: suggestionSet("weekly review", "show drift alerts")
    };
  }

  if (/(show assistant queue|action queue|queue status)/.test(lowered)) {
    const queue = await listAssistantQueueItems();
    return {
      source: "fallback",
      reply: formatQueue(queue),
      suggestions: suggestionSet("commit day plan", "daily brief", "draft blocker follow-up")
    };
  }

  if (/(draft stakeholder update|stakeholder draft|create update draft)/.test(lowered)) {
    const draft = await createCommsDraft({
      type: "stakeholder_update",
      actor: "copilot"
    });
    return {
      source: "fallback",
      reply: `Created draft ${draft.id} for ${draft.destination}.\nSubject: ${draft.subject}\n\nApprove before send.`,
      suggestions: suggestionSet(`approve draft ${draft.id}`, `send draft ${draft.id}`, "show assistant queue"),
      executed: {
        id: "assistant_draft_comms",
        summary: draft.id
      }
    };
  }

  if (/(draft blocker follow-up|draft blocked followup|draft blocked follow-up)/.test(lowered)) {
    const draft = await createCommsDraft({
      type: "blocked_followup",
      actor: "copilot"
    });
    return {
      source: "fallback",
      reply: `Created blocker follow-up draft ${draft.id}. Approve before send.`,
      suggestions: suggestionSet(`approve draft ${draft.id}`, `send draft ${draft.id}`, "daily brief"),
      executed: {
        id: "assistant_draft_comms",
        summary: draft.id
      }
    };
  }

  const approveDraftMatch = lowered.match(/approve\s+draft\s+([a-z0-9_-]+)/);
  if (approveDraftMatch?.[1]) {
    const approval = await approveCommsDraft(approveDraftMatch[1], "copilot-user");
    return {
      source: "fallback",
      reply: `Draft ${approval.draftId} approved. Token issued: ${approval.approvalToken.slice(0, 8)}...`,
      suggestions: suggestionSet(`send draft ${approval.draftId}`, "show assistant queue")
    };
  }

  const sendDraftMatch = lowered.match(/send\s+draft\s+([a-z0-9_-]+)/);
  if (sendDraftMatch?.[1]) {
    const sent = await sendCommsDraft(sendDraftMatch[1], "copilot-user");
    return {
      source: "fallback",
      reply: sent.status === "sent" ? `Draft ${sent.draftId} sent to ${sent.destination}.` : sent.message,
      suggestions: suggestionSet("daily brief", "show assistant queue")
    };
  }

  const captureText = parseCapture(text);
  if (captureText) {
    const captured = await appendCapture(captureText);
    return {
      source: "fallback",
      reply: `Captured: "${captured.appended}". Backlog now has ${captured.backlog_items} item(s).`,
      suggestions: suggestionSet("process backlog", "what should I work on today?"),
      executed: {
        id: "capture_item",
        summary: captured.appended
      }
    };
  }

  if (/(process|triage).*(backlog)/.test(lowered)) {
    const result = await processBacklogFromFile();
    return {
      source: "fallback",
      reply: `Backlog processed. Ready: ${result.summary.new_tasks}, duplicates: ${result.summary.duplicates_found}, clarification needed: ${result.summary.needs_clarification}.`,
      suggestions: suggestionSet("open triage page", "clear backlog", "what should I work on today?"),
      executed: {
        id: "process_backlog",
        summary: `items=${result.summary.total_items}`
      }
    };
  }

  if (/(clear).*(backlog)/.test(lowered)) {
    await clearBacklog();
    return {
      source: "fallback",
      reply: "Backlog cleared and reset to placeholder.",
      suggestions: suggestionSet("capture roadmap risk note", "what should I work on today?"),
      executed: {
        id: "clear_backlog",
        summary: "BACKLOG.md reset"
      }
    };
  }

  if (/(show|list).*(blocked)/.test(lowered)) {
    const blocked = await listTasks({ status: ["b"], includeDone: true });
    if (blocked.length === 0) {
      return {
        source: "fallback",
        reply: "No blocked tasks right now.",
        suggestions: suggestionSet("what should I work on today?", "process backlog")
      };
    }

    return {
      source: "fallback",
      reply: `Blocked tasks:\n${blocked.map((task, index) => `${index + 1}. ${task.frontmatter.title}`).join("\n")}`,
      suggestions: suggestionSet("what should I work on today?", "set <task> as in progress")
    };
  }

  const statusIntent = parseStatusIntent(lowered);
  if (statusIntent) {
    const tasks = await listTasks({ includeDone: true });
    const matched = pickTask(statusIntent.query, tasks);

    if (!matched) {
      return {
        source: "fallback",
        reply: `I couldn't find a task matching "${statusIntent.query}". Try using part of the exact task title.`,
        suggestions: suggestionSet("show tasks", "what should I work on today?")
      };
    }

    await updateTaskStatus(matched.filename, statusIntent.status);
    return {
      source: "fallback",
      reply: `Updated "${matched.frontmatter.title}" to ${statusLabel(statusIntent.status)}.`,
      suggestions: suggestionSet("what should I work on today?", "show blocked tasks"),
      executed: {
        id: "update_task_status",
        summary: `${matched.filename} -> ${statusIntent.status}`
      }
    };
  }

  if (/(what should i work on|priorit|focus|top 3|today)/.test(lowered)) {
    const tasks = await listTasks({ includeDone: false });
    const top = topFocusTasks(tasks, 3);
    return {
      source: "fallback",
      reply: formatFocus(top),
      suggestions: suggestionSet("start first task as in progress", "show blocked tasks", "process backlog")
    };
  }

  if (/(status|overview|summary)/.test(lowered)) {
    const [status, goals, rawBacklog] = await Promise.all([getSystemStatus(), getGoals(), readBacklogRaw()]);
    const backlogCount = parseBacklogItems(rawBacklog).length;
    return {
      source: "fallback",
      reply: `System status: ${status.total_active_tasks} active tasks, ${backlogCount} backlog items. Quarter objective: ${goals.highlights.quarterObjective ?? "not set"}.`,
      suggestions: suggestionSet("what should I work on today?", "process backlog", "show blocked tasks")
    };
  }

  const [tasks, goals] = await Promise.all([listTasks({ includeDone: false }), getGoals()]);
  const top = topFocusTasks(tasks, 2);

  return {
    source: "fallback",
    reply:
      `I understood your request but need a clearer command to act. Current top focus: ${top.map((task) => task.frontmatter.title).join(" | ") || "none"}. Quarter objective: ${goals.highlights.quarterObjective ?? "not set"}.`,
    suggestions: suggestionSet("what should I work on today?", "capture <note>", "process backlog", "show blocked tasks")
  };
}
