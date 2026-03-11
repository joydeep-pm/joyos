import crypto from "node:crypto";
import { generateDailyBrief } from "@/lib/assistant/brief-engine";
import { getAssistantContext } from "@/lib/assistant/context-engine";
import {
  createApprovalToken,
  createPayloadHash,
  ensureSendAllowed,
  redactSensitiveContent
} from "@/lib/assistant/policy-engine";
import { getAssistantCachePath, readJsonFile, writeJsonFile } from "@/lib/assistant/storage";
import type {
  AssistantCommsHistory,
  CommsApproval,
  CommsAuditEntry,
  CommsDraft,
  CommsSendResult,
  CommsState
} from "@/lib/types";

const COMMS_FILE = "assistant-comms.json";

export interface CommsProvider {
  send(draft: CommsDraft): Promise<{ message: string; destination: string }>;
}

class LocalCommsProvider implements CommsProvider {
  async send(draft: CommsDraft): Promise<{ message: string; destination: string }> {
    return {
      message: `Mock send completed for ${draft.id}`,
      destination: draft.destination
    };
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function createDefaultState(): CommsState {
  return {
    version: 1,
    drafts: [],
    audit: []
  };
}

async function readState(): Promise<CommsState> {
  return readJsonFile(getAssistantCachePath(COMMS_FILE), createDefaultState());
}

async function writeState(state: CommsState): Promise<void> {
  await writeJsonFile(getAssistantCachePath(COMMS_FILE), state);
}

function pushAudit(state: CommsState, entry: Omit<CommsAuditEntry, "id" | "timestamp">) {
  state.audit.push({
    ...entry,
    id: `audit_${crypto.randomUUID()}`,
    timestamp: nowIso()
  });
}

function buildStakeholderBody(input: {
  date: string;
  objective: string;
  outcomes: string[];
  risks: string[];
  asks: string[];
}): string {
  return [
    `Date: ${input.date}`,
    "",
    `Objective: ${input.objective}`,
    "",
    "Status update:",
    ...input.outcomes.map((line) => `- ${line}`),
    "",
    "Current risks:",
    ...(input.risks.length ? input.risks.map((line) => `- ${line}`) : ["- No major risk flagged."]),
    "",
    "Asks:",
    ...(input.asks.length ? input.asks.map((line) => `- ${line}`) : ["- No immediate ask."])
  ].join("\n");
}

export async function createCommsDraft(input: {
  id?: string;
  type?: "stakeholder_update" | "blocked_followup";
  status?: CommsDraft["status"];
  destination?: string;
  date?: string;
  actor?: string;
  subject?: string;
  body?: string;
  sourceDate?: string;
  requiresApproval?: boolean;
}): Promise<CommsDraft> {
  const state = await readState();
  const date = input.date ?? new Date().toISOString().slice(0, 10);
  const type = input.type ?? "stakeholder_update";
  const faithfulDestination = typeof input.destination === "string" ? input.destination.trim() : "";
  const faithfulSubject = typeof input.subject === "string" ? input.subject.trim() : "";
  const faithfulBody = typeof input.body === "string" ? input.body.trim() : "";
  const hasFaithfulPayload =
    faithfulDestination.length > 0 && faithfulSubject.length > 0 && faithfulBody.length > 0;

  let draft: CommsDraft;

  if (hasFaithfulPayload) {
    draft = {
      id: input.id ?? `draft_${crypto.randomUUID()}`,
      type,
      status: input.status ?? "draft",
      destination: faithfulDestination,
      subject: faithfulSubject,
      body: faithfulBody,
      requiresApproval: input.requiresApproval ?? true,
      createdAt: nowIso(),
      sourceDate: input.sourceDate ?? date
    };
  } else {
    const [brief, context] = await Promise.all([generateDailyBrief(date), getAssistantContext()]);

    const objective =
      brief.topOutcomes[0]?.goalReference ||
      context.context.goals[0]?.summary ||
      "Advance weekly execution outcomes and remove blockers.";

    const riskLines = context.context.driftAlerts.slice(0, 3).map((alert) => alert.message);

    const outcomes = brief.topOutcomes.map(
      (outcome) => `${outcome.title} (${outcome.priority}) -> ${outcome.whyNow}`
    );

    const asks =
      type === "blocked_followup"
        ? context.context.driftAlerts
            .filter((alert) => alert.type === "blocked_stale")
            .map((alert) => `Need unblock support for: ${alert.message}`)
        : ["Confirm decision on outstanding dependencies for this week's outcomes."];

    draft = {
      id: input.id ?? `draft_${crypto.randomUUID()}`,
      type,
      status: input.status ?? "draft",
      destination: input.destination ?? "stakeholders@local",
      subject:
        type === "blocked_followup"
          ? `Blocked follow-up (${date})`
          : `Execution update (${date})`,
      body: redactSensitiveContent(
        buildStakeholderBody({
          date,
          objective,
          outcomes,
          risks: riskLines,
          asks
        })
      ),
      requiresApproval: input.requiresApproval ?? true,
      createdAt: nowIso(),
      sourceDate: input.sourceDate ?? date
    };
  }

  state.drafts.push(draft);
  pushAudit(state, {
    draftId: draft.id,
    event: "draft_created",
    actor: input.actor ?? "assistant",
    details: `${draft.type} created for ${draft.destination}`
  });
  await writeState(state);

  return draft;
}

export async function approveCommsDraft(draftId: string, actor = "user"): Promise<CommsApproval> {
  const state = await readState();
  const draft = state.drafts.find((item) => item.id === draftId);

  if (!draft) throw new Error(`Draft not found: ${draftId}`);
  if (draft.status === "sent") throw new Error("Cannot approve a draft that is already sent.");

  draft.status = "approved";
  draft.approvedAt = nowIso();
  draft.approvedBy = actor;
  draft.approvalToken = createApprovalToken();

  pushAudit(state, {
    draftId,
    event: "approved",
    actor,
    details: "Draft approved for sending."
  });

  await writeState(state);

  return {
    draftId,
    approved: true,
    approvedAt: draft.approvedAt,
    approvedBy: actor,
    approvalToken: draft.approvalToken
  };
}

export async function sendCommsDraft(
  draftId: string,
  actor = "user",
  provider: CommsProvider = new LocalCommsProvider()
): Promise<CommsSendResult> {
  const state = await readState();
  const draft = state.drafts.find((item) => item.id === draftId);
  if (!draft) throw new Error(`Draft not found: ${draftId}`);

  const policy = ensureSendAllowed(draft);
  if (!policy.allowed) {
    pushAudit(state, {
      draftId,
      event: "send_denied",
      actor,
      details: policy.reason ?? "Policy denied send."
    });
    await writeState(state);

    return {
      draftId,
      status: "blocked",
      message: policy.reason ?? "Policy denied send.",
      destination: draft.destination
    };
  }

  if (draft.status === "sent") {
    return {
      draftId,
      status: "sent",
      message: "Draft already sent.",
      destination: draft.destination,
      sentAt: draft.sentAt
    };
  }

  const sanitizedSubject = redactSensitiveContent(draft.subject);
  const sanitizedBody = redactSensitiveContent(draft.body);
  const payloadHash = createPayloadHash(`${sanitizedSubject}\n${sanitizedBody}\n${draft.destination}`);

  const providerResult = await provider.send({
    ...draft,
    subject: sanitizedSubject,
    body: sanitizedBody
  });

  draft.status = "sent";
  draft.sentAt = nowIso();
  draft.sentBy = actor;
  draft.payloadHash = payloadHash;

  pushAudit(state, {
    draftId,
    event: "sent",
    actor,
    details: providerResult.message
  });
  await writeState(state);

  return {
    draftId,
    status: "sent",
    message: providerResult.message,
    destination: providerResult.destination,
    sentAt: draft.sentAt
  };
}

export async function getCommsHistory(): Promise<AssistantCommsHistory> {
  const state = await readState();

  return {
    drafts: [...state.drafts].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    audit: [...state.audit].sort((left, right) => right.timestamp.localeCompare(left.timestamp))
  };
}
