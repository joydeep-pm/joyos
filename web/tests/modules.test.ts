import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listActionModules, runModuleAction } from "@/lib/modules";

let tempRoot = "";

beforeEach(async () => {
  tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "personal-os-modules-"));
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

describe("modules", () => {
  it("loads module manifests", async () => {
    const modules = await listActionModules();
    expect(modules.some((module) => module.id === "core_execution")).toBe(true);
  });

  it("runs capture and create task actions", async () => {
    const capture = await runModuleAction("core_execution", "capture_item", {
      text: "Review middleware risk log"
    });

    expect(capture.data).toMatchObject({ appended: "Review middleware risk log" });

    const create = await runModuleAction("core_execution", "create_task", {
      title: "Prepare weekly leadership note",
      category: "writing",
      priority: "P1"
    });

    expect((create.data as { frontmatter?: { title?: string } })?.frontmatter?.title).toBe(
      "Prepare weekly leadership note"
    );
  });

  it("throws for unknown actions", async () => {
    await expect(runModuleAction("core_execution", "missing_action", {})).rejects.toThrow(
      "Unknown module action"
    );
  });
});
