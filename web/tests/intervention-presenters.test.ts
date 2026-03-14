import { describe, expect, it } from "vitest";
import { presentBlockedTask, presentBriefOutcome, presentTaskInterventionCandidate } from "@/lib/intervention-presenters";
import type { BriefOutcome, TaskDocument } from "@/lib/types";

describe("intervention presenters", () => {
  it("presents task intervention semantics from task fields", () => {
    const task = {
      filename: "task.md",
      body: "",
      frontmatter: {
        title: "Resolve client escalation",
        category: "outreach",
        priority: "P0",
        status: "n",
        due_date: "2026-03-16"
      }
    } satisfies TaskDocument;

    const view = presentTaskInterventionCandidate(task);
    expect(view.reason).toBe("Director attention required now.");
    expect(view.goalSignal).toContain("New Business");
    expect(view.dueLabel).toContain("Due:");
  });

  it("passes through brief-outcome semantics", () => {
    const outcome: BriefOutcome = {
      id: "o1",
      taskId: "task-1",
      title: "Prepare leadership update",
      priority: "P0",
      score: 88,
      whyNow: "Leadership review is approaching.",
      goalReference: "Documentation"
    };

    const view = presentBriefOutcome(outcome);
    expect(view.reason).toBe(outcome.whyNow);
    expect(view.goalSignal).toBe(outcome.goalReference);
  });

  it("presents blocker intervention semantics", () => {
    const task = {
      filename: "blocked.md",
      body: "",
      frontmatter: {
        title: "Blocked engineering dependency",
        category: "technical",
        priority: "P1",
        status: "b"
      }
    } satisfies TaskDocument;

    const view = presentBlockedTask(task);
    expect(view.reason).toContain("Blocked work");
  });
});
