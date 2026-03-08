import crypto from "node:crypto";
import type { CommsDraft } from "@/lib/types";

export interface PolicyCheckResult {
  allowed: boolean;
  reason?: string;
}

export function redactSensitiveContent(content: string): string {
  return content
    .replace(/\/Users\/[^\s]+/g, "[REDACTED_PATH]")
    .replace(/\bsk-[A-Za-z0-9]{10,}\b/g, "[REDACTED_TOKEN]")
    .replace(/\bAKIA[0-9A-Z]{16}\b/g, "[REDACTED_TOKEN]");
}

export function createApprovalToken(): string {
  return crypto.randomBytes(12).toString("hex");
}

export function createPayloadHash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function ensureSendAllowed(draft: CommsDraft): PolicyCheckResult {
  if (draft.status !== "approved") {
    return {
      allowed: false,
      reason: "Draft is not approved yet."
    };
  }

  if (!draft.approvalToken || !draft.approvedAt || !draft.approvedBy) {
    return {
      allowed: false,
      reason: "Approval metadata is missing."
    };
  }

  return { allowed: true };
}
