import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { rebuildAssistantContext } from "@/lib/assistant/context-engine";

const tempRoots: string[] = [];

async function setupWorkspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "personal-os-context-"));
  tempRoots.push(root);

  await fs.mkdir(path.join(root, "Tasks"), { recursive: true });
  await fs.mkdir(path.join(root, "Knowledge", "Meetings"), { recursive: true });

  await fs.writeFile(
    path.join(root, "GOALS.md"),
    "## Stability\nReduce blocker churn and make follow-ups visible.\n",
    "utf8"
  );

  await fs.writeFile(
    path.join(root, "Tasks", "follow-up-owner.md"),
    `---
title: Follow up with engineering owner
category: technical
priority: P1
status: n
created_date: 2026-03-14
resource_refs:
  - Knowledge/Meetings/2026-03-14-bnpl-review.md
---

# Follow up with engineering owner

## Context
Supports Stability.

## Next Actions
- [ ] Ask engineering lead to confirm ownership
`,
    "utf8"
  );

  await fs.writeFile(
    path.join(root, "Knowledge", "Meetings", "2026-03-14-bnpl-review.md"),
    `# BNPL review

## Date
2026-03-14

## Attendees
- Joydeep Sarkar
- Engineering lead

## Decisions
- Confirm ownership before grooming

## Action Items
- Follow up with engineering lead on owner confirmation

## Risks / Blockers
- Ownership remains unclear
`,
    "utf8"
  );

  process.env.PERSONAL_OS_ROOT = root;
}

afterEach(async () => {
  delete process.env.PERSONAL_OS_ROOT;
  await Promise.all(tempRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })));
});

describe("assistant context meeting integration", () => {
  it("includes meeting continuity alongside tasks and updates meeting commitment stats", async () => {
    await setupWorkspace();

    const { context } = await rebuildAssistantContext();

    expect(context.tasks).toHaveLength(1);
    expect(context.knowledge).toHaveLength(1);
    expect(context.meetingContinuity).toHaveLength(1);
    expect(context.meetingContinuity[0].sourcePath).toBe("Knowledge/Meetings/2026-03-14-bnpl-review.md");
    expect(context.meetingContinuity[0].linkedArtifacts).toEqual([]);
    expect(context.stats.openMeetingCommitments).toBe(1);
  });
});
