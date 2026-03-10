/**
 * Diagnostics API Route
 *
 * GET /api/control-tower/diagnostics
 * Tests Jira and Confluence connectivity and returns detailed status
 */

import { NextResponse } from "next/server";
import { getJiraConfig, isJiraConfigured, createJiraClient } from "@/lib/integrations/jira";
import { getConfluenceConfig, isConfluenceConfigured, createConfluenceAdapter } from "@/lib/integrations/confluence";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    jira: { configured: false },
    confluence: { configured: false }
  };

  // Jira diagnostics
  if (isJiraConfigured()) {
    const config = getJiraConfig()!;
    diagnostics.jira = {
      configured: true,
      baseUrl: config.baseUrl,
      email: config.email,
      projectKeys: config.projectKeys,
      boardIds: config.boardIds,
      tokenPresent: !!config.apiToken,
      tokenLength: config.apiToken.length
    };

    try {
      const client = createJiraClient(config);
      const ready = client.isReady();
      (diagnostics.jira as Record<string, unknown>).clientReady = ready;

      if (ready) {
        const jql = `project in (${config.projectKeys.join(", ")}) ORDER BY updated DESC`;
        (diagnostics.jira as Record<string, unknown>).jql = jql;

        const result = await client.searchIssues(jql, { maxResults: 5 });
        (diagnostics.jira as Record<string, unknown>).searchResult = {
          total: result?.total ?? 0,
          returned: result?.issues?.length ?? 0,
          firstIssueKey: result?.issues?.[0]?.key ?? null
        };
      }
    } catch (error) {
      (diagnostics.jira as Record<string, unknown>).error = error instanceof Error ? error.message : String(error);
    }
  }

  // Confluence diagnostics
  if (isConfluenceConfigured()) {
    const config = getConfluenceConfig()!;
    diagnostics.confluence = {
      configured: true,
      baseUrl: config.baseUrl,
      email: config.email,
      spaceKeys: config.spaceKeys,
      tokenPresent: !!config.apiToken,
      tokenLength: config.apiToken.length
    };

    try {
      const adapter = createConfluenceAdapter(config);
      const pages = await adapter.fetchPages();
      (diagnostics.confluence as Record<string, unknown>).pagesFound = pages.length;
      (diagnostics.confluence as Record<string, unknown>).firstPageTitle = pages[0]?.title ?? null;
    } catch (error) {
      (diagnostics.confluence as Record<string, unknown>).error = error instanceof Error ? error.message : String(error);
    }
  }

  return NextResponse.json(diagnostics);
}
