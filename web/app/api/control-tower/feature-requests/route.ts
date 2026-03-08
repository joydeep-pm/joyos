/**
 * Feature Requests API Route
 *
 * Endpoints:
 * - GET /api/control-tower/feature-requests - List feature requests with filtering
 * - POST /api/control-tower/feature-requests/sync - Sync from Jira/Confluence
 */

import { NextResponse } from "next/server";
import {
  getCachedFeatureRequests,
  ingestFeatureRequests,
  writeFeatureRequestCache,
  type FeatureRequest,
  type RiskSeverity
} from "@/lib/control-tower";

/**
 * GET /api/control-tower/feature-requests
 *
 * Query params:
 * - pmOwner: Filter by PM owner
 * - riskSeverity: Filter by risk severity (high, medium, low, none)
 * - stage: Filter by stage
 * - client: Filter by client
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pmOwner = searchParams.get("pmOwner");
    const riskSeverity = searchParams.get("riskSeverity") as RiskSeverity | null;
    const stage = searchParams.get("stage");
    const client = searchParams.get("client");

    let featureRequests = await getCachedFeatureRequests();

    // Apply filters
    if (pmOwner) {
      featureRequests = featureRequests.filter((fr) => fr.pmOwner === pmOwner);
    }

    if (riskSeverity) {
      featureRequests = featureRequests.filter((fr) => fr.riskSummary.severity === riskSeverity);
    }

    if (stage) {
      featureRequests = featureRequests.filter((fr) => fr.stage === stage);
    }

    if (client) {
      featureRequests = featureRequests.filter((fr) => fr.client === client);
    }

    return NextResponse.json({
      success: true,
      count: featureRequests.length,
      featureRequests
    });
  } catch (error) {
    console.error("Failed to fetch feature requests:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch feature requests"
      },
      { status: 500 }
    );
  }
}
