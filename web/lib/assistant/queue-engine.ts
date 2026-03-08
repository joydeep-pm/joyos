import crypto from "node:crypto";
import { generateDailyBrief } from "@/lib/assistant/brief-engine";
import { getAssistantCachePath, readJsonFile, writeJsonFile } from "@/lib/assistant/storage";
import { isDateWithinWeek } from "@/lib/assistant/week-utils";
import { getTask, updateTaskStatus } from "@/lib/file-store";
import type {
  AssistantQueueItem,
  AssistantQueueState,
  AssistantQueueStatus,
  OutcomeCommitment,
  TaskStatus,
  WeeklyWindow
} from "@/lib/types";

const QUEUE_FILE = "assistant-queue.json";

function nowIso(): string {
  return new Date().toISOString();
}

function defaultState(): AssistantQueueState {
  return {
    version: 1,
    items: [],
    commitments: []
  };
}

async function readState(): Promise<AssistantQueueState> {
  return readJsonFile(getAssistantCachePath(QUEUE_FILE), defaultState());
}

async function writeState(state: AssistantQueueState): Promise<void> {
  await writeJsonFile(getAssistantCachePath(QUEUE_FILE), state);
}

function mapQueueStatusToTaskStatus(status: AssistantQueueStatus): TaskStatus {
  if (status === "in_progress") return "s";
  if (status === "done") return "d";
  if (status === "awaiting_input") return "b";
  return "n";
}

export async function listAssistantQueueItems(): Promise<AssistantQueueItem[]> {
  const state = await readState();
  return state.items.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function commitDayPlan(input: {
  date?: string;
  taskIds?: string[];
  notes?: string;
}): Promise<{ commitment: OutcomeCommitment; items: AssistantQueueItem[] }> {
  const state = await readState();
  const date = input.date ?? new Date().toISOString().slice(0, 10);

  const brief = await generateDailyBrief(date);
  const selectedTaskIds = (input.taskIds?.length ? input.taskIds : brief.topOutcomes.map((outcome) => outcome.taskId)).slice(0, 3);

  const selectedItems: AssistantQueueItem[] = [];
  for (const taskId of selectedTaskIds) {
    const existing = state.items.find((item) => item.taskId === taskId);
    const task = await getTask(taskId);
    if (!task) continue;

    if (existing) {
      existing.updatedAt = nowIso();
      if (existing.status === "done" || existing.status === "dropped") {
        existing.status = "queued";
      }
      selectedItems.push(existing);
      continue;
    }

    const outcome = brief.topOutcomes.find((item) => item.taskId === taskId);

    const created: AssistantQueueItem = {
      id: `queue_${crypto.randomUUID()}`,
      taskId,
      filename: task.filename,
      title: task.frontmatter.title,
      priority: task.frontmatter.priority,
      status: "queued",
      goalReference: outcome?.goalReference ?? "Goal link pending",
      dueDate: task.frontmatter.due_date,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    state.items.push(created);
    selectedItems.push(created);
  }

  const commitment: OutcomeCommitment = {
    id: `commit_${crypto.randomUUID()}`,
    date,
    topTaskIds: selectedItems.map((item) => item.taskId),
    committedAt: nowIso(),
    notes: input.notes
  };

  state.commitments.push(commitment);
  await writeState(state);

  return {
    commitment,
    items: selectedItems
  };
}

export async function updateAssistantQueueItemStatus(itemId: string, status: AssistantQueueStatus): Promise<AssistantQueueItem> {
  const state = await readState();
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) {
    throw new Error(`Queue item not found: ${itemId}`);
  }

  item.status = status;
  item.updatedAt = nowIso();

  const mapped = mapQueueStatusToTaskStatus(status);
  await updateTaskStatus(item.filename, mapped);

  await writeState(state);
  return item;
}

export async function getQueueState(): Promise<AssistantQueueState> {
  return readState();
}

export async function listAssistantCommitments(): Promise<OutcomeCommitment[]> {
  const state = await readState();
  return [...state.commitments].sort((left, right) => left.committedAt.localeCompare(right.committedAt));
}

export async function getAssistantCommitmentsForWeek(window: WeeklyWindow): Promise<OutcomeCommitment[]> {
  const commitments = await listAssistantCommitments();
  return commitments.filter((commitment) => {
    const date = commitment.date || commitment.committedAt.slice(0, 10);
    return isDateWithinWeek(date, window);
  });
}

export function getNextDayIso(fromDate?: string): string {
  const date = fromDate ? new Date(`${fromDate}T00:00:00.000Z`) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
