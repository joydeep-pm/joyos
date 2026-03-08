/**
 * Blocker Detector
 *
 * Detects and categorizes blockers from Jira issues.
 */

import type { FeatureRequestBlocker, FeatureRequestBlockerSummary, BlockerType } from "./types";
import type { NormalizedJiraIssue } from "@/lib/integrations/jira";

/**
 * Calculate days a blocker has been open
 */
function daysSinceUpdate(updatedAt: string): number {
  const lastUpdate = new Date(updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - lastUpdate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Detect blocker type from status or comments
 */
function detectBlockerType(status: string, comments: Array<{ body: string }>): BlockerType | null {
  const statusLower = status.toLowerCase();
  const commentText = comments.map((c) => c.body.toLowerCase()).join(" ");

  // Engineering blocker keywords
  if (
    statusLower.includes("engineering") ||
    statusLower.includes("development") ||
    commentText.includes("waiting for dev") ||
    commentText.includes("blocked on engineering")
  ) {
    return "engineering";
  }

  // PM blocker keywords
  if (
    statusLower.includes("pm") ||
    statusLower.includes("product") ||
    commentText.includes("waiting for pm") ||
    commentText.includes("needs product input")
  ) {
    return "pm";
  }

  // Client blocker keywords
  if (
    statusLower.includes("client") ||
    statusLower.includes("customer") ||
    commentText.includes("waiting for client") ||
    commentText.includes("customer response")
  ) {
    return "client";
  }

  // Generic blocked state
  if (statusLower.includes("blocked") || statusLower.includes("waiting") || statusLower.includes("on hold")) {
    return "other";
  }

  return null;
}

/**
 * Extract blocker description from comments
 */
function extractBlockerDescription(comments: Array<{ body: string; createdAt: string }>): string {
  // Find most recent comment mentioning "blocked" or "waiting"
  const recentBlockerComments = comments
    .filter((c) => {
      const bodyLower = c.body.toLowerCase();
      return bodyLower.includes("blocked") || bodyLower.includes("waiting") || bodyLower.includes("blocker");
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (recentBlockerComments.length > 0) {
    // Extract first sentence or first 100 chars
    const body = recentBlockerComments[0].body;
    const firstSentence = body.split(/[.!?]/)[0];
    return firstSentence.slice(0, 100);
  }

  return "Status indicates blocker";
}

/**
 * Detect blockers from a Jira issue
 */
export function detectBlockers(issue: NormalizedJiraIssue): FeatureRequestBlockerSummary {
  const blockers: FeatureRequestBlocker[] = [];

  const blockerType = detectBlockerType(issue.status, issue.comments);

  if (blockerType) {
    const description = extractBlockerDescription(issue.comments);
    const daysOpen = daysSinceUpdate(issue.updatedAt);

    blockers.push({
      type: blockerType,
      description,
      daysOpen
    });
  }

  return {
    hasBlockers: blockers.length > 0,
    blockerCount: blockers.length,
    blockers
  };
}
