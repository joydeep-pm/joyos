import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateDailyBrief } from "@/lib/assistant/brief-engine";
import { approveCommsDraft, createCommsDraft, getCommsHistory, sendCommsDraft } from "@/lib/assistant/comms-engine";
import { getAssistantContext, rebuildAssistantContext } from "@/lib/assistant/context-engine";
import { commitDayPlan, listAssistantQueueItems, updateAssistantQueueItemStatus } from "@/lib/assistant/queue-engine";
import { createTask, getTask, updateTaskStatus } from "@/lib/file-store";

let tempRoot = "";

function isoDaysFromNow(delta: number): string {
  const date = new Date();
  date.setDate(date.getDate() + delta);
  return date.toISOString().slice(0, 10);
}

beforeEach(async () => {
  tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "personal-os-assistant-"));
  await fs.mkdir(path.join(tempRoot, "Tasks"), { recursive: true });
  await fs.mkdir(path.join(tempRoot, "Knowledge"), { recursive: true });
  await fs.writeFile(path.join(tempRoot, "BACKLOG.md"), "# Backlog\n\n", "utf8");
  await fs.writeFile(
    path.join(tempRoot, "GOALS.md"),
    [
      "# Goals",
      "",
      "## Launch Outcomes",
      "Ship middleware reliability and weekly execution quality.",
      "",
      "### Flipkart Delivery",
      "Deliver Flipkart and co-lending milestones this quarter."
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

describe("assistant context and brief", () => {
  it("rebuilds deterministic context with goal links for high-priority tasks", async () => {
    await createTask({
      title: "Deliver Flipkart middleware milestone",
      category: "technical",
      priority: "P0",
      due_date: isoDaysFromNow(1),
      resource_refs: ["Knowledge/flipkart.md"]
    });
    await fs.writeFile(
      path.join(tempRoot, "Knowledge", "flipkart.md"),
      "# Flipkart Notes\nCritical dependencies and execution constraints.",
      "utf8"
    );

    const rebuilt = await rebuildAssistantContext();
    const cached = await getAssistantContext();

    const p0 = rebuilt.context.tasks.find((task) => task.priority === "P0");
    expect(rebuilt.durationMs).toBeLessThan(2000);
    expect(p0?.goalIds.length).toBeGreaterThan(0);
    expect(cached.cacheHit).toBe(true);
    expect(cached.context).toEqual(rebuilt.context);
  });

  it("detects overdue, stale-blocked, and missing-next-action drift", async () => {
    await createTask({
      title: "Overdue launch dependency",
      category: "technical",
      priority: "P0",
      due_date: isoDaysFromNow(-1),
      content: "# Overdue launch dependency\n\nNo next action listed."
    });

    const blocked = await createTask({
      title: "Blocked architecture decision",
      category: "technical",
      priority: "P1"
    });
    await updateTaskStatus(blocked.filename, "b");
    const staleDate = new Date(Date.now() - 49 * 60 * 60 * 1000);
    await fs.utimes(path.join(tempRoot, "Tasks", blocked.filename), staleDate, staleDate);

    const rebuilt = await rebuildAssistantContext();
    const kinds = rebuilt.context.driftAlerts.map((alert) => alert.type);

    expect(kinds).toContain("overdue_high_priority");
    expect(kinds).toContain("blocked_stale");
    expect(kinds).toContain("missing_next_action");
  });

  it("generates a brief with goal-linked top outcomes", async () => {
    await createTask({
      title: "Flipkart launch readiness check",
      category: "technical",
      priority: "P0",
      due_date: isoDaysFromNow(1)
    });
    await createTask({
      title: "Stakeholder sync for co-lending",
      category: "outreach",
      priority: "P1",
      due_date: isoDaysFromNow(2)
    });

    const brief = await generateDailyBrief(isoDaysFromNow(0));

    expect(brief.topOutcomes.length).toBeGreaterThan(0);
    expect(brief.topOutcomes[0]?.priority).toBe("P0");
    expect(brief.topOutcomes.every((item) => item.goalReference !== "Goal link pending")).toBe(true);
  });
});

describe("assistant queue and comms", () => {
  it("commits plan and persists queue status transitions", async () => {
    const t1 = await createTask({
      title: "Finalize middleware QA checklist",
      category: "technical",
      priority: "P0"
    });
    await createTask({
      title: "Draft stakeholder update",
      category: "writing",
      priority: "P1"
    });

    const committed = await commitDayPlan({
      taskIds: [t1.filename]
    });
    expect(committed.items.length).toBe(1);

    const item = committed.items[0];
    await updateAssistantQueueItemStatus(item.id, "done");

    const queue = await listAssistantQueueItems();
    const updated = queue.find((entry) => entry.id === item.id);
    const task = await getTask(item.filename);

    expect(updated?.status).toBe("done");
    expect(task?.frontmatter.status).toBe("d");
  });

  it("enforces approve-before-send policy and records audit", async () => {
    await createTask({
      title: "Ship release notes draft",
      category: "writing",
      priority: "P1"
    });

    const draft = await createCommsDraft({
      type: "stakeholder_update",
      destination: "leader@local"
    });

    const blocked = await sendCommsDraft(draft.id, "user");
    expect(blocked.status).toBe("blocked");

    await approveCommsDraft(draft.id, "user");
    const sent = await sendCommsDraft(draft.id, "user");
    expect(sent.status).toBe("sent");

    const history = await getCommsHistory();
    const events = history.audit.filter((entry) => entry.draftId === draft.id).map((entry) => entry.event);
    expect(events).toContain("send_denied");
    expect(events).toContain("sent");
  });
});
