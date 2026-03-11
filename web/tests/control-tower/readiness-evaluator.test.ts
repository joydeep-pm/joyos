/**
 * Tests for Readiness Evaluator contract
 */

import { describe, expect, it } from "vitest";
import { evaluateReadiness } from "@/lib/control-tower/readiness-evaluator";
import type {
  FeatureRequest,
  FeatureRequestReadinessBlockerClass,
  FeatureRequestReadinessDimensionName,
  FeatureRequestReadinessMissingInputCode,
  FeatureRequestReadinessVerdict
} from "@/lib/control-tower";

function buildFeatureRequest(overrides: Partial<FeatureRequest> = {}): FeatureRequest {
  return {
    id: "fr-ready-001",
    title: "Pilot scoped rollout",
    source: "pm_ask",
    productCharter: "Core Product",
    pmOwner: "Avery",
    stage: "prioritized",
    jiraIssues: [
      {
        key: "CT-101",
        status: "Ready for estimation",
        statusCategory: "indeterminate",
        lastUpdated: new Date().toISOString()
      }
    ],
    confluencePages: [
      {
        id: "conf-1",
        title: "Pilot scoped rollout PRD",
        url: "https://example.com/prd",
        lastModified: new Date().toISOString()
      }
    ],
    localNotes: [
      {
        path: "Knowledge/pilot-rollout.md",
        summary: "Customer impact and success metrics captured"
      }
    ],
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
      source: "confluence",
      summary: "PRD updated with scope and dependencies"
    },
    recommendedNextStep: "Bring to next grooming",
    createdAt: new Date("2026-02-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2026-03-01T10:00:00Z").toISOString(),
    lastSyncedAt: new Date().toISOString(),
    ...overrides
  };
}

describe("Readiness Evaluator", () => {
  it("returns a ready verdict with passing rubric dimensions and a grooming next step", () => {
    const result = evaluateReadiness(buildFeatureRequest());

    expect(result.verdict satisfies FeatureRequestReadinessVerdict).toBe("ready");
    expect(result.prioritizationPosture).toBe("scheduled");
    expect(result.recommendedNextStep).toBe("Schedule for engineering grooming");
    expect(result.missingInputs).toEqual([]);
    expect(result.blockerClass).toBe("none");

    const dimensions = new Map(result.dimensions.map((dimension) => [dimension.name, dimension]));

    expect(Array.from(dimensions.keys()).sort()).toEqual([
      "documentation",
      "freshness",
      "prioritization",
      "scope",
      "stage",
      "unblock_status"
    ] satisfies FeatureRequestReadinessDimensionName[]);

    expect(dimensions.get("documentation")).toMatchObject({ status: "pass" });
    expect(dimensions.get("scope")).toMatchObject({ status: "pass" });
    expect(dimensions.get("stage")).toMatchObject({ status: "pass" });
    expect(dimensions.get("unblock_status")).toMatchObject({ status: "pass" });
    expect(dimensions.get("prioritization")).toMatchObject({ status: "pass" });
    expect(dimensions.get("freshness")).toMatchObject({ status: "pass" });
  });

  it("returns low_readiness with machine-readable missing inputs and a clarification next step", () => {
    const result = evaluateReadiness(
      buildFeatureRequest({
        id: "fr-low-001",
        stage: "pm_exploration",
        confluencePages: [],
        localNotes: [],
        jiraIssues: [
          {
            key: "CT-102",
            status: "In analysis",
            statusCategory: "new",
            lastUpdated: new Date("2026-02-20T10:00:00Z").toISOString()
          }
        ],
        riskSummary: {
          severity: "medium",
          factors: ["Pending customer decision"]
        },
        latestUpdate: {
          date: new Date("2026-02-20T10:00:00Z").toISOString(),
          source: "jira",
          summary: "Awaiting scope definition"
        },
        recommendedNextStep: undefined,
        updatedAt: new Date("2026-02-20T10:00:00Z").toISOString()
      })
    );

    expect(result.verdict).toBe("low_readiness");
    expect(result.blockerClass).toBe("none");
    expect(result.prioritizationPosture).toBe("needs_triage");
    expect(result.recommendedNextStep).toBe("Clarify scope and documentation before grooming");
    expect(result.missingInputs.sort()).toEqual([
      "documentation_missing",
      "scope_signal_missing"
    ] satisfies FeatureRequestReadinessMissingInputCode[]);

    expect(result.dimensions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "documentation", status: "fail" }),
        expect.objectContaining({ name: "scope", status: "fail" }),
        expect.objectContaining({ name: "stage", status: "warn" }),
        expect.objectContaining({ name: "prioritization", status: "warn" })
      ])
    );
  });

  it("returns blocked when active blockers supersede otherwise-ready signals", () => {
    const result = evaluateReadiness(
      buildFeatureRequest({
        id: "fr-blocked-001",
        blockerSummary: {
          hasBlockers: true,
          blockerCount: 1,
          blockers: [
            {
              type: "engineering",
              description: "Waiting on platform API contract",
              daysOpen: 9
            }
          ]
        },
        riskSummary: {
          severity: "high",
          factors: ["External dependency"]
        }
      })
    );

    expect(result.verdict).toBe("blocked");
    expect(result.blockerClass satisfies FeatureRequestReadinessBlockerClass).toBe("external_dependency");
    expect(result.prioritizationPosture).toBe("expedite_blocker_resolution");
    expect(result.recommendedNextStep).toBe("Resolve blockers before grooming commitment");
    expect(result.missingInputs).toEqual([]);
    expect(result.dimensions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "unblock_status", status: "fail" }),
        expect.objectContaining({ name: "stage", status: "pass" }),
        expect.objectContaining({ name: "documentation", status: "pass" })
      ])
    );
  });
});
