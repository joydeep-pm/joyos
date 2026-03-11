/**
 * Tests for Intervention Engine
 */

import { describe, it, expect } from "vitest";
import {
  detectInterventionReasons,
  analyzeForIntervention,
  groupByPmOwner,
  generateInterventionBrief
} from "@/lib/control-tower/intervention-engine";
import type { FeatureRequest, FeatureRequestReviewRecord } from "@/lib/control-tower";

describe("Intervention Engine", () => {
  const baseReview: FeatureRequestReviewRecord = {
    id: "review-001",
    featureRequestId: "fr-test-001",
    reviewStatus: "needs_follow_up",
    decisionSummary: "Needs dependency confirmation.",
    decisionRationale: "Backend owner has not confirmed API delivery.",
    pendingDecisions: ["Confirm backend owner"],
    nextActions: ["Escalate in delivery sync"],
    reviewedBy: "Director",
    source: "director_review",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastReviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  };

  const baseFeatureRequest: FeatureRequest = {
    id: "fr-test-001",
    title: "Test Feature Request",
    source: "pm_ask",
    stage: "in_delivery",
    jiraIssues: [],
    confluencePages: [],
    localNotes: [],
    riskSummary: {
      severity: "low",
      factors: []
    },
    blockerSummary: {
      hasBlockers: false,
      blockerCount: 0,
      blockers: []
    },
    latestUpdate: {
      date: new Date().toISOString(),
      source: "jira",
      summary: "Test update"
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    lastSyncedAt: new Date().toISOString()
  };

  describe("detectInterventionReasons", () => {
    it("should detect PM blocker intervention", () => {
      const fr: FeatureRequest = {
        ...baseFeatureRequest,
        blockerSummary: {
          hasBlockers: true,
          blockerCount: 1,
          blockers: [
            {
              type: "pm",
              description: "Waiting for PM requirements",
              daysOpen: 8
            }
          ]
        }
      };

      const reasons = detectInterventionReasons(fr);

      expect(reasons.length).toBeGreaterThan(0);
      expect(reasons.some((r) => r.type === "pm_blocked")).toBe(true);
      const pmBlocker = reasons.find((r) => r.type === "pm_blocked");
      expect(pmBlocker?.severity).toBe("high"); // > 7 days
    });

    it("should detect stale engineering dependency", () => {
      const fr: FeatureRequest = {
        ...baseFeatureRequest,
        blockerSummary: {
          hasBlockers: true,
          blockerCount: 1,
          blockers: [
            {
              type: "engineering",
              description: "Waiting for backend API",
              daysOpen: 12
            }
          ]
        }
      };

      const reasons = detectInterventionReasons(fr);

      expect(reasons.some((r) => r.type === "engineering_stale")).toBe(true);
      const engBlocker = reasons.find((r) => r.type === "engineering_stale");
      expect(engBlocker?.severity).toBe("high"); // > 10 days
    });

    it("should detect aging client escalation", () => {
      const fr: FeatureRequest = {
        ...baseFeatureRequest,
        source: "client_escalation",
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago
      };

      const reasons = detectInterventionReasons(fr);

      expect(reasons.some((r) => r.type === "client_escalation_aging")).toBe(true);
      const clientReason = reasons.find((r) => r.type === "client_escalation_aging");
      expect(clientReason?.severity).toBe("high"); // > 7 days
    });

    it("should detect unclear requirements", () => {
      const fr: FeatureRequest = {
        ...baseFeatureRequest,
        stage: "ba_grooming",
        confluencePages: [],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
      };

      const reasons = detectInterventionReasons(fr);

      expect(reasons.some((r) => r.type === "unclear_requirements")).toBe(true);
    });

    it("should detect high-risk item with no action", () => {
      const fr: FeatureRequest = {
        ...baseFeatureRequest,
        riskSummary: {
          severity: "high",
          factors: ["Overdue", "Blocked status"]
        },
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      };

      const reasons = detectInterventionReasons(fr);

      expect(reasons.some((r) => r.type === "high_risk_no_action")).toBe(true);
      expect(reasons.find((r) => r.type === "high_risk_no_action")?.severity).toBe("high");
    });

    it("should return no reasons for healthy feature request", () => {
      const fr: FeatureRequest = {
        ...baseFeatureRequest,
        riskSummary: { severity: "none", factors: [] },
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        confluencePages: [
          {
            id: "page1",
            title: "PRD",
            url: "https://example.com",
            lastModified: new Date().toISOString()
          }
        ]
      };

      const reasons = detectInterventionReasons(fr);

      expect(reasons).toEqual([]);
    });
  });

  describe("analyzeForIntervention", () => {
    it("should add intervention analysis to feature requests", () => {
      const frs: FeatureRequest[] = [
        {
          ...baseFeatureRequest,
          blockerSummary: {
            hasBlockers: true,
            blockerCount: 1,
            blockers: [{ type: "pm", description: "Blocked", daysOpen: 5 }]
          }
        }
      ];

      const analyzed = analyzeForIntervention(frs);

      expect(analyzed[0].interventionReasons).toBeDefined();
      expect(analyzed[0].requiresIntervention).toBe(true);
      expect(analyzed[0].interventionPriority).toBeGreaterThan(0);
      expect(analyzed[0].review).toEqual({
        present: false,
        record: null
      });
    });

    it("attaches persisted review state to downstream intervention results", () => {
      const frs: FeatureRequest[] = [
        {
          ...baseFeatureRequest,
          blockerSummary: {
            hasBlockers: true,
            blockerCount: 1,
            blockers: [{ type: "pm", description: "Blocked", daysOpen: 5 }]
          }
        }
      ];

      const analyzed = analyzeForIntervention(frs, {
        reviewsByFeatureRequestId: {
          [baseReview.featureRequestId]: baseReview
        }
      });

      expect(analyzed[0].review).toEqual({
        present: true,
        record: baseReview
      });
    });
  });

  describe("groupByPmOwner", () => {
    it("should group feature requests by PM owner", () => {
      const frs = analyzeForIntervention([
        { ...baseFeatureRequest, id: "fr-1", pmOwner: "Alice" },
        { ...baseFeatureRequest, id: "fr-2", pmOwner: "Bob" },
        { ...baseFeatureRequest, id: "fr-3", pmOwner: "Alice" }
      ]);

      const groups = groupByPmOwner(frs);

      expect(groups).toHaveLength(2);
      const aliceGroup = groups.find((g) => g.pmOwner === "Alice");
      const bobGroup = groups.find((g) => g.pmOwner === "Bob");

      expect(aliceGroup?.featureRequests).toHaveLength(2);
      expect(bobGroup?.featureRequests).toHaveLength(1);
    });

    it("should calculate totalRequiringIntervention for each group", () => {
      const frs = analyzeForIntervention([
        {
          ...baseFeatureRequest,
          id: "fr-1",
          pmOwner: "Alice",
          riskSummary: { severity: "none", factors: [] },
          updatedAt: new Date().toISOString()
        },
        {
          ...baseFeatureRequest,
          id: "fr-2",
          pmOwner: "Bob",
          riskSummary: { severity: "high", factors: ["Overdue"] },
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

      const groups = groupByPmOwner(frs);

      // Verify totalRequiringIntervention is calculated for each group
      groups.forEach((group) => {
        expect(group.totalRequiringIntervention).toBeGreaterThanOrEqual(0);
        expect(group.totalRequiringIntervention).toBeLessThanOrEqual(group.featureRequests.length);
      });
    });

    it("should handle unassigned feature requests", () => {
      const frs = analyzeForIntervention([{ ...baseFeatureRequest, pmOwner: undefined }]);

      const groups = groupByPmOwner(frs);

      expect(groups).toHaveLength(1);
      expect(groups[0].pmOwner).toBe("Unassigned");
    });
  });

  describe("generateInterventionBrief", () => {
    it("should generate complete intervention brief", () => {
      const frs: FeatureRequest[] = [
        {
          ...baseFeatureRequest,
          id: "fr-1",
          pmOwner: "Alice",
          riskSummary: { severity: "high", factors: ["Overdue"] },
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          ...baseFeatureRequest,
          id: "fr-2",
          pmOwner: "Bob",
          riskSummary: { severity: "medium", factors: [] }
        }
      ];

      const brief = generateInterventionBrief(frs);

      expect(brief.date).toBeDefined();
      expect(brief.totalFeatureRequests).toBe(2);
      expect(brief.pmGroups).toHaveLength(2);
      expect(brief.summary).toBeDefined();
      expect(brief.pmGroups[0].featureRequests[0].review).toEqual({
        present: false,
        record: null
      });
    });

    it("surfaces persisted review context inside the intervention brief", () => {
      const frs: FeatureRequest[] = [
        {
          ...baseFeatureRequest,
          id: "fr-1",
          pmOwner: "Alice",
          riskSummary: { severity: "high", factors: ["Overdue"] },
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const brief = generateInterventionBrief(frs, {
        reviewsByFeatureRequestId: {
          "fr-1": {
            ...baseReview,
            featureRequestId: "fr-1"
          }
        }
      });

      expect(brief.pmGroups[0].featureRequests[0].review).toEqual({
        present: true,
        record: expect.objectContaining({
          reviewStatus: "needs_follow_up",
          pendingDecisions: ["Confirm backend owner"],
          nextActions: ["Escalate in delivery sync"]
        })
      });
    });

    it("should generate appropriate summary for healthy state", () => {
      const frs: FeatureRequest[] = [
        {
          ...baseFeatureRequest,
          riskSummary: { severity: "none", factors: [] },
          updatedAt: new Date().toISOString()
        }
      ];

      const brief = generateInterventionBrief(frs);

      expect(brief.totalRequiringIntervention).toBe(0);
      expect(brief.summary).toContain("on track");
    });

    it("should highlight critical items in summary", () => {
      const frs: FeatureRequest[] = [
        {
          ...baseFeatureRequest,
          pmOwner: "Alice",
          riskSummary: { severity: "high", factors: ["Critical"] },
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const brief = generateInterventionBrief(frs);

      expect(brief.summary).toContain("high-risk");
    });
  });
});
