/**
 * Merge Logic
 *
 * Matches Jira issues to Confluence pages using heuristics.
 */

import type { NormalizedJiraIssue } from "@/lib/integrations/jira";
import type { NormalizedConfluencePage } from "@/lib/integrations/confluence";

export interface MatchResult {
  jiraIssue: NormalizedJiraIssue;
  confluencePages: NormalizedConfluencePage[];
  confidence: "high" | "medium" | "low" | "none";
}

/**
 * Check if a Confluence page references a Jira issue key
 */
function pageReferencesJiraKey(page: NormalizedConfluencePage, jiraKey: string): boolean {
  const titleMatch = page.title.toLowerCase().includes(jiraKey.toLowerCase());
  const contentMatch = page.content?.toLowerCase().includes(jiraKey.toLowerCase()) ?? false;

  return titleMatch || contentMatch;
}

/**
 * Calculate similarity score between Jira issue and Confluence page
 */
function calculateSimilarity(issue: NormalizedJiraIssue, page: NormalizedConfluencePage): number {
  let score = 0;

  // Direct Jira key reference is strongest signal
  if (pageReferencesJiraKey(page, issue.key)) {
    score += 10;
  }

  // Title similarity
  const issueWords = new Set(
    issue.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
  const pageWords = new Set(
    page.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  const overlap = [...issueWords].filter((w) => pageWords.has(w)).length;
  const total = new Set([...issueWords, ...pageWords]).size;
  if (total > 0) {
    score += (overlap / total) * 5;
  }

  // Label matching
  const issueLabels = new Set(issue.labels.map((l) => l.toLowerCase()));
  const pageLabels = new Set(page.labels.map((l) => l.toLowerCase()));
  const labelOverlap = [...issueLabels].filter((l) => pageLabels.has(l)).length;
  if (labelOverlap > 0) {
    score += labelOverlap * 2;
  }

  return score;
}

/**
 * Find Confluence pages that match a Jira issue
 */
export function findMatchingPages(issue: NormalizedJiraIssue, pages: NormalizedConfluencePage[]): NormalizedConfluencePage[] {
  const matches: Array<{ page: NormalizedConfluencePage; score: number }> = [];

  for (const page of pages) {
    const score = calculateSimilarity(issue, page);
    if (score > 0) {
      matches.push({ page, score });
    }
  }

  // Sort by score descending and return top matches
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 3).map((m) => m.page);
}

/**
 * Match all Jira issues to Confluence pages
 */
export function matchJiraToConfluence(
  jiraIssues: NormalizedJiraIssue[],
  confluencePages: NormalizedConfluencePage[]
): MatchResult[] {
  return jiraIssues.map((issue) => {
    const matchedPages = findMatchingPages(issue, confluencePages);

    let confidence: MatchResult["confidence"] = "none";
    if (matchedPages.length > 0) {
      // Check if first match has strong signal (Jira key reference)
      const hasDirectReference = pageReferencesJiraKey(matchedPages[0], issue.key);
      if (hasDirectReference) {
        confidence = "high";
      } else if (matchedPages.length > 1) {
        confidence = "medium";
      } else {
        confidence = "low";
      }
    }

    return {
      jiraIssue: issue,
      confluencePages: matchedPages,
      confidence
    };
  });
}
