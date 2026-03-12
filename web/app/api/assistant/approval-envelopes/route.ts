import { fail, ok } from "@/app/api/_utils";
import { createApprovalEnvelope, listApprovalEnvelopes } from "@/lib/assistant/approval-envelope-store";

interface CreateApprovalEnvelopeRequestBody {
  actionType?: "comms_send" | "jira_writeback" | "confluence_writeback";
  targetType?: "comms_draft" | "jira_issue" | "confluence_page";
  targetId?: string;
  summary?: string;
  evidence?: string[];
  proposedBy?: string;
}

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: string[] | undefined): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

export async function GET() {
  const envelopes = await listApprovalEnvelopes();
  return ok(envelopes);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateApprovalEnvelopeRequestBody;

  const missingFields: string[] = [];
  if (!isNonEmptyString(body.actionType)) missingFields.push("actionType");
  if (!isNonEmptyString(body.targetType)) missingFields.push("targetType");
  if (!isNonEmptyString(body.targetId)) missingFields.push("targetId");
  if (!isNonEmptyString(body.summary)) missingFields.push("summary");
  if (!isStringArray(body.evidence)) missingFields.push("evidence");
  if (!isNonEmptyString(body.proposedBy)) missingFields.push("proposedBy");

  if (missingFields.length > 0) {
    return fail(400, {
      code: "approval_envelope_invalid_request",
      message: "Missing required approval envelope fields.",
      details: { missingFields }
    });
  }

  const actionType = body.actionType;
  const targetType = body.targetType;
  const targetId = body.targetId;
  const summary = body.summary;
  const evidence = body.evidence;
  const proposedBy = body.proposedBy;

  if (
    !actionType ||
    !targetType ||
    !targetId ||
    !summary ||
    !evidence ||
    !proposedBy
  ) {
    return fail(400, {
      code: "approval_envelope_invalid_request",
      message: "Missing required approval envelope fields.",
      details: { missingFields }
    });
  }

  const envelope = await createApprovalEnvelope({
    actionType,
    targetType,
    targetId: targetId.trim(),
    summary: summary.trim(),
    evidence: evidence.map((entry) => entry.trim()),
    proposedBy: proposedBy.trim()
  });

  return ok(envelope);
}
