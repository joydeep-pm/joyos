/**
 * Tests for Artifact Generator
 */

import { describe, it, expect } from "vitest";
import {
  createTemplateContext,
  generateArtifactContent,
  generateArtifact
} from "@/lib/control-tower/artifacts/generator";
import type { FeatureRequestWithIntervention } from "@/lib/control-tower/intervention-engine";

describe("Artifact Generator", () => {
  const baseFeatureRequest: FeatureRequestWithIntervention = {
    id: "fr-test-001",
    title: "Co-lending repayment strategy",
    source: "client_escalation",
    stage: "in_delivery",
    client: "Test Bank",
    productCharter: "Lending Platform",
    pmOwner: "Alice",
    jiraIssues: [
      {
        key: "PROJ-123",
        status: "In Progress",
        statusCategory: "In Progress",
        assignee: "bob@example.com",
        lastUpdated: new Date().toISOString()
      }
    ],
    confluencePages: [
      {
        id: "page-1",
        title: "Requirements Doc",
        url: "https://confluence.example.com/page-1",
        lastModified: new Date().toISOString()
      }
    ],
    localNotes: [],
    riskSummary: {
      severity: "high",
      factors: ["Client escalation", "Overdue by 10 days"]
    },
    blockerSummary: {
      hasBlockers: true,
      blockerCount: 1,
      blockers: [
        {
          type: "engineering",
          description: "Waiting for backend API",
          daysOpen: 8
        }
      ]
    },
    latestUpdate: {
      date: new Date().toISOString(),
      source: "jira",
      summary: "Test update"
    },
    interventionReasons: [
      {
        type: "client_escalation_aging",
        message: "Client escalation no update for 8 days",
        severity: "high"
      }
    ],
    requiresIntervention: true,
    interventionPriority: 25,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    lastSyncedAt: new Date().toISOString()
  };

  describe("createTemplateContext", () => {
    it("should extract feature request data into template context", () => {
      const context = createTemplateContext(baseFeatureRequest);

      expect(context.featureRequestId).toBe(baseFeatureRequest.id);
      expect(context.featureRequestTitle).toBe(baseFeatureRequest.title);
      expect(context.source).toBe(baseFeatureRequest.source);
      expect(context.stage).toBe(baseFeatureRequest.stage);
      expect(context.client).toBe(baseFeatureRequest.client);
      expect(context.pmOwner).toBe(baseFeatureRequest.pmOwner);
      expect(context.jiraKeys).toEqual(["PROJ-123"]);
      expect(context.jiraStatus).toEqual(["In Progress"]);
      expect(context.jiraAssignees).toEqual(["bob@example.com"]);
      expect(context.confluencePageTitles).toEqual(["Requirements Doc"]);
      expect(context.riskSeverity).toBe("high");
      expect(context.riskFactors).toEqual(["Client escalation", "Overdue by 10 days"]);
      expect(context.blockers).toHaveLength(1);
      expect(context.interventionReasons).toHaveLength(1);
    });

    it("should handle feature request with no Jira or Confluence", () => {
      const fr: FeatureRequestWithIntervention = {
        ...baseFeatureRequest,
        jiraIssues: [],
        confluencePages: []
      };

      const context = createTemplateContext(fr);

      expect(context.jiraKeys).toEqual([]);
      expect(context.jiraStatus).toEqual([]);
      expect(context.confluencePageTitles).toEqual([]);
    });
  });

  describe("generateArtifactContent", () => {
    it("should generate PRD content", () => {
      const context = createTemplateContext(baseFeatureRequest);
      const content = generateArtifactContent("prd", context);

      expect(content).toContain("# Product Requirements Document:");
      expect(content).toContain("Co-lending repayment strategy");
      expect(content).toContain("## Overview");
      expect(content).toContain("**Source:** client_escalation");
      expect(content).toContain("**Client:** Test Bank");
      expect(content).toContain("**Current Stage:** in_delivery");
      expect(content).toContain("## Background & Context");
      expect(content).toContain("**Related Jira Issues:** PROJ-123");
      expect(content).toContain("**Related Documentation:**");
      expect(content).toContain("Requirements Doc");
      expect(content).toContain("## Risk Assessment");
      expect(content).toContain("**Risk Level:** HIGH");
    });

    it("should generate user story content", () => {
      const context = createTemplateContext(baseFeatureRequest);
      const content = generateArtifactContent("user_story", context);

      expect(content).toContain("# User Story:");
      expect(content).toContain("Co-lending repayment strategy");
      expect(content).toContain("## Story");
      expect(content).toContain("As a [user type]");
      expect(content).toContain("I want to [action]");
      expect(content).toContain("So that [benefit]");
      expect(content).toContain("## Acceptance Criteria");
      expect(content).toContain("**Jira:** PROJ-123");
    });

    it("should generate follow-up content with recipient name", () => {
      const context = createTemplateContext(baseFeatureRequest);
      const content = generateArtifactContent("follow_up", context, {
        recipientName: "Bob"
      });

      expect(content).toContain("Hi Bob,");
      expect(content).toContain("I'm following up on **Co-lending repayment strategy**");
      expect(content).toContain("**Current Status:**");
      expect(content).toContain("- Stage: in_delivery");
      expect(content).toContain("- Jira: PROJ-123");
      expect(content).toContain("**Current Blockers:**");
      expect(content).toContain("Waiting for backend API (8 days open)");
      expect(content).toContain("**Action Items:**");
    });

    it("should generate clarification request content", () => {
      const context = createTemplateContext(baseFeatureRequest);
      const content = generateArtifactContent("clarification_request", context, {
        recipientName: "Team"
      });

      expect(content).toContain("Hi Team,");
      expect(content).toContain("Regarding **Co-lending repayment strategy**");
      expect(content).toContain("I need clarification on the following:");
      expect(content).toContain("**Questions:**");
      expect(content).toContain("**Context:**");
      expect(content).toContain("- Current Stage: in_delivery");
    });

    it("should generate status update content with risk indicator", () => {
      const context = createTemplateContext(baseFeatureRequest);
      const content = generateArtifactContent("status_update", context);

      expect(content).toContain("# Status Update:");
      expect(content).toContain("Co-lending repayment strategy");
      expect(content).toContain("**Jira:** PROJ-123");
      expect(content).toContain("**Stage:** in_delivery");
      expect(content).toContain("**Status:** 🔴 Red");
      expect(content).toContain("## Blockers & Risks");
      expect(content).toContain("**Active Blockers:**");
      expect(content).toContain("**Risk Factors:**");
    });

    it("should show green status for low-risk items", () => {
      const fr: FeatureRequestWithIntervention = {
        ...baseFeatureRequest,
        riskSummary: { severity: "none", factors: [] },
        blockerSummary: { hasBlockers: false, blockerCount: 0, blockers: [] }
      };
      const context = createTemplateContext(fr);
      const content = generateArtifactContent("status_update", context);

      expect(content).toContain("**Status:** 🟢 Green");
    });
  });

  describe("generateArtifact", () => {
    it("should create complete artifact with metadata", () => {
      const artifact = generateArtifact("prd", baseFeatureRequest);

      expect(artifact.id).toMatch(/^artifact-/);
      expect(artifact.type).toBe("prd");
      expect(artifact.status).toBe("draft");
      expect(artifact.title).toContain("Product Requirements Document:");
      expect(artifact.title).toContain("Co-lending repayment strategy");
      expect(artifact.content).toContain("# Product Requirements Document:");
      expect(artifact.metadata.featureRequestId).toBe(baseFeatureRequest.id);
      expect(artifact.metadata.featureRequestTitle).toBe(baseFeatureRequest.title);
      expect(artifact.metadata.generatedBy).toBe("system");
      expect(artifact.metadata.pmOwner).toBe("Alice");
      expect(artifact.metadata.client).toBe("Test Bank");
      expect(artifact.createdAt).toBeDefined();
      expect(artifact.updatedAt).toBeDefined();
    });

    it("should generate different artifact types", () => {
      const prd = generateArtifact("prd", baseFeatureRequest);
      const userStory = generateArtifact("user_story", baseFeatureRequest);
      const followUp = generateArtifact("follow_up", baseFeatureRequest, {
        recipientName: "Bob"
      });

      expect(prd.type).toBe("prd");
      expect(userStory.type).toBe("user_story");
      expect(followUp.type).toBe("follow_up");

      expect(prd.content).not.toBe(userStory.content);
      expect(prd.content).not.toBe(followUp.content);
    });
  });
});
