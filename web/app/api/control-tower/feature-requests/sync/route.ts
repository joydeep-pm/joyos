/**
 * Feature Requests Sync API Route
 *
 * POST /api/control-tower/feature-requests/sync
 * Triggers sync from Jira and Confluence
 */

import { NextRequest, NextResponse } from "next/server";
import { ingestFeatureRequests, writeFeatureRequestCache } from "@/lib/control-tower";
import { isJiraConfigured } from "@/lib/integrations/jira";
import { isConfluenceConfigured } from "@/lib/integrations/confluence";

export async function POST(request: NextRequest) {
  try {
    const jiraConfigured = isJiraConfigured();
    const confluenceConfigured = isConfluenceConfigured();

    if (!jiraConfigured && !confluenceConfigured) {
      return NextResponse.json(
        {
          success: false,
          configurationRequired: true,
          error: "Neither Jira nor Confluence is configured. Please set environment variables."
        }
      );
    }

    // Parse optional sync overrides from request body
    let epicKeys: string[] | undefined;
    let jql: string | undefined;
    try {
      const body = await request.json();
      if (Array.isArray(body?.epicKeys) && body.epicKeys.length > 0) {
        epicKeys = body.epicKeys.map((k: string) => k.trim()).filter(Boolean);
      }
      if (typeof body?.jql === "string" && body.jql.trim().length > 0) {
        jql = body.jql.trim();
      }
    } catch {
      // No body or invalid JSON — use config defaults
    }

    // Ingest and sync (with optional epic filter / JQL override)
    const featureRequests = await ingestFeatureRequests({ forceSync: true, epicKeys, jql });

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
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Failed to sync feature requests:", message, stack);
    return NextResponse.json(
      {
        success: false,
        error: `Sync failed: ${message}`,
        details: message
      },
      { status: 500 }
    );
  }
}
