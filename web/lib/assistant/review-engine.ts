import { getAssistantAlerts } from "@/lib/assistant/alert-engine";
import { getAssistantContext, rebuildAssistantContext } from "@/lib/assistant/context-engine";
import { getAssistantCommitmentsForWeek, listAssistantQueueItems } from "@/lib/assistant/queue-engine";
import { getAssistantCachePath, readJsonFile, writeJsonFile } from "@/lib/assistant/storage";
import { weekWindowFromWeekId } from "@/lib/assistant/week-utils";
import { getTask } from "@/lib/file-store";
import type {
  AssistantWeeklyReviewState,
  WeeklyOutcomeItem,
  WeeklyOutcomeScorecard,
  WeeklyReview
} from "@/lib/types";

const REVIEW_FILE = "assistant-weekly-review.json";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultState(): AssistantWeeklyReviewState {
  return {
    version: 1,
    reviews: {},
    updatedAt: new Date(0).toISOString()
  };
}

async function readState(): Promise<AssistantWeeklyReviewState> {
  return readJsonFile(getAssistantCachePath(REVIEW_FILE), defaultState());
}

async function writeState(state: AssistantWeeklyReviewState): Promise<void> {
  await writeJsonFile(getAssistantCachePath(REVIEW_FILE), state);
}

function prioritySort(priority: "P0" | "P1" | "P2" | "P3"): number {
  if (priority === "P0") return 0;
  if (priority === "P1") return 1;
  if (priority === "P2") return 2;
  return 3;
}

function buildScorecard(outcomes: WeeklyOutcomeItem[]): WeeklyOutcomeScorecard {
  const committedCount = outcomes.filter((item) => item.committed).length;
  const completedCount = outcomes.filter((item) => item.completed).length;
  const rolloverCount = outcomes.filter((item) => item.rolledOver).length;
  const closureRate = committedCount === 0 ? 0 : Number((completedCount / committedCount).toFixed(2));

  return {
    committedCount,
    completedCount,
    rolloverCount,
    closureRate
  };
}

async function computeWeeklyReview(weekId?: string, contextForce = false): Promise<WeeklyReview> {
  const window = weekWindowFromWeekId(weekId);
  if (contextForce) {
    await rebuildAssistantContext();
  }

  const [{ context }, commitments, queueItems, alerts] = await Promise.all([
    getAssistantContext(),
    getAssistantCommitmentsForWeek(window),
    listAssistantQueueItems(),
    getAssistantAlerts({ date: window.endDate })
  ]);

  const today = todayIso();
  const committedTaskIds = Array.from(new Set(commitments.flatMap((item) => item.topTaskIds)));
  const goalsById = new Map(context.goals.map((goal) => [goal.id, goal]));
  const queueByTaskId = new Map(queueItems.map((item) => [item.taskId, item]));
  const taskSignalById = new Map(context.tasks.map((task) => [task.taskId, task]));

  const outcomes: WeeklyOutcomeItem[] = [];
  for (const taskId of committedTaskIds) {
    const taskDoc = await getTask(taskId);
    const taskSignal = taskSignalById.get(taskId);
    const queueItem = queueByTaskId.get(taskId);

    if (!taskDoc && !taskSignal) continue;

    const title = taskDoc?.frontmatter.title ?? taskSignal?.title ?? taskId;
    const priority = taskDoc?.frontmatter.priority ?? taskSignal?.priority ?? "P2";
    const completed = (taskDoc?.frontmatter.status ?? taskSignal?.status) === "d";

    const goalReference = queueItem?.goalReference
      ? queueItem.goalReference
      : taskSignal?.goalIds[0]
        ? (() => {
            const goal = goalsById.get(taskSignal.goalIds[0]);
            return goal ? `${goal.title}: ${goal.summary}` : "Goal link pending";
          })()
        : "Goal link pending";

    outcomes.push({
      taskId,
      title,
      priority,
      committed: true,
      completed,
      rolledOver: !completed && window.endDate < today,
      goalReference
    });
  }

  outcomes.sort((left, right) => {
    const priorityDelta = prioritySort(left.priority) - prioritySort(right.priority);
    if (priorityDelta !== 0) return priorityDelta;
    return left.title.localeCompare(right.title);
  });

  return {
    generatedAt: new Date().toISOString(),
    window,
    outcomes,
    scorecard: buildScorecard(outcomes),
    alerts: alerts.slice(0, 8)
  };
}

export async function getWeeklyReview(input: {
  weekId?: string;
  force?: boolean;
} = {}): Promise<WeeklyReview> {
  const state = await readState();
  const weekId = weekWindowFromWeekId(input.weekId).weekId;
  const cached = state.reviews[weekId];

  const isHistoricalWeek = weekWindowFromWeekId(weekId).endDate < todayIso();
  if (!input.force && cached && isHistoricalWeek) {
    return cached;
  }

  const review = await computeWeeklyReview(weekId, Boolean(input.force));
  state.reviews[weekId] = review;
  state.updatedAt = new Date().toISOString();
  await writeState(state);

  return review;
}

export async function rebuildWeeklyReview(weekId?: string): Promise<WeeklyReview> {
  return getWeeklyReview({ weekId, force: true });
}
