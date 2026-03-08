/**
 * Jira Issue Link Parser
 *
 * Parses Jira issue links to detect CSo↔LEN workflow relationships.
 * CSo tickets contain BRD (Business Requirements Document).
 * LEN tickets contain PRD/User Story (Product Specification).
 * Linked CSo↔LEN tickets represent the SAME requirement at different workflow stages.
 */

import type { JiraIssue, BoardType } from "./types";
import type { CharterMapping } from "./config";

export interface ParsedIssueLink {
  issueKey: string;
  linkedIssueKey: string;
  linkType: string;
  direction: "inward" | "outward";
  isCsoLenPair: boolean; // True if this is a CSo→LEN workflow pair
}

export interface WorkflowPair {
  csoIssueKey?: string;   // CSo ticket (BRD)
  lenIssueKey?: string;   // LEN ticket (PRD/User Story)
  linkType: string;
  isSameRequirement: boolean;
}

/**
 * Parse issue links from Jira issue fields
 */
export function parseIssueLinks(issue: JiraIssue): ParsedIssueLink[] {
  const links: ParsedIssueLink[] = [];
  const issueLinks = (issue.fields as any).issuelinks || [];

  for (const link of issueLinks) {
    if (link.inwardIssue) {
      links.push({
        issueKey: issue.key,
        linkedIssueKey: link.inwardIssue.key,
        linkType: link.type.inward || "relates to",
        direction: "inward",
        isCsoLenPair: false // Will be determined by detectWorkflowPairs
      });
    }
    if (link.outwardIssue) {
      links.push({
        issueKey: issue.key,
        linkedIssueKey: link.outwardIssue.key,
        linkType: link.type.outward || "relates to",
        direction: "outward",
        isCsoLenPair: false
      });
    }
  }

  return links;
}

/**
 * Determine if an issue is from CSo or LEN board based on project key
 */
export function getBoardTypeFromIssueKey(
  issueKey: string,
  charterMapping?: CharterMapping
): BoardType | undefined {
  if (!charterMapping) return undefined;

  const projectKey = issueKey.split("-")[0];
  const projectConfig = charterMapping.projects[projectKey];

  return projectConfig?.type;
}

/**
 * Detect CSo↔LEN workflow pairs from issue links
 * Returns pairs where CSo and LEN tickets are linked (representing same requirement)
 */
export function detectWorkflowPairs(
  links: ParsedIssueLink[],
  charterMapping?: CharterMapping
): WorkflowPair[] {
  if (!charterMapping) return [];

  const pairs: WorkflowPair[] = [];
  const csoLenLinkTypes = charterMapping.linkingRules?.csoToLen?.linkTypes || [
    "relates to",
    "implements",
    "is implemented by"
  ];

  for (const link of links) {
    const sourceType = getBoardTypeFromIssueKey(link.issueKey, charterMapping);
    const targetType = getBoardTypeFromIssueKey(link.linkedIssueKey, charterMapping);

    // Check if this is a CSo↔LEN link
    const isCsoToLen = sourceType === "cso" && targetType === "len";
    const isLenToCso = sourceType === "len" && targetType === "cso";
    const isValidLinkType = csoLenLinkTypes.some((lt) =>
      link.linkType.toLowerCase().includes(lt.toLowerCase())
    );

    if ((isCsoToLen || isLenToCso) && isValidLinkType) {
      pairs.push({
        csoIssueKey: sourceType === "cso" ? link.issueKey : link.linkedIssueKey,
        lenIssueKey: sourceType === "len" ? link.issueKey : link.linkedIssueKey,
        linkType: link.linkType,
        isSameRequirement: true
      });

      // Mark this link as a CSo-LEN pair
      link.isCsoLenPair = true;
    }
  }

  return pairs;
}

/**
 * Extract sprint information from Jira issue (LEN tickets only)
 */
export function extractSprintInfo(issue: JiraIssue): {
  sprintId?: number;
  sprintName?: string;
  sprintState?: string;
} {
  try {
    // Sprint data is typically in a custom field (e.g., customfield_10020)
    // The exact field name varies by Jira configuration
    const fields = issue.fields as any;

    // Common sprint field names
    const sprintFieldKeys = [
      "sprint",
      "customfield_10020", // Common default
      "customfield_10010",
      "customfield_10001"
    ];

    for (const fieldKey of sprintFieldKeys) {
      const sprintData = fields[fieldKey];
      if (sprintData) {
        // Sprint data can be an array or single object
        const sprint = Array.isArray(sprintData) ? sprintData[0] : sprintData;

        if (sprint && typeof sprint === "object") {
          return {
            sprintId: sprint.id,
            sprintName: sprint.name,
            sprintState: sprint.state
          };
        }
      }
    }

    return {};
  } catch (error) {
    console.warn(`Failed to extract sprint info from issue ${issue.key}:`, error);
    return {};
  }
}

/**
 * Determine document type based on board type
 */
export function getDocumentType(boardType?: BoardType): "brd" | "prd" | "user_story" | undefined {
  if (!boardType) return undefined;

  switch (boardType) {
    case "cso":
      return "brd";
    case "len":
      return "prd"; // Can be either PRD or User Story
    default:
      return undefined;
  }
}
