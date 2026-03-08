import { createCommsDraft } from "@/lib/assistant/comms-engine";
import { getAssistantContext } from "@/lib/assistant/context-engine";
import { getNextDayIso, commitDayPlan, listAssistantQueueItems, updateAssistantQueueItemStatus } from "@/lib/assistant/queue-engine";
import { getAssistantCachePath, readJsonFile, writeJsonFile } from "@/lib/assistant/storage";
import type {
  AssistantAlert,
  AssistantAlertState,
  CorrectiveAction,
  PriorityDriftAlert,
  TaskPriority,
  WipAlert
} from "@/lib/types";

const ALERT_STATE_FILE = "assistant-alert-state.json";
const WIP_LIMIT_DEFAULT = 3;

function nowIso(): string {
  return new Date().toISOString();
}

function defaultState(): AssistantAlertState {
  return {
    version: 1,
    snapshots: {},
    resolved: {}
  };
}

async function readState(): Promise<AssistantAlertState> {
  return readJsonFile(getAssistantCachePath(ALERT_STATE_FILE), defaultState());
}

async function writeState(state: AssistantAlertState): Promise<void> {
  await writeJsonFile(getAssistantCachePath(ALERT_STATE_FILE), state);
}

function priorityRank(priority: TaskPriority): number {
  if (priority === "P0") return 0;
  if (priority === "P1") return 1;
  if (priority === "P2") return 2;
  return 3;
}

function priorityShiftSeverity(fromPriority: TaskPriority, toPriority: TaskPriority): "high" | "medium" | "low" {
  const delta = priorityRank(fromPriority) - priorityRank(toPriority);
  if (delta >= 2 || toPriority === "P0") return "high";
  if (delta === 1) return "medium";
  return "low";
}

function createQueueAction(alertId: string, taskId: string, label: string, type: CorrectiveAction["type"]): CorrectiveAction {
  return {
    id: `${alertId}:${type}:${taskId}`,
    type,
    label,
    taskId,
    payload: { taskId }
  };
}

async function buildPriorityDriftAlerts(state: AssistantAlertState): Promise<PriorityDriftAlert[]> {
  const { context } = await getAssistantContext();
  const alerts: PriorityDriftAlert[] = [];

  for (const task of context.tasks) {
    if (task.status === "d") continue;

    const snapshot = state.snapshots[task.taskId];
    if (!snapshot) continue;

    if (snapshot.priority !== task.priority) {
      const id = `priority_drift:${task.taskId}:${snapshot.priority}->${task.priority}`;
      alerts.push({
        id,
        type: "priority_drift",
        taskId: task.taskId,
        taskTitle: task.title,
        fromPriority: snapshot.priority,
        toPriority: task.priority,
        changedAt: nowIso(),
        reason: "Task priority changed since the previous assistant snapshot.",
        severity: priorityShiftSeverity(snapshot.priority, task.priority),
        resolved: Boolean(state.resolved[id]),
        correctiveActions: [
          createQueueAction(id, task.taskId, "Move to in progress", "move_to_in_progress"),
          createQueueAction(id, task.taskId, "Mark awaiting input", "mark_awaiting_input")
        ]
      });
    }
  }

  for (const task of context.tasks) {
    if (task.status === "d") continue;
    state.snapshots[task.taskId] = {
      priority: task.priority,
      taskTitle: task.title,
      lastSeenAt: nowIso()
    };
  }

  return alerts;
}

async function buildWipAlerts(state: AssistantAlertState, dateIso: string): Promise<WipAlert[]> {
  const queue = await listAssistantQueueItems();
  const activeHighPriority = queue.filter(
    (item) =>
      (item.priority === "P0" || item.priority === "P1") &&
      item.status !== "done" &&
      item.status !== "dropped"
  );

  if (activeHighPriority.length <= WIP_LIMIT_DEFAULT) {
    return [];
  }

  const id = `wip_limit:${dateIso}:${activeHighPriority.length}`;
  const overflow = activeHighPriority.slice(WIP_LIMIT_DEFAULT);

  const correctiveActions: CorrectiveAction[] = [
    {
      id: `${id}:draft_blocker_followup`,
      type: "draft_blocker_followup",
      label: "Draft blocker follow-up",
      payload: { reason: "wip_limit" }
    }
  ];

  for (const item of overflow) {
    correctiveActions.push({
      id: `${id}:mark_awaiting_input:${item.taskId}`,
      type: "mark_awaiting_input",
      label: `Defer "${item.title}"`,
      taskId: item.taskId,
      payload: {
        taskId: item.taskId,
        queueItemId: item.id
      }
    });
    correctiveActions.push({
      id: `${id}:seed_next_day:${item.taskId}`,
      type: "seed_next_day",
      label: `Seed "${item.title}" for tomorrow`,
      taskId: item.taskId,
      payload: { taskId: item.taskId }
    });
  }

  return [
    {
      id,
      type: "wip_limit",
      activeHighPriorityCount: activeHighPriority.length,
      limit: WIP_LIMIT_DEFAULT,
      severity: "medium",
      message: `High-priority WIP is ${activeHighPriority.length}, above the limit of ${WIP_LIMIT_DEFAULT}.`,
      changedAt: nowIso(),
      resolved: Boolean(state.resolved[id]),
      correctiveActions
    }
  ];
}

async function findQueueItemIdByTaskId(taskId: string): Promise<string | null> {
  const queue = await listAssistantQueueItems();
  return queue.find((item) => item.taskId === taskId)?.id ?? null;
}

async function executeCorrectiveAction(action: CorrectiveAction, actor: string): Promise<string> {
  if (action.type === "move_to_in_progress") {
    const queueItemId = action.payload.queueItemId ?? (await findQueueItemIdByTaskId(action.taskId ?? ""));
    if (!queueItemId) return "No queue item available for move-to-in-progress action.";
    await updateAssistantQueueItemStatus(queueItemId, "in_progress");
    return "Queue item moved to in_progress.";
  }

  if (action.type === "mark_awaiting_input") {
    const queueItemId = action.payload.queueItemId ?? (await findQueueItemIdByTaskId(action.taskId ?? ""));
    if (!queueItemId) return "No queue item available for awaiting_input action.";
    await updateAssistantQueueItemStatus(queueItemId, "awaiting_input");
    return "Queue item moved to awaiting_input.";
  }

  if (action.type === "draft_blocker_followup") {
    const draft = await createCommsDraft({
      type: "blocked_followup",
      actor
    });
    return `Draft created: ${draft.id}.`;
  }

  if (action.type === "seed_next_day") {
    if (!action.taskId) return "Missing taskId for next-day seed action.";
    const tomorrow = getNextDayIso();
    await commitDayPlan({
      date: tomorrow,
      taskIds: [action.taskId],
      notes: `Seeded from alert action ${action.id}`
    });
    return `Task seeded into ${tomorrow} day plan.`;
  }

  return "No action executed.";
}

export async function getAssistantAlerts(options: {
  date?: string;
  includeResolved?: boolean;
} = {}): Promise<AssistantAlert[]> {
  const state = await readState();
  const date = options.date ?? new Date().toISOString().slice(0, 10);

  const [priorityDrift, wipAlerts] = await Promise.all([
    buildPriorityDriftAlerts(state),
    buildWipAlerts(state, date)
  ]);

  await writeState(state);

  const alerts: AssistantAlert[] = [...priorityDrift, ...wipAlerts];
  const filtered = options.includeResolved ? alerts : alerts.filter((alert) => !alert.resolved);

  return filtered.sort((left, right) => right.changedAt.localeCompare(left.changedAt));
}

export async function resolveAssistantAlert(input: {
  alertId: string;
  actionId?: string;
  actor?: string;
}): Promise<{ alertId: string; resolvedAt: string; actionResult?: string }> {
  const alerts = await getAssistantAlerts({ includeResolved: true });
  const alert = alerts.find((item) => item.id === input.alertId);

  if (!alert) {
    throw new Error(`Alert not found: ${input.alertId}`);
  }

  let actionResult: string | undefined;
  if (input.actionId) {
    const action = alert.correctiveActions.find((entry) => entry.id === input.actionId);
    if (!action) {
      throw new Error(`Corrective action not found: ${input.actionId}`);
    }
    actionResult = await executeCorrectiveAction(action, input.actor ?? "user");
  }

  const resolvedAt = nowIso();
  const state = await readState();
  state.resolved[input.alertId] = {
    resolvedAt,
    actionId: input.actionId
  };
  await writeState(state);

  return {
    alertId: input.alertId,
    resolvedAt,
    actionResult
  };
}
