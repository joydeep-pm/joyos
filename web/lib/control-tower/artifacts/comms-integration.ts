/**
 * Comms Integration for Artifacts
 *
 * Converts artifacts to comms drafts for approval-gated sending
 */

import type { Artifact, ArtifactType } from "./types";
import type { CommsDraft } from "@/lib/types";
import { nanoid } from "nanoid";

/**
 * Map artifact types to comms types
 */
function artifactTypeToCommsType(
  artifactType: ArtifactType
): "stakeholder_update" | "blocked_followup" {
  switch (artifactType) {
    case "follow_up":
    case "clarification_request":
      return "blocked_followup";
    case "prd":
    case "user_story":
    case "status_update":
    case "leadership_update":
    case "client_summary":
    case "roadmap_update":
    case "roadmap_deck_outline":
      return "stakeholder_update";
    default:
      return "stakeholder_update";
  }
}

/**
 * Generate subject line from artifact
 */
function generateSubjectLine(artifact: Artifact): string {
  const { type, metadata } = artifact;

  switch (type) {
    case "prd":
      return `PRD: ${metadata.featureRequestTitle}`;
    case "user_story":
      return `User Story: ${metadata.featureRequestTitle}`;
    case "follow_up":
      return `Follow-up: ${metadata.featureRequestTitle}`;
    case "clarification_request":
      return `Clarification Needed: ${metadata.featureRequestTitle}`;
    case "status_update":
      return `Status Update: ${metadata.featureRequestTitle}`;
    case "leadership_update":
      return `Leadership Update: ${metadata.featureRequestTitle}`;
    case "client_summary":
      return `Client Escalation Summary: ${metadata.featureRequestTitle}`;
    case "roadmap_update":
      return `Roadmap Update: ${metadata.featureRequestTitle}`;
    case "roadmap_deck_outline":
      return `Roadmap Deck Outline: ${metadata.featureRequestTitle}`;
    default:
      return metadata.featureRequestTitle;
  }
}

/**
 * Determine destination from artifact metadata
 */
function determineDestination(artifact: Artifact): string {
  const { type, metadata } = artifact;

  // For follow-ups and clarifications, use PM owner
  if (type === "follow_up" || type === "clarification_request") {
    return metadata.pmOwner || "team@example.com";
  }

  // For leadership updates, use leadership channel
  if (type === "leadership_update" || type === "roadmap_deck_outline") {
    return "leadership@example.com";
  }

  if (type === "roadmap_update" && metadata.client) {
    return `${metadata.client.toLowerCase().replace(/\s+/g, "-")}@example.com`;
  }

  // For client summaries, use client contact
  if (type === "client_summary" && metadata.client) {
    return `${metadata.client.toLowerCase().replace(/\s+/g, "-")}@example.com`;
  }

  // Default to stakeholder channel
  return "stakeholders@example.com";
}

/**
 * Convert artifact to comms draft
 */
export function artifactToCommsDraft(artifact: Artifact): CommsDraft {
  return {
    id: `comms-${nanoid(10)}`,
    type: artifactTypeToCommsType(artifact.type),
    status: "draft",
    destination: determineDestination(artifact),
    subject: generateSubjectLine(artifact),
    body: artifact.content,
    requiresApproval: true,
    createdAt: new Date().toISOString(),
    sourceDate: artifact.createdAt
  };
}

/**
 * Check if artifact type can be sent via comms
 */
export function canSendViaComms(artifactType: ArtifactType): boolean {
  return [
    "follow_up",
    "clarification_request",
    "status_update",
    "leadership_update",
    "client_summary",
    "roadmap_update",
    "roadmap_deck_outline"
  ].includes(artifactType);
}
