/**
 * Tests for Jira Adapter
 */

import { describe, it, expect } from "vitest";
import { normalizeJiraIssue } from "@/lib/integrations/jira/adapter";
import type { JiraIssue } from "@/lib/integrations/jira/types";

describe("Jira Adapter", () => {
  it("should normalize a Jira issue correctly", () => {
    const mockIssue: JiraIssue = {
      id: "10001",
      key: "PROJ-123",
      self: "https://jira.example.com/rest/api/3/issue/10001",
      fields: {
        summary: "Add co-lending repayment strategy",
        description: "Feature request for co-lending",
        status: {
          id: "3",
          name: "In Progress",
          statusCategory: {
            key: "indeterminate",
            name: "In Progress"
          }
        },
        priority: {
          id: "2",
          name: "High"
        },
        assignee: {
          accountId: "user123",
          displayName: "John Doe",
          emailAddress: "john@example.com"
        },
        reporter: {
          accountId: "user456",
          displayName: "Jane Smith",
          emailAddress: "jane@example.com"
        },
        created: "2026-01-15T10:00:00Z",
        updated: "2026-03-01T15:30:00Z",
        duedate: "2026-03-15",
        labels: ["client-escalation", "co-lending"],
        comment: {
          comments: [
            {
              id: "c1",
              author: {
                accountId: "user789",
                displayName: "Bob Wilson"
              },
              body: "Waiting for engineering input",
              created: "2026-02-20T10:00:00Z",
              updated: "2026-02-20T10:00:00Z"
            }
          ],
          maxResults: 1,
          total: 1
        }
      }
    };

    const normalized = normalizeJiraIssue(mockIssue, "https://jira.example.com");

    expect(normalized.key).toBe("PROJ-123");
    expect(normalized.title).toBe("Add co-lending repayment strategy");
    expect(normalized.status).toBe("In Progress");
    expect(normalized.statusCategory).toBe("indeterminate");
    expect(normalized.priority).toBe("High");
    expect(normalized.assignee?.name).toBe("John Doe");
    expect(normalized.assignee?.email).toBe("john@example.com");
    expect(normalized.labels).toEqual(["client-escalation", "co-lending"]);
    expect(normalized.comments).toHaveLength(1);
    expect(normalized.comments[0].author).toBe("Bob Wilson");
    expect(normalized.url).toBe("https://jira.example.com/browse/PROJ-123");
  });

  it("should handle missing optional fields", () => {
    const mockIssue: JiraIssue = {
      id: "10002",
      key: "PROJ-124",
      self: "https://jira.example.com/rest/api/3/issue/10002",
      fields: {
        summary: "Simple task",
        status: {
          id: "1",
          name: "To Do",
          statusCategory: {
            key: "new",
            name: "To Do"
          }
        },
        reporter: {
          accountId: "user456",
          displayName: "Jane Smith"
        },
        created: "2026-03-01T10:00:00Z",
        updated: "2026-03-01T10:00:00Z"
      }
    };

    const normalized = normalizeJiraIssue(mockIssue, "https://jira.example.com");

    expect(normalized.description).toBeUndefined();
    expect(normalized.priority).toBeUndefined();
    expect(normalized.assignee).toBeUndefined();
    expect(normalized.dueDate).toBeUndefined();
    expect(normalized.labels).toEqual([]);
    expect(normalized.comments).toEqual([]);
  });
});
