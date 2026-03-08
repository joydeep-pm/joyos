/**
 * Artifact Generator
 *
 * Generates structured artifacts from feature request context using templates.
 */

import type { FeatureRequestWithIntervention } from "../intervention-engine";
import type { Artifact, ArtifactType, TemplateContext } from "./types";
import { getTemplate } from "./templates";
import { nanoid } from "nanoid";

/**
 * Create template context from feature request
 */
export function createTemplateContext(fr: FeatureRequestWithIntervention): TemplateContext {
  return {
    featureRequestId: fr.id,
    featureRequestTitle: fr.title,
    source: fr.source,
    stage: fr.stage,
    client: fr.client,
    productCharter: fr.productCharter,
    pmOwner: fr.pmOwner,
    jiraKeys: fr.jiraIssues.map((i) => i.key),
    jiraStatus: fr.jiraIssues.map((i) => i.status),
    jiraAssignees: fr.jiraIssues.map((i) => i.assignee).filter((a): a is string => !!a),
    confluencePageTitles: fr.confluencePages.map((p) => p.title),
    confluencePageUrls: fr.confluencePages.map((p) => p.url),
    riskSeverity: fr.riskSummary.severity,
    riskFactors: fr.riskSummary.factors,
    blockers: fr.blockerSummary.blockers,
    interventionReasons: fr.interventionReasons,
    createdAt: fr.createdAt,
    updatedAt: fr.updatedAt,
    lastSyncedAt: fr.lastSyncedAt
  };
}

/**
 * Generate PRD content from template context
 */
function generatePRDContent(context: TemplateContext): string {
  const template = getTemplate("prd");
  let content = `# Product Requirements Document: ${context.featureRequestTitle}\n\n`;

  // Overview
  content += `## Overview\n\n`;
  content += `**Feature Request:** ${context.featureRequestTitle}\n\n`;
  content += `**Source:** ${context.source}\n\n`;
  if (context.client) {
    content += `**Client:** ${context.client}\n\n`;
  }
  if (context.productCharter) {
    content += `**Product Charter:** ${context.productCharter}\n\n`;
  }
  content += `**Current Stage:** ${context.stage}\n\n`;

  // Background & Context
  content += `## Background & Context\n\n`;
  if (context.jiraKeys.length > 0) {
    content += `**Related Jira Issues:** ${context.jiraKeys.join(", ")}\n\n`;
  }
  if (context.confluencePageTitles.length > 0) {
    content += `**Related Documentation:**\n`;
    context.confluencePageTitles.forEach((title, idx) => {
      content += `- [${title}](${context.confluencePageUrls[idx]})\n`;
    });
    content += `\n`;
  }
  content += `[TODO: Add business context and motivation]\n\n`;

  // Objectives
  content += `## Objectives\n\n`;
  content += `[TODO: Define measurable objectives and success criteria]\n\n`;

  // User Stories
  content += `## User Stories\n\n`;
  content += `[TODO: Add user stories in the format: As a [user], I want to [action] so that [benefit]]\n\n`;

  // Functional Requirements
  content += `## Functional Requirements\n\n`;
  content += `[TODO: List detailed functional specifications]\n\n`;

  // Non-Functional Requirements
  content += `## Non-Functional Requirements\n\n`;
  content += `[TODO: Performance, security, scalability requirements]\n\n`;

  // Dependencies & Assumptions
  content += `## Dependencies & Assumptions\n\n`;
  if (context.blockers.length > 0) {
    content += `**Current Blockers:**\n`;
    context.blockers.forEach((blocker) => {
      content += `- [${blocker.type.toUpperCase()}] ${blocker.description} (${blocker.daysOpen} days)\n`;
    });
    content += `\n`;
  }
  content += `[TODO: Add external dependencies and key assumptions]\n\n`;

  // Out of Scope
  content += `## Out of Scope\n\n`;
  content += `[TODO: What is explicitly not included]\n\n`;

  // Acceptance Criteria
  content += `## Acceptance Criteria\n\n`;
  content += `[TODO: Define conditions for acceptance]\n\n`;

  // Risk Assessment
  if (context.riskSeverity !== "none") {
    content += `## Risk Assessment\n\n`;
    content += `**Risk Level:** ${context.riskSeverity.toUpperCase()}\n\n`;
    if (context.riskFactors.length > 0) {
      content += `**Risk Factors:**\n`;
      context.riskFactors.forEach((factor) => {
        content += `- ${factor}\n`;
      });
      content += `\n`;
    }
  }

  return content;
}

/**
 * Generate User Story content
 */
function generateUserStoryContent(context: TemplateContext): string {
  let content = `# User Story: ${context.featureRequestTitle}\n\n`;

  content += `## Story\n\n`;
  content += `As a [user type],\n`;
  content += `I want to [action],\n`;
  content += `So that [benefit].\n\n`;

  content += `## Context\n\n`;
  content += `**Feature Request:** ${context.featureRequestTitle}\n\n`;
  if (context.jiraKeys.length > 0) {
    content += `**Jira:** ${context.jiraKeys.join(", ")}\n\n`;
  }
  content += `[TODO: Add additional context]\n\n`;

  content += `## Acceptance Criteria\n\n`;
  content += `- [ ] Given [context], When [action], Then [outcome]\n`;
  content += `- [ ] [Add more criteria]\n\n`;

  content += `## Technical Notes\n\n`;
  content += `[TODO: Add technical implementation notes]\n\n`;

  if (context.blockers.length > 0) {
    content += `## Dependencies\n\n`;
    content += `**Current Blockers:**\n`;
    context.blockers.forEach((blocker) => {
      content += `- ${blocker.description}\n`;
    });
    content += `\n`;
  }

  return content;
}

/**
 * Generate Follow-up content
 */
function generateFollowUpContent(context: TemplateContext, recipientName: string = "Team"): string {
  let content = `Hi ${recipientName},\n\n`;

  content += `I'm following up on **${context.featureRequestTitle}**.\n\n`;

  content += `**Current Status:**\n`;
  content += `- Stage: ${context.stage}\n`;
  if (context.jiraKeys.length > 0) {
    content += `- Jira: ${context.jiraKeys.join(", ")} (${context.jiraStatus[0] || "Unknown"})\n`;
  }
  content += `\n`;

  if (context.blockers.length > 0) {
    content += `**Current Blockers:**\n`;
    context.blockers.forEach((blocker) => {
      content += `- ${blocker.description} (${blocker.daysOpen} days open)\n`;
    });
    content += `\n`;
  }

  if (context.interventionReasons.length > 0) {
    content += `**Action Items:**\n`;
    context.interventionReasons.slice(0, 3).forEach((reason) => {
      content += `- ${reason.message}\n`;
    });
    content += `\n`;
  }

  content += `**Next Steps:**\n`;
  content += `[TODO: Add specific next steps and timeline]\n\n`;

  content += `Let me know if you have any questions or need additional information.\n\n`;

  content += `Best regards`;

  return content;
}

/**
 * Generate Clarification Request content
 */
function generateClarificationRequestContent(context: TemplateContext, recipientName: string = "Team"): string {
  let content = `Hi ${recipientName},\n\n`;

  content += `Regarding **${context.featureRequestTitle}**, I need clarification on the following:\n\n`;

  content += `**Questions:**\n`;
  if (context.confluencePageTitles.length === 0) {
    content += `1. Are there existing requirement documents I should review?\n`;
  }
  content += `2. [TODO: Add specific questions]\n\n`;

  content += `**Context:**\n`;
  content += `- Current Stage: ${context.stage}\n`;
  if (context.jiraKeys.length > 0) {
    content += `- Related Jira: ${context.jiraKeys.join(", ")}\n`;
  }
  content += `\n`;

  content += `This information will help us proceed with implementation planning and ensure we're aligned on requirements.\n\n`;

  content += `Could you provide this information by [TODO: Add date]?\n\n`;

  content += `Thank you for your help.\n\n`;

  content += `Best regards`;

  return content;
}

/**
 * Generate Status Update content
 */
function generateStatusUpdateContent(context: TemplateContext): string {
  let content = `# Status Update: ${context.featureRequestTitle}\n\n`;

  content += `**Date:** ${new Date().toLocaleDateString()}\n`;
  if (context.jiraKeys.length > 0) {
    content += `**Jira:** ${context.jiraKeys.join(", ")}\n`;
  }
  content += `**Stage:** ${context.stage}\n\n`;

  // Status indicator
  const status = context.riskSeverity === "high" ? "🔴 Red" : context.riskSeverity === "medium" ? "🟡 Yellow" : "🟢 Green";
  content += `**Status:** ${status}\n\n`;

  content += `## Summary\n\n`;
  content += `[TODO: Brief status summary]\n\n`;

  content += `## Progress\n\n`;
  content += `[TODO: What has been accomplished]\n\n`;

  content += `## Current Work\n\n`;
  content += `[TODO: Work in progress]\n\n`;

  if (context.blockers.length > 0 || context.riskFactors.length > 0) {
    content += `## Blockers & Risks\n\n`;
    if (context.blockers.length > 0) {
      content += `**Active Blockers:**\n`;
      context.blockers.forEach((blocker) => {
        content += `- [${blocker.type.toUpperCase()}] ${blocker.description} (${blocker.daysOpen} days)\n`;
      });
      content += `\n`;
    }
    if (context.riskFactors.length > 0) {
      content += `**Risk Factors:**\n`;
      context.riskFactors.forEach((factor) => {
        content += `- ${factor}\n`;
      });
      content += `\n`;
    }
  }

  content += `## Next Steps\n\n`;
  content += `[TODO: Upcoming work and timeline]\n\n`;

  return content;
}

/**
 * Generate artifact content based on type
 */
export function generateArtifactContent(
  type: ArtifactType,
  context: TemplateContext,
  options?: { recipientName?: string }
): string {
  switch (type) {
    case "prd":
      return generatePRDContent(context);
    case "user_story":
      return generateUserStoryContent(context);
    case "follow_up":
      return generateFollowUpContent(context, options?.recipientName);
    case "clarification_request":
      return generateClarificationRequestContent(context, options?.recipientName);
    case "status_update":
      return generateStatusUpdateContent(context);
    case "leadership_update":
      // For now, use status update as base
      return generateStatusUpdateContent(context);
    case "client_summary":
      // For now, use status update as base
      return generateStatusUpdateContent(context);
    default:
      throw new Error(`Unknown artifact type: ${type}`);
  }
}

/**
 * Generate a complete artifact from feature request
 */
export function generateArtifact(
  type: ArtifactType,
  featureRequest: FeatureRequestWithIntervention,
  options?: { recipientName?: string }
): Artifact {
  const context = createTemplateContext(featureRequest);
  const content = generateArtifactContent(type, context, options);
  const template = getTemplate(type);

  return {
    id: `artifact-${nanoid(10)}`,
    type,
    status: "draft",
    title: `${template.name}: ${featureRequest.title}`,
    content,
    metadata: {
      featureRequestId: featureRequest.id,
      featureRequestTitle: featureRequest.title,
      generatedBy: "system",
      generatedAt: new Date().toISOString(),
      pmOwner: featureRequest.pmOwner,
      client: featureRequest.client
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
