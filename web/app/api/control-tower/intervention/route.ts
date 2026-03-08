/**
 * Intervention Brief API Route
 *
 * GET /api/control-tower/intervention
 * Returns the daily intervention brief with feature requests grouped by PM owner
 */

import { NextResponse } from "next/server";
import { getCachedFeatureRequests } from "@/lib/control-tower";
import { generateInterventionBrief } from "@/lib/control-tower/intervention-engine";

export async function GET() {
  try {
    const featureRequests = await getCachedFeatureRequests();

    if (featureRequests.length === 0) {
      return NextResponse.json({
        success: true,
        brief: {
          generatedAt: new Date().toISOString(),
          date: new Date().toISOString().split("T")[0],
          pmGroups: [],
          totalFeatureRequests: 0,
          totalRequiringIntervention: 0,
          summary: "No feature requests found. Run sync to fetch data from Jira and Confluence."
        }
      });
    }

    const brief = generateInterventionBrief(featureRequests);

    return NextResponse.json({
      success: true,
      brief
    });
  } catch (error) {
    console.error("Failed to generate intervention brief:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate intervention brief",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
