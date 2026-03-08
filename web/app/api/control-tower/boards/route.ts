/**
 * API Route: Board Configuration
 *
 * Returns configured Jira boards and charter mappings for M2P workflow
 */

import { NextResponse } from "next/server";
import { getJiraConfig } from "@/lib/integrations/jira/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jiraConfig = getJiraConfig();

    if (!jiraConfig) {
      return NextResponse.json(
        { error: "Jira not configured" },
        { status: 503 }
      );
    }

    const charterMapping = jiraConfig.charterMapping;

    if (!charterMapping) {
      return NextResponse.json(
        { error: "Charter mapping not configured" },
        { status: 404 }
      );
    }

    // Return board configuration
    return NextResponse.json({
      boards: Object.entries(charterMapping.boards).map(([id, config]) => ({
        id: parseInt(id, 10),
        name: config.name,
        charter: config.charter,
        type: config.type,
        description: config.description
      })),
      projects: Object.entries(charterMapping.projects).map(([key, config]) => ({
        key,
        name: config.name,
        charter: config.charter,
        type: config.type,
        description: config.description
      })),
      charters: charterMapping.charters,
      linkingRules: charterMapping.linkingRules
    });
  } catch (error) {
    console.error("Failed to get board configuration:", error);
    return NextResponse.json(
      { error: "Failed to load board configuration" },
      { status: 500 }
    );
  }
}
