import { NextRequest } from "next/server";
import { fail, ok } from "@/app/api/_utils";
import { handleCopilotMessage } from "@/lib/copilot";
import { invokeMcpBridge } from "@/lib/mcp-bridge";
import type { CopilotReply } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { message?: string };
    const message = body.message?.trim();

    if (!message) {
      return fail(400, {
        code: "COPILOT_MESSAGE_REQUIRED",
        message: "message is required"
      });
    }

    const mcp = await invokeMcpBridge<CopilotReply>("copilot_chat", { message });
    if (mcp.ok && mcp.data) {
      return ok(
        {
          ...mcp.data,
          source: "mcp"
        },
        { source: "mcp" }
      );
    }

    const fallbackReply = await handleCopilotMessage(message);
    return ok(fallbackReply, { source: "fallback" });
  } catch (error) {
    return fail(500, {
      code: "COPILOT_FAILED",
      message: error instanceof Error ? error.message : "Unexpected copilot error"
    });
  }
}
