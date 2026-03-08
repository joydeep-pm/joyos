import type { ApiError, InvokeResult } from "@/lib/types";

interface BridgePayload {
  toolName: string;
  args: Record<string, unknown>;
}

interface BridgeResponse<T> {
  ok: boolean;
  data?: T;
  error?: ApiError;
}

export async function invokeMcpBridge<T>(toolName: string, args: Record<string, unknown> = {}): Promise<InvokeResult<T>> {
  const url = process.env.MCP_BRIDGE_URL;

  if (!url) {
    return {
      ok: false,
      source: "mcp",
      error: {
        code: "MCP_NOT_CONFIGURED",
        message: "MCP_BRIDGE_URL is not configured."
      }
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1800);

  try {
    const payload: BridgePayload = { toolName, args };

    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      return {
        ok: false,
        source: "mcp",
        error: {
          code: "MCP_HTTP_ERROR",
          message: `MCP bridge responded with HTTP ${response.status}`
        }
      };
    }

    const data = (await response.json()) as BridgeResponse<T> | T;

    if (typeof data === "object" && data !== null && "ok" in data) {
      const bridged = data as BridgeResponse<T>;
      return {
        ok: bridged.ok,
        source: "mcp",
        data: bridged.data,
        error: bridged.error
      };
    }

    return {
      ok: true,
      source: "mcp",
      data: data as T
    };
  } catch (error) {
    return {
      ok: false,
      source: "mcp",
      error: {
        code: "MCP_UNAVAILABLE",
        message: error instanceof Error ? error.message : "Unknown MCP error"
      }
    };
  } finally {
    clearTimeout(timeout);
  }
}
