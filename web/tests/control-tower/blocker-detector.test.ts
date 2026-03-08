/**
 * Tests for Blocker Detector
 */

import { describe, it, expect } from "vitest";
import { detectBlockers } from "@/lib/control-tower/blocker-detector";
import type { NormalizedJiraIssue } from "@/lib/integrations/jira";

describe("Blocker Detector", () => {
  const baseIssue: NormalizedJiraIssue = {
    key: "PROJ-123",
    title: "Test issue",
    status: "In Progress",
    statusCategory: "indeterminate",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    labels: [],
    comments: [],
    url: "https://jira.example.com/browse/PROJ-123"
  };

  it("should detect engineering blocker from status", () => {
    const issue: NormalizedJiraIssue = {
      ...baseIssue,
      status: "Blocked - Engineering"
    };

    const result = detectBlockers(issue);

    expect(result.hasBlockers).toBe(true);
    expect(result.blockerCount).toBe(1);
    expect(result.blockers[0].type).toBe("engineering");
    expect(result.blockers[0].daysOpen).toBeGreaterThan(0);
  });

  it("should detect PM blocker from comments", () => {
    const issue: NormalizedJiraIssue = {
      ...baseIssue,
      status: "Blocked",
      comments: [
        {
          author: "John Doe",
          body: "Blocked - waiting for PM to provide requirements",
          createdAt: "2026-03-01T10:00:00Z"
        }
      ]
    };

    const result = detectBlockers(issue);

    expect(result.hasBlockers).toBe(true);
    expect(result.blockers[0].type).toBe("pm");
    expect(result.blockers[0].description).toContain("waiting for PM");
  });

  it("should detect client blocker from comments", () => {
    const issue: NormalizedJiraIssue = {
      ...baseIssue,
      status: "Waiting for Client",
      comments: [
        {
          author: "Jane Smith",
          body: "Blocked - waiting for client response on requirements",
          createdAt: "2026-03-02T10:00:00Z"
        }
      ]
    };

    const result = detectBlockers(issue);

    expect(result.hasBlockers).toBe(true);
    expect(result.blockers[0].type).toBe("client");
  });

  it("should return no blockers for normal in-progress issue", () => {
    const issue: NormalizedJiraIssue = {
      ...baseIssue,
      status: "In Progress",
      comments: [
        {
          author: "Developer",
          body: "Working on implementation",
          createdAt: "2026-03-05T10:00:00Z"
        }
      ]
    };

    const result = detectBlockers(issue);

    expect(result.hasBlockers).toBe(false);
    expect(result.blockerCount).toBe(0);
    expect(result.blockers).toEqual([]);
  });

  it("should detect generic blocker from blocked status", () => {
    const issue: NormalizedJiraIssue = {
      ...baseIssue,
      status: "On Hold"
    };

    const result = detectBlockers(issue);

    expect(result.hasBlockers).toBe(true);
    expect(result.blockers[0].type).toBe("other");
  });
});
