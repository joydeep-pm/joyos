/**
 * Tests for Merge Logic
 */

import { describe, it, expect } from "vitest";
import { findMatchingPages } from "@/lib/control-tower/merge-logic";
import type { NormalizedJiraIssue } from "@/lib/integrations/jira";
import type { NormalizedConfluencePage } from "@/lib/integrations/confluence";

describe("Merge Logic", () => {
  const mockJiraIssue: NormalizedJiraIssue = {
    key: "PROJ-123",
    title: "Co-lending repayment strategy",
    status: "In Progress",
    statusCategory: "indeterminate",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-03-01T15:30:00Z",
    labels: ["co-lending", "repayment"],
    comments: [],
    url: "https://jira.example.com/browse/PROJ-123"
  };

  const mockConfluencePages: NormalizedConfluencePage[] = [
    {
      id: "page1",
      title: "PRD: Co-lending Repayment Strategy (PROJ-123)",
      content: "This PRD describes the co-lending repayment strategy feature for PROJ-123",
      spaceKey: "PROD",
      spaceName: "Product",
      labels: ["prd", "co-lending"],
      version: 3,
      lastModified: "2026-02-15T10:00:00Z",
      url: "https://confluence.example.com/pages/page1"
    },
    {
      id: "page2",
      title: "General Repayment Documentation",
      content: "General documentation about repayment strategies",
      spaceKey: "PROD",
      spaceName: "Product",
      labels: ["documentation"],
      version: 1,
      lastModified: "2026-01-10T10:00:00Z",
      url: "https://confluence.example.com/pages/page2"
    },
    {
      id: "page3",
      title: "Unrelated Page",
      content: "Something completely different",
      spaceKey: "PROD",
      spaceName: "Product",
      labels: [],
      version: 1,
      lastModified: "2026-01-01T10:00:00Z",
      url: "https://confluence.example.com/pages/page3"
    }
  ];

  it("should find pages with direct Jira key reference", () => {
    const matches = findMatchingPages(mockJiraIssue, mockConfluencePages);

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].id).toBe("page1"); // Should prioritize page with Jira key
    expect(matches[0].title).toContain("PROJ-123");
  });

  it("should match pages with similar titles", () => {
    const issue: NormalizedJiraIssue = {
      ...mockJiraIssue,
      key: "PROJ-999" // Different key, won't match directly
    };

    const matches = findMatchingPages(issue, mockConfluencePages);

    // Should still find page1 based on title similarity
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((p) => p.id === "page1")).toBe(true);
  });

  it("should match pages with common labels", () => {
    const issue: NormalizedJiraIssue = {
      ...mockJiraIssue,
      key: "PROJ-999",
      title: "Different title",
      labels: ["co-lending"]
    };

    const matches = findMatchingPages(issue, mockConfluencePages);

    // Should find page1 based on shared label
    expect(matches.some((p) => p.id === "page1")).toBe(true);
  });

  it("should return empty array when no matches found", () => {
    const issue: NormalizedJiraIssue = {
      ...mockJiraIssue,
      key: "UNRELATED-1",
      title: "Completely different feature",
      labels: ["unrelated"]
    };

    const matches = findMatchingPages(issue, mockConfluencePages);

    expect(matches).toEqual([]);
  });
});
