import { getAssistantContext } from "@/lib/assistant/context-engine";
import type { BriefOutcome, DailyBrief, TaskSignal } from "@/lib/types";

function rankTask(task: TaskSignal): number {
  const priorityWeight = task.priority === "P0" ? 100 : task.priority === "P1" ? 75 : task.priority === "P2" ? 45 : 20;
  const urgencyWeight = Math.round(task.urgencyScore * 40);
  const alignmentWeight = Math.round(task.alignmentScore * 30);
  const activeBoost = task.status === "s" ? 5 : task.status === "n" ? 2 : 0;
  const blockedPenalty = task.status === "b" ? 30 : 0;

  return priorityWeight + urgencyWeight + alignmentWeight + activeBoost - blockedPenalty;
}

function formatWhyNow(task: TaskSignal): string {
  const reasons: string[] = [];

  if (task.priority === "P0" || task.priority === "P1") {
    reasons.push("high priority");
  }

  if (task.dueDate) {
    reasons.push(`due ${task.dueDate}`);
  }

  if (task.alignmentScore >= 0.6) {
    reasons.push("strong goal alignment");
  } else if (task.alignmentScore > 0) {
    reasons.push("goal-linked");
  }

  if (task.status === "s") {
    reasons.push("already in progress");
  }

  return reasons.length ? reasons.join("; ") : "supports current strategic momentum";
}

function sortTasksForOutcomes(tasks: TaskSignal[]): TaskSignal[] {
  return [...tasks]
    .sort((left, right) => {
      const delta = rankTask(right) - rankTask(left);
      if (delta !== 0) return delta;
      return left.title.localeCompare(right.title);
    })
    .filter((task) => task.status !== "d" && task.status !== "b");
}

export async function generateDailyBrief(date: string): Promise<DailyBrief> {
  const { context } = await getAssistantContext();

  const goalsById = new Map(context.goals.map((goal) => [goal.id, goal]));
  const sorted = sortTasksForOutcomes(context.tasks);

  const topOutcomes: BriefOutcome[] = sorted.slice(0, 3).map((task) => {
    const primaryGoal = task.goalIds[0] ? goalsById.get(task.goalIds[0]) : null;
    const score = rankTask(task);

    return {
      id: `outcome-${task.taskId}`,
      taskId: task.taskId,
      title: task.title,
      priority: task.priority,
      goalReference: primaryGoal ? `${primaryGoal.title}: ${primaryGoal.summary}` : "Goal link pending",
      whyNow: formatWhyNow(task),
      score
    };
  });

  const risks = context.driftAlerts
    .sort((left, right) => {
      const severityWeight = (value: string) => (value === "high" ? 3 : value === "medium" ? 2 : 1);
      return severityWeight(right.severity) - severityWeight(left.severity);
    })
    .slice(0, 5);

  const middayCheckpoint =
    topOutcomes.length > 0
      ? `At midday, validate progress on "${topOutcomes[0].title}" and clear one blocker before switching context.`
      : "At midday, run backlog triage and lock one execution outcome for the afternoon.";

  const eveningClosurePrompt =
    "Before end of day, mark what moved, roll over unfinished outcomes, and draft tomorrow's top three priorities.";

  return {
    date,
    generatedAt: new Date().toISOString(),
    topOutcomes,
    predictedRisks: risks,
    middayCheckpoint,
    eveningClosurePrompt
  };
}
