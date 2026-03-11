/**
 * Tests for Grooming Engine readiness integration
 */

import { describe, expect, it } from "vitest";
import { generateGroomingSummary } from "@/lib/control-tower/grooming-engine";
import type { FeatureRequest } from "@/lib/control-tower";

function buildFeatureRequest(overrides: Partial<FeatureRequest> = {}): FeatureRequest {
  return {
    id: "fr-base-001",
    title: "Base feature request",
    source: "pm_ask",
    productCharter: "Payments",
    pmOwner: "Casey",
    stage: "prioritized",
    jiraIssues: [
      {
        key: "PAY-100",
        status: "Ready",
        statusCategory: "indeterminate",
        lastUpdated: new Date().toISOString()
      }
    ],
    confluencePages: [
      {
        id: "conf-100",
        title: "Payments PRD",
        url: "https://example.com/payments-prd",
        lastModified: new Date().toISOString()
      }
    ],
    localNotes: [
      {
        path: "Knowledge/payments.md",
        summary: "Operational notes"
      }
    ],
    riskSummary: { severity: "low", factors: [] },
    blockerSummary: { hasBlockers: false, blockerCount: 0, blockers: [] },
    latestUpdate: {
      date: new Date().toISOString(),
      source: "confluence",
      summary: "PRD refreshed"
    },
    createdAt: new Date("2026-02-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2026-03-01T10:00:00Z").toISOString(),
    lastSyncedAt: new Date().toISOString(),
    ...overrides
  };
}

describe("Grooming Engine", () => {
  it("uses readiness evaluator output to assign categories and compute summary metrics", () => {
    const ready = buildFeatureRequest({
      id: "fr-ready",
      title: "Ready item",
      pmOwner: "Jordan",
      productCharter: "Growth"
    });

    const lowReadiness = buildFeatureRequest({
      id: "fr-low",
      title: "Low-readiness item",
      pmOwner: "Jordan",
      productCharter: "Growth",
      stage: "pm_exploration",
      confluencePages: [],
      localNotes: [],
      jiraIssues: [
        {
          key: "PAY-101",
          status: "Discovery",
          statusCategory: "new",
          lastUpdated: new Date("2026-02-20T10:00:00Z").toISOString()
        }
      ],
      latestUpdate: {
        date: new Date("2026-02-20T10:00:00Z").toISOString(),
        source: "jira",
        summary: "Needs scoping"
      },
      updatedAt: new Date("2026-02-20T10:00:00Z").toISOString()
    });

    const blocked = buildFeatureRequest({
      id: "fr-blocked",
      title: "Blocked item",
      pmOwner: "Morgan",
      productCharter: "Core",
      blockerSummary: {
        hasBlockers: true,
        blockerCount: 1,
        blockers: [
          {
            type: "pm",
            description: "Awaiting PM sign-off",
            daysOpen: 6
          }
        ]
      }
    });

    const summary = generateGroomingSummary([ready, lowReadiness, blocked]);

    expect(summary.totalFeatureRequests).toBe(3);
    expect(summary.readyCount).toBe(1);
    expect(summary.blockedCount).toBe(1);
    expect(summary.estimateCoverage).toBe(33);

    expect(summary.readiness.ready.map((fr) => fr.id)).toEqual(["fr-ready"]);
    expect(summary.readiness.lowReadiness.map((fr) => fr.id)).toEqual(["fr-low"]);
    expect(summary.readiness.blocked.map((fr) => fr.id)).toEqual(["fr-blocked"]);
    expect(summary.readiness.notReady).toEqual([]);

    expect(summary.readiness.evaluations.map((entry) => ({ id: entry.featureRequest.id, verdict: entry.readiness.verdict }))).toEqual([
      { id: "fr-ready", verdict: "ready" },
      { id: "fr-low", verdict: "low_readiness" },
      { id: "fr-blocked", verdict: "blocked" }
    ]);

    expect(summary.byPmOwner.Jordan.lowReadiness.map((fr) => fr.id)).toEqual(["fr-low"]);
    expect(summary.byPmOwner.Morgan.blocked.map((fr) => fr.id)).toEqual(["fr-blocked"]);
    expect(summary.byCharter.Growth.ready.map((fr) => fr.id)).toEqual(["fr-ready"]);
    expect(summary.byCharter.Growth.lowReadiness.map((fr) => fr.id)).toEqual(["fr-low"]);
  });

  it("preserves evaluator diagnostics in grouped readiness views for future inspection", () => {
    const blocked = buildFeatureRequest({
      id: "fr-observable",
      title: "Observable blocker",
      pmOwner: "Taylor",
      productCharter: "Risk",
      blockerSummary: {
        hasBlockers: true,
        blockerCount: 1,
        blockers: [
          {
            type: "client",
            description: "Client confirmation pending",
            daysOpen: 11
          }
        ]
      }
    });

    const summary = generateGroomingSummary([blocked]);
    const evaluation = summary.readiness.evaluations[0];

    expect(evaluation.featureRequest.id).toBe("fr-observable");
    expect(evaluation.readiness.verdict).toBe("blocked");
    expect(evaluation.readiness.blockerClass).toBe("external_dependency");
    expect(evaluation.readiness.dimensions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "unblock_status", status: "fail" })
      ])
    );
    expect(summary.byPmOwner.Taylor.evaluations[0].readiness.recommendedNextStep).toBe(
      "Resolve blockers before grooming commitment"
    );
  });

  it("serializes actionable export details for low-readiness and blocked review lanes", () => {
    const lowReadiness = buildFeatureRequest({
      id: "fr-export-low",
      title: "Needs scoped requirements",
      pmOwner: "Taylor",
      productCharter: "Risk",
      stage: "pm_exploration",
      confluencePages: [],
      localNotes: [],
      jiraIssues: [
        {
          key: "PAY-222",
          status: "Discovery",
          statusCategory: "new",
          lastUpdated: new Date("2026-02-20T10:00:00Z").toISOString()
        }
      ],
      latestUpdate: {
        date: new Date("2026-02-20T10:00:00Z").toISOString(),
        source: "jira",
        summary: "Need scope before review"
      },
      updatedAt: new Date("2026-02-20T10:00:00Z").toISOString()
    });

    const blocked = buildFeatureRequest({
      id: "fr-export-blocked",
      title: "Dependency blocked request",
      pmOwner: "Jordan",
      productCharter: "Core",
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
      }
    });

    const summary = generateGroomingSummary([lowReadiness, blocked]);
    const lowReadinessEntry = summary.readiness.evaluations.find((entry) => entry.featureRequest.id === "fr-export-low");
    const blockedEntry = summary.readiness.evaluations.find((entry) => entry.featureRequest.id === "fr-export-blocked");

    expect(lowReadinessEntry).toBeDefined();
    expect(blockedEntry).toBeDefined();
    expect(lowReadinessEntry?.readiness.missingInputs).toEqual(
      expect.arrayContaining(["documentation_missing", "scope_signal_missing"])
    );
    expect(lowReadinessEntry?.readiness.dimensions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "documentation", rationale: expect.stringContaining("No PRD") }),
        expect.objectContaining({ name: "scope", rationale: expect.stringContaining("Scope boundaries") })
      ])
    );
    expect(blockedEntry?.readiness.blockerClass).toBe("external_dependency");
    expect(blockedEntry?.featureRequest.blockerSummary.blockers[0]).toMatchObject({
      description: "Waiting on platform API contract",
      daysOpen: 9
    });
  });
});
