import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTask, listTasks, readBacklogRaw } from "@/lib/file-store";
import { handleCopilotMessage } from "@/lib/copilot";

let tempRoot = "";

beforeEach(async () => {
  tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "personal-os-copilot-"));
  await fs.mkdir(path.join(tempRoot, "Tasks"), { recursive: true });
  await fs.mkdir(path.join(tempRoot, "Knowledge"), { recursive: true });
  await fs.writeFile(path.join(tempRoot, "BACKLOG.md"), "# Backlog\n\n", "utf8");
  await fs.writeFile(path.join(tempRoot, "GOALS.md"), "# Goals\n\n### What are your objectives for THIS QUARTER (next 90 days)?\nShip MVP\n", "utf8");
  process.env.PERSONAL_OS_ROOT = tempRoot;
  process.env.ASSISTANT_CACHE_DIR = path.join(tempRoot, ".cache");

  await createTask({ title: "Finalize Flipkart scope", category: "technical", priority: "P0" });
  await createTask({ title: "Middleware stakeholder sync", category: "outreach", priority: "P1" });
});

afterEach(async () => {
  if (tempRoot) {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
  delete process.env.PERSONAL_OS_ROOT;
  delete process.env.ASSISTANT_CACHE_DIR;
});

describe("copilot", () => {
  it("captures backlog notes", async () => {
    const reply = await handleCopilotMessage("capture prepare risk note");
    const backlog = await readBacklogRaw();

    expect(reply.reply).toContain("Captured");
    expect(backlog).toContain("- prepare risk note");
  });

  it("returns prioritized focus list", async () => {
    const reply = await handleCopilotMessage("what should I work on today?");

    expect(reply.reply).toContain("Top focus right now");
    expect(reply.reply).toContain("Finalize Flipkart scope");
  });

  it("updates status to done", async () => {
    const reply = await handleCopilotMessage("mark finalize flipkart scope as done");
    const tasks = await listTasks({ includeDone: true });
    const target = tasks.find((task) => task.frontmatter.title === "Finalize Flipkart scope");

    expect(reply.reply).toContain("Updated");
    expect(target?.frontmatter.status).toBe("d");
  });

  it("generates a daily brief", async () => {
    const reply = await handleCopilotMessage("daily brief");
    expect(reply.reply).toContain("Daily brief");
    expect(reply.reply).toContain("Finalize Flipkart scope");
  });

  it("returns weekly review summary", async () => {
    const reply = await handleCopilotMessage("weekly review");
    expect(reply.reply).toContain("Weekly review");
  });
});
