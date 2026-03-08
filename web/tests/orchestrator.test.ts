import { describe, expect, it } from "vitest";
import { invokeWithFallback } from "@/lib/orchestrator";

describe("orchestrator", () => {
  it("falls back when MCP bridge is not configured", async () => {
    delete process.env.MCP_BRIDGE_URL;

    const result = await invokeWithFallback({
      toolName: "list_tasks",
      fallback: async () => ({ tasks: ["a"] })
    });

    expect(result.ok).toBe(true);
    expect(result.source).toBe("fallback");
    expect(result.data).toEqual({ tasks: ["a"] });
  });
});
