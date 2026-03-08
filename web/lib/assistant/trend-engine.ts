import { getAssistantCachePath, readJsonFile, writeJsonFile } from "@/lib/assistant/storage";
import { getWeeklyReview } from "@/lib/assistant/review-engine";
import { listWeekIds, resolveWeekId, weekWindowFromWeekId } from "@/lib/assistant/week-utils";
import type { AssistantTrendSnapshotState, TrendPoint } from "@/lib/types";

const TREND_FILE = "assistant-trend-snapshots.json";
const DEFAULT_WINDOW_WEEKS = 8;

function defaultState(): AssistantTrendSnapshotState {
  return {
    version: 1,
    snapshots: {}
  };
}

async function readState(): Promise<AssistantTrendSnapshotState> {
  return readJsonFile(getAssistantCachePath(TREND_FILE), defaultState());
}

async function writeState(state: AssistantTrendSnapshotState): Promise<void> {
  await writeJsonFile(getAssistantCachePath(TREND_FILE), state);
}

async function ensureSnapshot(weekId: string, state: AssistantTrendSnapshotState): Promise<void> {
  const existing = state.snapshots[weekId];
  if (existing) return;

  const review = await getWeeklyReview({ weekId });
  state.snapshots[weekId] = {
    weekId,
    date: review.window.endDate,
    committed: review.scorecard.committedCount,
    completed: review.scorecard.completedCount,
    closureRate: review.scorecard.closureRate,
    recordedAt: new Date().toISOString()
  };
}

export async function getTrendPoints(options: {
  endingWeekId?: string;
  windowWeeks?: number;
} = {}): Promise<TrendPoint[]> {
  const endingWeekId = resolveWeekId(options.endingWeekId);
  const windowWeeks = Math.max(1, Math.min(options.windowWeeks ?? DEFAULT_WINDOW_WEEKS, 52));
  const weekIds = listWeekIds(endingWeekId, windowWeeks);
  const state = await readState();

  for (const weekId of weekIds) {
    await ensureSnapshot(weekId, state);
  }

  const latestReview = await getWeeklyReview({ weekId: endingWeekId, force: true });
  state.snapshots[endingWeekId] = {
    weekId: endingWeekId,
    date: latestReview.window.endDate,
    committed: latestReview.scorecard.committedCount,
    completed: latestReview.scorecard.completedCount,
    closureRate: latestReview.scorecard.closureRate,
    recordedAt: new Date().toISOString()
  };

  await writeState(state);

  return weekIds.map((weekId) => {
    const snapshot = state.snapshots[weekId];
    if (snapshot) {
      return {
        date: snapshot.date,
        committed: snapshot.committed,
        completed: snapshot.completed,
        closureRate: snapshot.closureRate
      };
    }

    const window = weekWindowFromWeekId(weekId);
    return {
      date: window.endDate,
      committed: 0,
      completed: 0,
      closureRate: 0
    };
  });
}

export async function rebuildTrendPoints(options: {
  endingWeekId?: string;
  windowWeeks?: number;
} = {}): Promise<TrendPoint[]> {
  const endingWeekId = resolveWeekId(options.endingWeekId);
  const windowWeeks = Math.max(1, Math.min(options.windowWeeks ?? DEFAULT_WINDOW_WEEKS, 52));
  const weekIds = listWeekIds(endingWeekId, windowWeeks);
  const state = await readState();

  for (const weekId of weekIds) {
    const review = await getWeeklyReview({ weekId, force: true });
    state.snapshots[weekId] = {
      weekId,
      date: review.window.endDate,
      committed: review.scorecard.committedCount,
      completed: review.scorecard.completedCount,
      closureRate: review.scorecard.closureRate,
      recordedAt: new Date().toISOString()
    };
  }

  await writeState(state);

  return weekIds.map((weekId) => {
    const snapshot = state.snapshots[weekId];
    return {
      date: snapshot.date,
      committed: snapshot.committed,
      completed: snapshot.completed,
      closureRate: snapshot.closureRate
    };
  });
}
