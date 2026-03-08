import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  appendCapture,
  clearBacklog,
  createTask,
  getSystemStatus,
  listTasks,
  processBacklogFromFile,
  readBacklogRaw,
  updateTaskStatus
} from "@/lib/file-store";

let tempRoot = "";

beforeEach(async () => {
  tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "personal-os-web-"));
  await fs.mkdir(path.join(tempRoot, "Tasks"), { recursive: true });
  await fs.mkdir(path.join(tempRoot, "Knowledge"), { recursive: true });
  await fs.writeFile(path.join(tempRoot, "BACKLOG.md"), "# Backlog\n\n", "utf8");
  await fs.writeFile(path.join(tempRoot, "GOALS.md"), "# Goals\n", "utf8");
  process.env.PERSONAL_OS_ROOT = tempRoot;
});

afterEach(async () => {
  if (tempRoot) {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
  delete process.env.PERSONAL_OS_ROOT;
});

describe("file store integration", () => {
  it("appends capture entries to backlog", async () => {
    await appendCapture("Prepare weekly update");
    const raw = await readBacklogRaw();

    expect(raw).toContain("- Prepare weekly update");
  });

  it("creates and updates task status", async () => {
    const task = await createTask({
      title: "Ship dashboard",
      category: "technical",
      priority: "P0"
    });

    const updated = await updateTaskStatus(task.filename, "s");
    expect(updated.frontmatter.status).toBe("s");

    const tasks = await listTasks({ includeDone: true });
    expect(tasks).toHaveLength(1);
  });

  it("processes backlog and reads system status", async () => {
    await appendCapture("Design product brief");

    const triage = await processBacklogFromFile();
    const status = await getSystemStatus();

    expect(triage.summary.total_items).toBeGreaterThan(0);
    expect(status.backlog_items).toBeGreaterThan(0);

    await clearBacklog();
    const cleared = await readBacklogRaw();
    expect(cleared).toContain("# Backlog");
  });
});
