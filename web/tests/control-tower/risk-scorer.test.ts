/**
 * Tests for Risk Scorer
 */

import { describe, it, expect } from "vitest";
import { calculateRiskSeverity } from "@/lib/control-tower/risk-scorer";
import type { NormalizedJiraIssue } from "@/lib/integrations/jira";

describe("Risk Scorer", () => {
  const baseIssue: NormalizedJiraIssue = {
    key: "PROJ-123",
    title: "Test issue",
    status: "In Progress",
    statusCategory: "indeterminate",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    labels: [],
    comments: [],
    url: "https://jira.example.com/browse/PROJ-123",
    assignee: {
      id: "user1",
      name: "John Doe"
    }
  };

  it("should identify high risk for stale overdue blocked issue", () => {
    const issue: NormalizedJiraIssue = {
      ...baseIssue,
      status: "Blocked",
      priority: "High",
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days ago
    };

    const risk = calculateRiskSeverity(issue, true); // hasClientUrgency = true

    expect(risk.severity).toBe("high");
    expect(risk.factors).toContain("Overdue");
    expect(risk.factors).toContain("Blocked status");
    expect(risk.factors).toContain("Client escalation");
  });

  it("should identify medium risk for stale high-priority issue", () => {
    const issue: NormalizedJiraIssue = {
      ...baseIssue,
      priority: "High",
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
    };

    const risk = calculateRiskSeverity(issue);

    expect(risk.severity).toBe("medium");
    expect(risk.factors.length).toBeGreaterThan(0);
  });

  it("should identify low risk for recent issue with no problems", () => {
    const issue: NormalizedJiraIssue = {
      ...baseIssue,
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    };

    const risk = calculateRiskSeverity(issue);

    expect(risk.severity).toBe("none");
    expect(risk.factors).toEqual([]);
  });

  it("should flag unassigned issues", () => {
    const issue: NormalizedJiraIssue = {
      ...baseIssue,
      assignee: undefined,
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago
    };

    const risk = calculateRiskSeverity(issue);

    expect(risk.factors).toContain("Unassigned");
    expect(risk.severity).not.toBe("none");
  });
});
