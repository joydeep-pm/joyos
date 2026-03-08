/**
 * Feature Requests Sync API Route
 *
 * POST /api/control-tower/feature-requests/sync
 * Triggers sync from Jira and Confluence
 */

import { NextResponse } from "next/server";
import { ingestFeatureRequests, writeFeatureRequestCache } from "@/lib/control-tower";
import { isJiraConfigured } from "@/lib/integrations/jira";
import { isConfluenceConfigured } from "@/lib/integrations/confluence";

export async function POST() {
  try {
    const jiraConfigured = isJiraConfigured();
    const confluenceConfigured = isConfluenceConfigured();

    if (!jiraConfigured && !confluenceConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: "Neither Jira nor Confluence is configured. Please set environment variables."
        },
        { status: 400 }
      );
    }

    // Ingest and sync
    const featureRequests = await ingestFeatureRequests({ forceSync: true });

    // Write to cache
    await writeFeatureRequestCache(featureRequests);

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      count: featureRequests.length,
      sources: {
        jiraConfigured,
        confluenceConfigured
      }
    });
  } catch (error) {
    console.error("Failed to sync feature requests:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync feature requests",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
