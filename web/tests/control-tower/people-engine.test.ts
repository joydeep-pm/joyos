import { describe, expect, it, vi } from "vitest";

import {
  extractPerformanceEvidence,
  generatePMPerformanceSummary,
  getPMsNeedingOneOnOnes,
  isOneOnOneOverdue
} from "@/lib/control-tower/people-engine";
import type { FeatureRequest } from "@/lib/control-tower";
import type { PMProfile } from "@/lib/control-tower/people-types";

describe("people engine", () => {
  const now = new Date("2026-03-12T00:00:00.000Z");

  const baseFeatureRequest: FeatureRequest = {
    id: "fr-people-001",
    title: "Merchant settlement reconciliation",
    source: "pm_ask",
    client: "Acme Bank",
    productCharter: "Payments",
    pmOwner: "Alice",
    stage: "pm_exploration",
    jiraIssues: [],
    confluencePages: [],
    localNotes: [],
    riskSummary: {
      severity: "medium",
      factors: ["Waiting on engineering"]
    },
    blockerSummary: {
      hasBlockers: false,
      blockerCount: 0,
      blockers: []
    },
    latestUpdate: {
      date: "2026-03-10T09:00:00.000Z",
      source: "jira",
      summary: "Need requirements refinement"
    },
    createdAt: "2026-02-20T09:00:00.000Z",
    updatedAt: "2026-03-10T09:00:00.000Z",
    lastSyncedAt: "2026-03-11T09:00:00.000Z"
  };

  const pmProfile: PMProfile = {
    id: "pm-alice",
    name: "Alice",
    email: "alice@example.com",
    role: "SPM",
    productCharters: ["Payments"],
    startDate: "2024-01-10",
    lastOneOnOneDate: "2026-02-01"
  };

  it("extracts positive and developmental evidence from a PM portfolio", () => {
    vi.setSystemTime(now);

    const evidence = extractPerformanceEvidence(
      [
        {
          ...baseFeatureRequest,
          confluencePages: [
            {
              id: "page-1",
              title: "Settlement PRD",
              url: "https://example.com/prd",
              lastModified: "2026-03-09T09:00:00.000Z"
            }
          ]
        },
        {
          ...baseFeatureRequest,
          id: "fr-people-002",
          title: "Escalation triage automation",
          stage: "prod_deploy",
          updatedAt: "2026-03-08T09:00:00.000Z"
        },
        {
          ...baseFeatureRequest,
          id: "fr-people-003",
          title: "Refund investigation workspace",
          blockerSummary: {
            hasBlockers: true,
            blockerCount: 1,
            blockers: [
              {
                type: "engineering",
                description: "API contract unresolved",
                daysOpen: 12
              }
            ]
          },
          updatedAt: "2026-03-01T09:00:00.000Z"
        }
      ],
      "Alice"
    );

    expect(evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          evidenceType: "positive",
          category: "prd_quality",
          featureRequestId: "fr-people-001"
        }),
        expect.objectContaining({
          evidenceType: "positive",
          category: "delivery",
          featureRequestId: "fr-people-002"
        }),
        expect.objectContaining({
          evidenceType: "developmental",
          category: "blocker_resolution",
          featureRequestId: "fr-people-003"
        })
      ])
    );
  });

  it("generates a PM performance summary from feature request evidence", () => {
    vi.setSystemTime(now);

    const summary = generatePMPerformanceSummary(
      [
        {
          ...baseFeatureRequest,
          confluencePages: [
            {
              id: "page-1",
              title: "Settlement PRD",
              url: "https://example.com/prd",
              lastModified: "2026-03-09T09:00:00.000Z"
            }
          ]
        },
        {
          ...baseFeatureRequest,
          id: "fr-people-002",
          title: "Escalation triage automation",
          stage: "prod_deploy",
          updatedAt: "2026-03-08T09:00:00.000Z"
        },
        {
          ...baseFeatureRequest,
          id: "fr-people-003",
          title: "Refund investigation workspace",
          blockerSummary: {
            hasBlockers: true,
            blockerCount: 1,
            blockers: [
              {
                type: "engineering",
                description: "API contract unresolved",
                daysOpen: 12
              }
            ]
          },
          updatedAt: "2026-03-01T09:00:00.000Z"
        }
      ],
      pmProfile,
      new Date("2026-03-01T00:00:00.000Z"),
      new Date("2026-03-31T23:59:59.000Z")
    );

    expect(summary).toMatchObject({
      pmId: "pm-alice",
      pmName: "Alice",
      featureRequestCount: 3,
      activeFeatureRequests: 2,
      completedFeatureRequests: 1,
      blockedFeatureRequests: 1,
      strengths: expect.arrayContaining(["1 feature(s) delivered to production"]),
      developmentAreas: []
    });
    expect(summary.evidenceItems.length).toBeGreaterThan(0);
  });

  it("flags overdue 1:1s and returns the PMs needing attention", () => {
    vi.setSystemTime(now);

    expect(isOneOnOneOverdue(pmProfile, 30)).toBe(true);
    expect(
      getPMsNeedingOneOnOnes([
        pmProfile,
        {
          ...pmProfile,
          id: "pm-bob",
          name: "Bob",
          lastOneOnOneDate: "2026-03-05"
        }
      ]).map((pm) => pm.name)
    ).toEqual(["Alice"]);
  });
});
