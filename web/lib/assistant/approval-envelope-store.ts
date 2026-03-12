import crypto from "node:crypto";

import { sendCommsDraft, type CommsProvider } from "@/lib/assistant/comms-engine";
import { getAssistantCachePath, readJsonFile, writeJsonFile } from "@/lib/assistant/storage";

export type ApprovalEnvelopeStatus = "proposed" | "approved" | "denied" | "executed" | "failed";
export type ApprovalEnvelopeActionType = "comms_send" | "jira_writeback" | "confluence_writeback";
export type ApprovalEnvelopeTargetType = "comms_draft" | "jira_issue" | "confluence_page";
export type ApprovalEnvelopeAuditEvent =
  | "proposed"
  | "approved"
  | "denied"
  | "executed"
  | "execution_failed"
  | "transition_rejected";

export interface ApprovalEnvelopeAuditEntry {
  id: string;
  event: ApprovalEnvelopeAuditEvent;
  actor: string;
  timestamp: string;
  details?: string;
}

export interface ApprovalEnvelopeRecord {
  id: string;
  status: ApprovalEnvelopeStatus;
  actionType: ApprovalEnvelopeActionType;
  targetType: ApprovalEnvelopeTargetType;
  targetId: string;
  summary: string;
  evidence: string[];
  proposedBy: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  deniedAt?: string;
  deniedBy?: string;
  denialReason?: string;
  executedAt?: string;
  executedBy?: string;
  failedAt?: string;
  failedBy?: string;
  failureCode?: string;
  failureMessage?: string;
  audit: ApprovalEnvelopeAuditEntry[];
}

interface ApprovalEnvelopeState {
  version: 1;
  envelopes: ApprovalEnvelopeRecord[];
}

interface CreateApprovalEnvelopeInput {
  actionType: ApprovalEnvelopeActionType;
  targetType: ApprovalEnvelopeTargetType;
  targetId: string;
  summary: string;
  evidence: string[];
  proposedBy: string;
}

interface EnvelopeExecutionDependencies {
  sendCommsDraft: (draftId: string, actor?: string, provider?: CommsProvider) => Promise<{
    status: string;
    message: string;
    destination: string;
    sentAt?: string;
  }>;
  provider?: CommsProvider;
}

const APPROVAL_ENVELOPE_FILE = "assistant-approval-envelopes.json";

function nowIso(): string {
  return new Date().toISOString();
}

function createDefaultState(): ApprovalEnvelopeState {
  return {
    version: 1,
    envelopes: []
  };
}

async function readState(): Promise<ApprovalEnvelopeState> {
  return readJsonFile(getAssistantCachePath(APPROVAL_ENVELOPE_FILE), createDefaultState());
}

async function writeState(state: ApprovalEnvelopeState): Promise<void> {
  await writeJsonFile(getAssistantCachePath(APPROVAL_ENVELOPE_FILE), state);
}

function createAuditEntry(
  event: ApprovalEnvelopeAuditEvent,
  actor: string,
  details?: string
): ApprovalEnvelopeAuditEntry {
  return {
    id: `audit_${crypto.randomUUID()}`,
    event,
    actor,
    timestamp: nowIso(),
    details
  };
}

function requireEnvelope(state: ApprovalEnvelopeState, id: string): ApprovalEnvelopeRecord {
  const envelope = state.envelopes.find((entry) => entry.id === id);

  if (!envelope) {
    throw new Error(`Approval envelope not found: ${id}`);
  }

  return envelope;
}

export async function createApprovalEnvelope(
  input: CreateApprovalEnvelopeInput
): Promise<ApprovalEnvelopeRecord> {
  const state = await readState();
  const timestamp = nowIso();

  const envelope: ApprovalEnvelopeRecord = {
    id: `envelope_${crypto.randomUUID()}`,
    status: "proposed",
    actionType: input.actionType,
    targetType: input.targetType,
    targetId: input.targetId,
    summary: input.summary,
    evidence: input.evidence,
    proposedBy: input.proposedBy,
    createdAt: timestamp,
    updatedAt: timestamp,
    audit: [createAuditEntry("proposed", input.proposedBy)]
  };

  state.envelopes.push(envelope);
  await writeState(state);
  return envelope;
}

export async function getApprovalEnvelope(id: string): Promise<ApprovalEnvelopeRecord | null> {
  const state = await readState();
  return state.envelopes.find((envelope) => envelope.id === id) ?? null;
}

export async function listApprovalEnvelopes(): Promise<ApprovalEnvelopeRecord[]> {
  const state = await readState();
  return [...state.envelopes].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function rejectTransition(
  envelope: ApprovalEnvelopeRecord,
  actor: string,
  details: string
): never {
  envelope.audit.push(createAuditEntry("transition_rejected", actor, details));
  envelope.updatedAt = nowIso();
  throw new Error("Invalid envelope transition");
}

export async function approveEnvelope(id: string, actor: string): Promise<ApprovalEnvelopeRecord> {
  const state = await readState();
  const envelope = requireEnvelope(state, id);

  if (envelope.status !== "proposed") {
    try {
      rejectTransition(envelope, actor, `Cannot approve envelope from ${envelope.status} state.`);
    } finally {
      await writeState(state);
    }
  }

  const timestamp = nowIso();
  envelope.status = "approved";
  envelope.approvedAt = timestamp;
  envelope.approvedBy = actor;
  envelope.updatedAt = timestamp;
  envelope.audit.push(createAuditEntry("approved", actor));
  await writeState(state);
  return envelope;
}

export async function denyEnvelope(id: string, actor: string, reason: string): Promise<ApprovalEnvelopeRecord> {
  const state = await readState();
  const envelope = requireEnvelope(state, id);

  if (envelope.status !== "proposed") {
    try {
      rejectTransition(envelope, actor, `Cannot deny envelope from ${envelope.status} state.`);
    } finally {
      await writeState(state);
    }
  }

  const timestamp = nowIso();
  envelope.status = "denied";
  envelope.deniedAt = timestamp;
  envelope.deniedBy = actor;
  envelope.denialReason = reason;
  envelope.updatedAt = timestamp;
  envelope.audit.push(createAuditEntry("denied", actor, reason));
  await writeState(state);
  return envelope;
}

export async function executeEnvelope(
  id: string,
  actor: string,
  dependencies: EnvelopeExecutionDependencies = {
    sendCommsDraft,
    provider: undefined
  }
): Promise<ApprovalEnvelopeRecord> {
  const state = await readState();
  const envelope = requireEnvelope(state, id);

  if (envelope.status === "proposed") {
    envelope.audit.push(createAuditEntry("transition_rejected", actor, "Envelope execution requires prior approval."));
    envelope.updatedAt = nowIso();
    await writeState(state);
    throw new Error("Envelope execution requires approval");
  }

  if (envelope.status !== "approved") {
    try {
      rejectTransition(envelope, actor, `Cannot execute envelope from ${envelope.status} state.`);
    } finally {
      await writeState(state);
    }
  }

  try {
    if (envelope.actionType === "comms_send" && envelope.targetType === "comms_draft") {
      const result = await dependencies.sendCommsDraft(
        envelope.targetId,
        actor,
        dependencies.provider
      );

      if (result.status !== "sent") {
        throw new Error(result.message || "Envelope execution failed");
      }
    } else {
      throw new Error(`Unsupported envelope action: ${envelope.actionType}`);
    }

    const timestamp = nowIso();
    envelope.status = "executed";
    envelope.executedAt = timestamp;
    envelope.executedBy = actor;
    envelope.updatedAt = timestamp;
    envelope.audit.push(createAuditEntry("executed", actor));
    await writeState(state);
    return envelope;
  } catch (error) {
    const timestamp = nowIso();
    envelope.status = "failed";
    envelope.failedAt = timestamp;
    envelope.failedBy = actor;
    envelope.failureCode = "approval_execution_failed";
    envelope.failureMessage = error instanceof Error ? error.message : "Envelope execution failed";
    envelope.updatedAt = timestamp;
    envelope.audit.push(createAuditEntry("execution_failed", actor, envelope.failureMessage));
    await writeState(state);
    throw new Error("Envelope execution failed");
  }
}
