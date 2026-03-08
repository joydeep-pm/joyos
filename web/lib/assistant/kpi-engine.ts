import { getWeeklyReview } from "@/lib/assistant/review-engine";
import type { OutcomeClosureKpi } from "@/lib/types";

const DEFAULT_TARGET = 0.7;

export async function getOutcomeClosureKpi(weekId?: string): Promise<OutcomeClosureKpi> {
  const review = await getWeeklyReview({ weekId });
  const closureRate = review.scorecard.closureRate;

  return {
    weekId: review.window.weekId,
    closureRate,
    target: DEFAULT_TARGET,
    metTarget: closureRate >= DEFAULT_TARGET
  };
}
