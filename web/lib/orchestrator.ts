import { invokeMcpBridge } from "@/lib/mcp-bridge";
import type { ApiError, InvokeResult } from "@/lib/types";

export async function invokeWithFallback<T>(params: {
  toolName: string;
  args?: Record<string, unknown>;
  fallback: () => Promise<T>;
}): Promise<InvokeResult<T>> {
  const mcpResult = await invokeMcpBridge<T>(params.toolName, params.args ?? {});

  if (mcpResult.ok && mcpResult.data !== undefined) {
    return {
      ok: true,
      source: "mcp",
      data: mcpResult.data
    };
  }

  try {
    const data = await params.fallback();
    return {
      ok: true,
      source: "fallback",
      data
    };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      error: {
        code: "FALLBACK_FAILED",
        message: error instanceof Error ? error.message : "Unknown fallback error",
        details: mcpResult.error as ApiError | undefined
      }
    };
  }
}
