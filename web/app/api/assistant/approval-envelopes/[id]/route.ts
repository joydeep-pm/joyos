import { fail, ok } from "@/app/api/_utils";
import { approveEnvelope, denyEnvelope, executeEnvelope, getApprovalEnvelope } from "@/lib/assistant/approval-envelope-store";

interface TransitionApprovalEnvelopeRequestBody {
  action?: "approve" | "deny" | "execute";
  actor?: string;
  reason?: string;
}

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const envelope = await getApprovalEnvelope(id);

  if (!envelope) {
    return fail(404, {
      code: "approval_envelope_not_found",
      message: `Approval envelope not found: ${id}`
    });
  }

  return ok(envelope);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as TransitionApprovalEnvelopeRequestBody;

  if (!isNonEmptyString(body.action) || !isNonEmptyString(body.actor)) {
    return fail(400, {
      code: "approval_envelope_invalid_request",
      message: "Missing required approval envelope transition fields.",
      details: {
        missingFields: [
          ...(isNonEmptyString(body.action) ? [] : ["action"]),
          ...(isNonEmptyString(body.actor) ? [] : ["actor"])
        ]
      }
    });
  }

  try {
    const action = body.action.trim();
    const actor = body.actor.trim();

    const envelope =
      action === "approve"
        ? await approveEnvelope(id, actor)
        : action === "deny"
          ? await denyEnvelope(id, actor, body.reason?.trim() ?? "No reason provided.")
          : await executeEnvelope(id, actor);

    return ok(envelope);
  } catch (error) {
    if (error instanceof Error && error.message === "Envelope execution requires approval") {
      return fail(409, {
        code: "approval_envelope_execution_requires_approval",
        message: error.message
      });
    }

    if (error instanceof Error && error.message === "Invalid envelope transition") {
      return fail(409, {
        code: "approval_envelope_invalid_transition",
        message: error.message
      });
    }

    if (error instanceof Error && error.message.startsWith("Approval envelope not found:")) {
      return fail(404, {
        code: "approval_envelope_not_found",
        message: error.message
      });
    }

    return fail(500, {
      code: "approval_envelope_transition_failed",
      message: error instanceof Error ? error.message : "Unexpected approval envelope transition failure."
    });
  }
}
