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
    readinessVerdict: fr.readiness.verdict,
    readinessRecommendedNextStep: fr.readiness.recommendedNextStep,
    reviewPresent: fr.review.present,
    reviewStatus: fr.review.record?.reviewStatus,
    reviewDecisionSummary: fr.review.record?.decisionSummary,
    reviewDecisionRationale: fr.review.record?.decisionRationale,
    reviewPendingDecisions: fr.review.record?.pendingDecisions ?? [],
    reviewNextActions: fr.review.record?.nextActions ?? [],
    reviewReviewedBy: fr.review.record?.reviewedBy,
    reviewLastReviewedAt: fr.review.record?.lastReviewedAt,
    createdAt: fr.createdAt,
    updatedAt: fr.updatedAt,
    lastSyncedAt: fr.lastSyncedAt
  };
}

function appendReviewContext(content: string, context: TemplateContext): string {
  if (!context.reviewPresent) {
    return content;
  }

  let next = content;
  next += `## Director Review Context\n\n`;

  if (context.reviewStatus) {
    next += `**Review Status:** ${context.reviewStatus}\n\n`;
  }

  if (context.reviewDecisionSummary) {
    next += `**Decision Summary:** ${context.reviewDecisionSummary}\n\n`;
  }

  if (context.reviewDecisionRationale) {
    next += `**Decision Rationale:** ${context.reviewDecisionRationale}\n\n`;
  }

  if (context.reviewReviewedBy) {
    next += `**Reviewed By:** ${context.reviewReviewedBy}\n\n`;
  }

  if (context.reviewPendingDecisions.length > 0) {
    next += `**Pending Decisions:**\n`;
    context.reviewPendingDecisions.forEach((decision) => {
      next += `- ${decision}\n`;
    });
    next += `\n`;
  }

  if (context.reviewNextActions.length > 0) {
    next += `**Next Actions:**\n`;
    context.reviewNextActions.forEach((action) => {
      next += `- ${action}\n`;
    });
    next += `\n`;
  }

  return next;
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
  content = appendReviewContext(content, context);

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
  if (context.reviewPresent && context.reviewDecisionSummary) {
    content += `**Director Review:** ${context.reviewDecisionSummary}\n\n`;
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
  if (context.readinessRecommendedNextStep) {
    content += `- Recommended next step: ${context.readinessRecommendedNextStep}\n`;
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

  if (context.reviewPresent) {
    if (context.reviewStatus) {
      content += `**Director Review:** ${context.reviewStatus}\n`;
    }
    if (context.reviewDecisionSummary) {
      content += `**Decision Summary:** ${context.reviewDecisionSummary}\n`;
    }
    if (context.reviewPendingDecisions.length > 0) {
      content += `**Pending Decisions:** ${context.reviewPendingDecisions.join(", ")}\n`;
    }
    if (context.reviewNextActions.length > 0) {
      content += `**Director Next Actions:** ${context.reviewNextActions.join(", ")}\n`;
    }
    content += `\n`;
  }

  content += `**Next Steps:**\n`;
  if (context.reviewNextActions.length > 0) {
    context.reviewNextActions.forEach((action) => {
      content += `- ${action}\n`;
    });
  } else {
    content += `[TODO: Add specific next steps and timeline]\n`;
  }
  content += `\n`;

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
  const clarificationQuestions: string[] = [];

  if (context.confluencePageTitles.length === 0) {
    clarificationQuestions.push("Are there existing requirement documents I should review?");
  }
  context.reviewPendingDecisions.forEach((decision) => {
    clarificationQuestions.push(decision);
  });
  if (clarificationQuestions.length === 0) {
    clarificationQuestions.push("[TODO: Add specific questions]");
  }

  clarificationQuestions.forEach((question, index) => {
    content += `${index + 1}. ${question}\n`;
  });
  content += `\n`;

  content += `**Context:**\n`;
  content += `- Current Stage: ${context.stage}\n`;
  if (context.jiraKeys.length > 0) {
    content += `- Related Jira: ${context.jiraKeys.join(", ")}\n`;
  }
  if (context.reviewDecisionSummary) {
    content += `- Director review summary: ${context.reviewDecisionSummary}\n`;
  }
  if (context.reviewDecisionRationale) {
    content += `- Decision rationale: ${context.reviewDecisionRationale}\n`;
  }
  content += `\n`;

  content += `This information will help us proceed with implementation planning and ensure we're aligned on requirements.\n\n`;

  if (context.reviewNextActions.length > 0) {
    content += `**Requested Next Actions Once Clarified:**\n`;
    context.reviewNextActions.forEach((action) => {
      content += `- ${action}\n`;
    });
    content += `\n`;
  }

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
  if (context.reviewDecisionSummary) {
    content += `${context.reviewDecisionSummary}\n\n`;
  } else {
    content += `[TODO: Brief status summary]\n\n`;
  }

  content += `## Progress\n\n`;
  content += `[TODO: What has been accomplished]\n\n`;

  content += `## Current Work\n\n`;
  content += `[TODO: Work in progress]\n\n`;

  if (context.reviewPresent) {
    content += `## Review Decision\n\n`;
    if (context.reviewStatus) {
      content += `**Review Status:** ${context.reviewStatus}\n\n`;
    }
    if (context.reviewDecisionRationale) {
      content += `**Decision Rationale:** ${context.reviewDecisionRationale}\n\n`;
    }
    if (context.reviewPendingDecisions.length > 0) {
      content += `**Pending Decisions:**\n`;
      context.reviewPendingDecisions.forEach((decision) => {
        content += `- ${decision}\n`;
      });
      content += `\n`;
    }
  }

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
  if (context.reviewNextActions.length > 0) {
    context.reviewNextActions.forEach((action) => {
      content += `- ${action}\n`;
    });
    content += `\n`;
  } else {
    content += `[TODO: Upcoming work and timeline]\n\n`;
  }

  return content;
}

function generateRoadmapUpdateContent(context: TemplateContext): string {
  const vertical = context.productCharter || "Target Vertical";
  const stakeholder = context.client || "Business Stakeholder";
  const quarter = new Date().getMonth() < 3 ? "Q1" : new Date().getMonth() < 6 ? "Q2" : new Date().getMonth() < 9 ? "Q3" : "Q4";

  let content = `# Roadmap Update: ${vertical} — ${context.featureRequestTitle}\n\n`;
  content += `**Audience:** ${stakeholder}\n`;
  content += `**Vertical / Product Area:** ${vertical}\n`;
  content += `**Planning Window:** ${quarter} ${new Date().getFullYear()}\n`;
  if (context.pmOwner) {
    content += `**PM Owner:** ${context.pmOwner}\n`;
  }
  content += `\n`;

  content += `## Roadmap Status\n\n`;
  content += `**Overall Status:** ${context.riskSeverity === "high" ? "At Risk" : context.riskSeverity === "medium" ? "Needs Attention" : "On Track"}\n\n`;

  content += `## Stakeholder Summary\n\n`;
  if (context.reviewDecisionSummary) {
    content += `${context.reviewDecisionSummary}\n\n`;
  } else {
    content += `[TODO: Summarize the roadmap posture for this stakeholder and vertical.]\n\n`;
  }

  content += `## Current Quarter Movement\n\n`;
  if (context.jiraKeys.length > 0) {
    content += `- Active delivery references: ${context.jiraKeys.join(", ")}\n`;
  }
  if (context.readinessRecommendedNextStep) {
    content += `- Recommended next move: ${context.readinessRecommendedNextStep}\n`;
  }
  content += `- [TODO: Add shipped / in-progress roadmap items for this vertical]\n\n`;

  content += `## Next Quarter Focus\n\n`;
  if (context.reviewNextActions.length > 0) {
    context.reviewNextActions.forEach((action) => {
      content += `- ${action}\n`;
    });
  } else {
    content += `- [TODO: Add the next-quarter roadmap priorities]\n`;
  }
  content += `\n`;

  content += `## Risks, Dependencies, and Decisions\n\n`;
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
  if (context.reviewPendingDecisions.length > 0) {
    content += `**Open Decisions:**\n`;
    context.reviewPendingDecisions.forEach((decision) => {
      content += `- ${decision}\n`;
    });
    content += `\n`;
  }

  content += `## Evidence Links\n\n`;
  if (context.confluencePageTitles.length > 0) {
    context.confluencePageTitles.forEach((title, index) => {
      content += `- [${title}](${context.confluencePageUrls[index]})\n`;
    });
  } else {
    content += `- [TODO: Link relevant Confluence or roadmap references]\n`;
  }
  content += `\n`;

  return content;
}

function generateRoadmapDeckOutlineContent(context: TemplateContext): string {
  const portfolio = context.productCharter || "Core Lending Suite";

  let content = `# Roadmap Deck Outline: ${portfolio}\n\n`;
  content += `**Use Case:** Business / RFP conversation\n`;
  content += `**Prepared From:** ${context.featureRequestTitle}\n`;
  content += `**Portfolio Scope:** ${portfolio}\n\n`;

  content += `## Slide 1 — Executive Positioning\n\n`;
  content += `- [TODO: Summarize the portfolio story, market relevance, and business posture]\n\n`;

  content += `## Slide 2 — Vertical Coverage\n\n`;
  content += `- Personal Loan\n- Gold Loan\n- Education Loan\n- LAS\n- LAMF\n- MFI\n- BNPL / Credit Line\n- Consumer Durables\n- Business Loan / SCF\n- Auto Loan\n- LAP\n- Home Loan\n\n`;

  content += `## Slide 3 — Platform Strengths\n\n`;
  content += `- LOS\n- Collections\n- LMS\n- Co-Lending\n- Security / Collateral Management\n- Auction & Repo\n- Legal\n\n`;

  content += `## Slide 4 — Roadmap Themes\n\n`;
  if (context.reviewDecisionSummary) {
    content += `- ${context.reviewDecisionSummary}\n`;
  }
  content += `- [TODO: Add strategic roadmap themes for business-facing use]\n\n`;

  content += `## Slide 5 — Near-Term Delivery Highlights\n\n`;
  if (context.jiraKeys.length > 0) {
    content += `- Delivery references: ${context.jiraKeys.join(", ")}\n`;
  }
  content += `- [TODO: Add flagship initiatives and expected business outcomes]\n\n`;

  content += `## Slide 6 — Risks and Dependencies\n\n`;
  if (context.riskFactors.length > 0) {
    context.riskFactors.forEach((factor) => {
      content += `- ${factor}\n`;
    });
  } else {
    content += `- [TODO: Add major business-visible risks and dependencies]\n`;
  }
  content += `\n`;

  content += `## Slide 7 — Proof Points and References\n\n`;
  if (context.confluencePageTitles.length > 0) {
    context.confluencePageTitles.forEach((title, index) => {
      content += `- ${title}: ${context.confluencePageUrls[index]}\n`;
    });
  } else {
    content += `- [TODO: Add supporting collateral, demos, and source references]\n`;
  }
  content += `\n`;

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
      return generateStatusUpdateContent(context);
    case "client_summary":
      return generateStatusUpdateContent(context);
    case "roadmap_update":
      return generateRoadmapUpdateContent(context);
    case "roadmap_deck_outline":
      return generateRoadmapDeckOutlineContent(context);
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
