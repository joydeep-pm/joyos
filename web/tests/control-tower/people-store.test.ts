import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";

import {
  readPeopleStore,
  upsertPeopleRecord,
  updatePeopleRecord
} from "@/lib/control-tower/people-store";

describe("people store", () => {
  const testCacheDir = path.join(process.cwd(), ".cache-test", "people-store");

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-12T09:00:00.000Z"));
    process.env.ASSISTANT_CACHE_DIR = testCacheDir;
    await fs.rm(testCacheDir, { recursive: true, force: true });
  });

  it("persists a private PM workflow record with stable timestamps", async () => {
    const record = await upsertPeopleRecord({
      pmName: "Alice",
      lastOneOnOneDate: "2026-03-01",
      nextOneOnOneDate: "2026-03-28",
      coachingFocus: ["Improve escalation follow-through"],
      privateNotes: "Needs more proactive dependency closure.",
      lastUpdatedBy: "Joydeep"
    });

    expect(record).toMatchObject({
      id: expect.stringMatching(/^pm-record-/),
      pmName: "Alice",
      lastOneOnOneDate: "2026-03-01",
      nextOneOnOneDate: "2026-03-28",
      coachingFocus: ["Improve escalation follow-through"],
      privateNotes: "Needs more proactive dependency closure.",
      lastUpdatedBy: "Joydeep",
      createdAt: "2026-03-12T09:00:00.000Z",
      updatedAt: "2026-03-12T09:00:00.000Z"
    });

    const store = await readPeopleStore();
    expect(store).toMatchObject({
      version: 1,
      lastUpdated: "2026-03-12T09:00:00.000Z",
      records: [record]
    });
  });

  it("updates the existing PM record instead of creating duplicates", async () => {
    const original = await upsertPeopleRecord({
      pmName: "Alice",
      lastOneOnOneDate: "2026-03-01",
      coachingFocus: ["Improve stakeholder communication"],
      privateNotes: "Track follow-through more tightly.",
      lastUpdatedBy: "Joydeep"
    });

    vi.setSystemTime(new Date("2026-03-13T11:30:00.000Z"));

    const updated = await upsertPeopleRecord({
      pmName: "Alice",
      lastOneOnOneDate: "2026-03-10",
      nextOneOnOneDate: "2026-04-02",
      coachingFocus: ["Improve stakeholder communication", "Create clearer weekly updates"],
      privateNotes: "Progress improving; revisit in next 1:1.",
      lastUpdatedBy: "Joydeep"
    });

    expect(updated.id).toBe(original.id);
    expect(updated.createdAt).toBe("2026-03-12T09:00:00.000Z");
    expect(updated.updatedAt).toBe("2026-03-13T11:30:00.000Z");

    const store = await readPeopleStore();
    expect(store?.records).toHaveLength(1);
  });

  it("supports patch updates while preserving untouched PM record fields", async () => {
    await upsertPeopleRecord({
      pmName: "Alice",
      lastOneOnOneDate: "2026-03-01",
      coachingFocus: ["Improve prioritization narratives"],
      privateNotes: "Needs more concise weekly risk summaries.",
      lastUpdatedBy: "Joydeep"
    });

    vi.setSystemTime(new Date("2026-03-14T08:15:00.000Z"));

    const updated = await updatePeopleRecord("Alice", {
      nextOneOnOneDate: "2026-03-31",
      coachingFocus: ["Improve prioritization narratives", "Escalate blockers earlier"]
    });

    expect(updated).toMatchObject({
      pmName: "Alice",
      lastOneOnOneDate: "2026-03-01",
      nextOneOnOneDate: "2026-03-31",
      coachingFocus: ["Improve prioritization narratives", "Escalate blockers earlier"],
      privateNotes: "Needs more concise weekly risk summaries.",
      updatedAt: "2026-03-14T08:15:00.000Z"
    });
  });
});
