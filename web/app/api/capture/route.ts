import { NextRequest } from "next/server";
import { appendCapture } from "@/lib/file-store";
import { fail, ok } from "@/app/api/_utils";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text?: string };

    if (!body.text?.trim()) {
      return fail(400, { code: "CAPTURE_EMPTY", message: "Capture text is required." });
    }

    const data = await appendCapture(body.text);
    return ok(data, { source: "fallback" });
  } catch (error) {
    return fail(500, {
      code: "CAPTURE_FAILED",
      message: error instanceof Error ? error.message : "Unable to capture backlog item."
    });
  }
}
