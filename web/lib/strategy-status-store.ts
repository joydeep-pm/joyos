import { getAssistantCachePath, readJsonFile, writeJsonFile } from "@/lib/assistant/storage";
import { STRATEGY_COMMAND_CENTER, type RoadmapItem, type RoadmapStatus } from "@/lib/strategy-command-center";

interface StrategyStatusState {
  version: number;
  roadmap: Record<string, RoadmapStatus>;
}

const STRATEGY_STATUS_FILE = "strategy-roadmap-status.json";

function defaultState(): StrategyStatusState {
  return {
    version: 1,
    roadmap: Object.fromEntries(STRATEGY_COMMAND_CENTER.roadmap.map((item) => [item.id, item.status]))
  };
}

export async function readStrategyStatusState(): Promise<StrategyStatusState> {
  return readJsonFile(getAssistantCachePath(STRATEGY_STATUS_FILE), defaultState());
}

export async function getRoadmapItemsWithStatus(): Promise<RoadmapItem[]> {
  const state = await readStrategyStatusState();
  return STRATEGY_COMMAND_CENTER.roadmap.map((item) => ({
    ...item,
    status: state.roadmap[item.id] ?? item.status
  }));
}

export async function updateRoadmapItemStatus(id: string, status: RoadmapStatus): Promise<RoadmapItem[]> {
  const allowed: RoadmapStatus[] = ["not_started", "in_progress", "at_risk", "blocked", "done"];
  if (!allowed.includes(status)) {
    throw new Error(`Invalid roadmap status: ${status}`);
  }

  const state = await readStrategyStatusState();
  state.roadmap[id] = status;
  await writeJsonFile(getAssistantCachePath(STRATEGY_STATUS_FILE), state);
  return getRoadmapItemsWithStatus();
}
