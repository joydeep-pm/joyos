import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAssistantAlerts, resolveAssistantAlert } from "@/lib/assistant/alert-engine";
import { getOutcomeClosureKpi } from "@/lib/assistant/kpi-engine";
import { commitDayPlan, listAssistantQueueItems } from "@/lib/assistant/queue-engine";
import { getWeeklyReview, rebuildWeeklyReview } from "@/lib/assistant/review-engine";
import { getTrendPoints } from "@/lib/assistant/trend-engine";
import { weekWindowFromWeekId } from "@/lib/assistant/week-utils";
import { createTask } from "@/lib/file-store";

let tempRoot = "";

function isoDaysFromNow(delta: number): string {
  const date = new Date();
  date.setDate(date.getDate() + delta);
  return date.toISOString().slice(0, 10);
}

beforeEach(async () => {
  tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "personal-os-assistant-phase2-"));
  await fs.mkdir(path.join(tempRoot, "Tasks"), { recursive: true });
  await fs.mkdir(path.join(tempRoot, "Knowledge"), { recursive: true });
  await fs.writeFile(path.join(tempRoot, "BACKLOG.md"), "# Backlog\n\n", "utf8");
  await fs.writeFile(
    path.join(tempRoot, "GOALS.md"),
    [
      "# Goals",
      "",
      "## Quarterly Outcomes",
      "Deliver Flipkart execution and co-lending reliability.",
      "",
      "### Execution Excellence",
      "Close weekly outcomes with high predictability."
    ].join("\n"),
    "utf8"
  );

  process.env.PERSONAL_OS_ROOT = tempRoot;
  process.env.ASSISTANT_CACHE_DIR = path.join(tempRoot, ".cache");
});

afterEach(async () => {
  if (tempRoot) {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }

  delete process.env.PERSONAL_OS_ROOT;
  delete process.env.ASSISTANT_CACHE_DIR;
});

describe("assistant phase2 week math", () => {
  it("computes Monday-start weekly window", () => {
    const window = weekWindowFromWeekId("2026-W08");
    expect(window.weekStart).toBe("monday");
    expect(window.startDate).toBe("2026-02-16");
    expect(window.endDate).toBe("2026-02-22");
  });
});

describe("assistant phase2 review and kpi", () => {
  it("keeps kpi aligned to weekly scorecard", async () => {
    const t1 = await createTask({ title: "Deliver middleware plan", priority: "P0", category: "technical" });
    await createTask({ title: "Write weekly update", priority: "P1", category: "writing" });

    await commitDayPlan({ date: isoDaysFromNow(0), taskIds: [t1.filename] });
    const review = await rebuildWeeklyReview();
    const kpi = await getOutcomeClosureKpi(review.window.weekId);

    expect(kpi.weekId).toBe(review.window.weekId);
    expect(kpi.closureRate).toBe(review.scorecard.closureRate);
    expect(kpi.target).toBe(0.7);
  });

  it("returns deterministic review fields for unchanged inputs", async () => {
    const t1 = await createTask({ title: "Review co-lending dependency", priority: "P1", category: "technical" });
    await commitDayPlan({ date: isoDaysFromNow(0), taskIds: [t1.filename] });

    const first = await getWeeklyReview({ force: true });
    const second = await getWeeklyReview({ force: true });

    expect(second.window.weekId).toBe(first.window.weekId);
    expect(second.scorecard).toEqual(first.scorecard);
    expect(second.outcomes).toEqual(first.outcomes);
  });
});

describe("assistant phase2 alerts and trends", () => {
  it("flags priority drift when task priority changes", async () => {
    const created = await createTask({ title: "Dependency alignment", priority: "P2", category: "technical" });

    await getAssistantAlerts();

    const taskPath = path.join(tempRoot, "Tasks", created.filename);
    const raw = await fs.readFile(taskPath, "utf8");
    await fs.writeFile(taskPath, raw.replace("priority: P2", "priority: P0"), "utf8");

    const alerts = await getAssistantAlerts();
    const drift = alerts.find((alert) => alert.type === "priority_drift");

    expect(drift).toBeTruthy();
    if (drift && drift.type === "priority_drift") {
      expect(drift.fromPriority).toBe("P2");
      expect(drift.toPriority).toBe("P0");
    }
  });

  it("creates wip-limit alert and resolves via corrective action", async () => {
    const tasks = await Promise.all([
      createTask({ title: "P0 task 1", priority: "P0", category: "technical" }),
      createTask({ title: "P0 task 2", priority: "P0", category: "technical" }),
      createTask({ title: "P1 task 3", priority: "P1", category: "technical" }),
      createTask({ title: "P1 task 4", priority: "P1", category: "technical" })
    ]);

    await commitDayPlan({ date: isoDaysFromNow(0), taskIds: [tasks[0].filename, tasks[1].filename, tasks[2].filename] });
    await commitDayPlan({ date: isoDaysFromNow(0), taskIds: [tasks[3].filename] });

    const alerts = await getAssistantAlerts();
    const wip = alerts.find((alert) => alert.type === "wip_limit");

    expect(wip).toBeTruthy();
    if (!wip || wip.type !== "wip_limit") return;

    const action = wip.correctiveActions.find((entry) => entry.type === "mark_awaiting_input");
    expect(action).toBeTruthy();
    if (!action) return;

    const result = await resolveAssistantAlert({ alertId: wip.id, actionId: action.id, actor: "tester" });
    expect(result.actionResult).toContain("awaiting_input");

    const queue = await listAssistantQueueItems();
    expect(queue.some((item) => item.status === "awaiting_input")).toBe(true);

    const remaining = await getAssistantAlerts();
    expect(remaining.find((entry) => entry.id === wip.id)).toBeFalsy();
  });

  it("returns stable ordered trend points for sparse weeks", async () => {
    const task = await createTask({ title: "Weekly execution anchor", priority: "P0", category: "technical" });
    await commitDayPlan({ date: isoDaysFromNow(0), taskIds: [task.filename] });

    const trends = await getTrendPoints({ windowWeeks: 8 });

    expect(trends).toHaveLength(8);
    for (let i = 1; i < trends.length; i += 1) {
      expect(trends[i].date >= trends[i - 1].date).toBe(true);
    }
  });
});
