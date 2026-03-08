import { ok, fail } from "@/app/api/_utils";
import { getGoals } from "@/lib/file-store";

export async function GET() {
  try {
    const goals = await getGoals();
    return ok(goals, { source: "fallback" });
  } catch (error) {
    return fail(500, {
      code: "GOALS_READ_FAILED",
      message: error instanceof Error ? error.message : "Unable to read GOALS.md"
    });
  }
}
