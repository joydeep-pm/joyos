import { describe, expect, it } from "vitest";
import { parseTaskDocument, serializeTaskDocument } from "@/lib/markdown";

describe("markdown parser", () => {
  it("parses frontmatter and body", () => {
    const raw = `---\ntitle: Sample Task\ncategory: technical\npriority: P1\nstatus: n\n---\n\n# Sample Task\n\nBody`;
    const parsed = parseTaskDocument("sample-task.md", raw);

    expect(parsed.frontmatter.title).toBe("Sample Task");
    expect(parsed.frontmatter.priority).toBe("P1");
    expect(parsed.body).toContain("Body");
  });

  it("round-trips through serializer", () => {
    const original = parseTaskDocument(
      "task.md",
      `---\ntitle: Round Trip\ncategory: admin\npriority: P2\nstatus: s\n---\n\n## Note\nContent`
    );

    const serialized = serializeTaskDocument(original);
    const parsedAgain = parseTaskDocument("task.md", serialized);

    expect(parsedAgain.frontmatter.title).toBe(original.frontmatter.title);
    expect(parsedAgain.frontmatter.status).toBe("s");
    expect(parsedAgain.body).toContain("Content");
  });
});
