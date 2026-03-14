import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { rebuildAssistantContext } from "@/lib/assistant/context-engine";

const tempRoots: string[] = [];

async function setupWorkspace(meetingContent: string) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "personal-os-meeting-"));
  tempRoots.push(root);

  await fs.mkdir(path.join(root, "Tasks"), { recursive: true });
  await fs.mkdir(path.join(root, "Knowledge", "Meetings"), { recursive: true });
  await fs.writeFile(path.join(root, "GOALS.md"), "## Documentation\nKeep delivery inputs crisp.\n", "utf8");
  await fs.writeFile(path.join(root, "Knowledge", "Meetings", "2026-03-14-bnpl-review.md"), meetingContent, "utf8");

  process.env.PERSONAL_OS_ROOT = root;
}

afterEach(async () => {
  delete process.env.PERSONAL_OS_ROOT;
  await Promise.all(tempRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })));
});

describe("meeting continuity extraction", () => {
  it("derives open commitments, blockers, ambiguity, and routing targets from a meeting note", async () => {
    await setupWorkspace(`# Meeting Note Example — BNPL Client Escalation Review

## Date
2026-03-14

## Attendees
- Joydeep Sarkar
- Aarti (PM owner)

## Decisions
- Create a durable feature-request note before the next engineering review

## Action Items
- Aarti to draft clearer acceptance criteria by tomorrow
- Joydeep to review the feature-request framing before grooming

## Risks / Blockers
- Story clarity is insufficient for grooming
- Ownership on the engineering side is still not fully explicit

## Open Questions
- Which waiver events must be shown to client-side users?
`);

    const { context } = await rebuildAssistantContext();
    expect(context.meetingContinuity).toHaveLength(1);

    const item = context.meetingContinuity[0];
    expect(item.sourceType).toBe("meeting_note");
    expect(item.openCommitments).toEqual([
      "Aarti to draft clearer acceptance criteria by tomorrow",
      "Joydeep to review the feature-request framing before grooming"
    ]);
    expect(item.blockers).toContain("Story clarity is insufficient for grooming");
    expect(item.openQuestions).toContain("Which waiver events must be shown to client-side users?");
    expect(item.ambiguityFlags).toContain("open_questions_present");
    expect(item.status).toBe("ambiguous");
    expect(item.routingTargets.map((target) => target.type)).toEqual(expect.arrayContaining(["task", "feature_request", "people_note", "learning_note"]));
    expect(context.stats.openMeetingCommitments).toBe(2);
  });

  it("marks transcript inputs as transcript source type", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "personal-os-transcript-"));
    tempRoots.push(root);

    await fs.mkdir(path.join(root, "Tasks"), { recursive: true });
    await fs.mkdir(path.join(root, "Knowledge", "Transcripts"), { recursive: true });
    await fs.writeFile(path.join(root, "GOALS.md"), "## Stability\nReduce blocker churn.\n", "utf8");
    await fs.writeFile(
      path.join(root, "Knowledge", "Transcripts", "2026-03-14-sync.md"),
      `# Sync transcript\n\n## Action Items\n- Follow up with engineering lead\n`,
      "utf8"
    );

    process.env.PERSONAL_OS_ROOT = root;

    const { context } = await rebuildAssistantContext();
    expect(context.meetingContinuity).toHaveLength(1);
    expect(context.meetingContinuity[0].sourceType).toBe("transcript");
  });
});
