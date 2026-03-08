import { describe, expect, it } from "vitest";
import { parseBacklogItems, processBacklog } from "@/lib/backlog";
import type { TaskDocument } from "@/lib/types";

describe("backlog processing", () => {
  it("extracts backlog bullets", () => {
    const items = parseBacklogItems("# Backlog\n\n- first\n- second\n");
    expect(items).toEqual(["first", "second"]);
  });

  it("flags duplicates and ambiguities", () => {
    const tasks: TaskDocument[] = [
      {
        filename: "api-task.md",
        frontmatter: {
          title: "Fix API middleware timeout",
          category: "technical",
          priority: "P1",
          status: "n"
        },
        body: ""
      }
    ];

    const result = processBacklog(["Fix API middleware timeout", "research"], tasks);

    expect(result.potential_duplicates).toHaveLength(1);
    expect(result.needs_clarification).toHaveLength(1);
  });
});
