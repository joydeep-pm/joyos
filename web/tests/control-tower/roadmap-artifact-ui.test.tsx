import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

import { FeatureRequestDetail } from "@/components/intervention/FeatureRequestDetail";
import type { FeatureRequestWithIntervention } from "@/lib/control-tower/intervention-engine";

const fetchMock = vi.fn();

describe("roadmap artifact drafting UI", () => {
  const featureRequest: FeatureRequestWithIntervention = {
    id: "fr-roadmap-001",
    title: "Gold Loan roadmap refresh",
    source: "leadership_request",
    stage: "director_review",
    client: "Business Team",
    productCharter: "Gold Loan",
    pmOwner: "Joydeep",
    jiraIssues: [],
    confluencePages: [],
    localNotes: [],
    riskSummary: {
      severity: "medium",
      factors: ["Roadmap clarity gap"]
    },
    blockerSummary: {
      hasBlockers: false,
      blockerCount: 0,
      blockers: []
    },
    latestUpdate: {
      date: new Date().toISOString(),
      source: "local",
      summary: "Need vertical roadmap communication"
    },
    interventionReasons: [],
    requiresIntervention: true,
    interventionPriority: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
    readiness: {
      verdict: "low_readiness",
      dimensions: [],
      missingInputs: [],
      blockerClass: "none",
      prioritizationPosture: "needs_triage",
      recommendedNextStep: "Draft roadmap communication"
    },
    review: {
      present: true,
      record: {
        id: "review-001",
        featureRequestId: "fr-roadmap-001",
        reviewStatus: "needs_follow_up",
        decisionSummary: "Prepare a stakeholder-friendly roadmap cut for Gold Loan.",
        decisionRationale: "Business stakeholders need a vertical-specific view, not the monthly product update.",
        pendingDecisions: ["Confirm next-quarter commitments"],
        nextActions: ["Draft roadmap update for business review"],
        reviewedBy: "Joydeep",
        source: "director_review",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastReviewedAt: new Date().toISOString()
      }
    }
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        artifact: {
          id: "artifact-1",
          type: "roadmap_update",
          status: "draft",
          title: "Roadmap Update: Gold Loan roadmap refresh",
          content: "# Roadmap Update: Gold Loan",
          metadata: {
            featureRequestId: "fr-roadmap-001",
            featureRequestTitle: "Gold Loan roadmap refresh",
            generatedBy: "system",
            generatedAt: new Date().toISOString(),
            pmOwner: "Joydeep",
            client: "Business Team"
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("exposes roadmap update and roadmap deck drafting actions", async () => {
    render(
      <FeatureRequestDetail
        featureRequest={featureRequest}
        onClose={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: "Draft Roadmap Update" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Draft Roadmap Deck" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Draft Roadmap Update" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/control-tower/artifacts/generate",
        expect.objectContaining({ method: "POST" })
      );
    });

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(requestBody.artifactType).toBe("roadmap_update");
    expect(requestBody.featureRequestId).toBe("fr-roadmap-001");

    expect(await screen.findByText("Roadmap Update: Gold Loan roadmap refresh")).toBeTruthy();
  });
});
