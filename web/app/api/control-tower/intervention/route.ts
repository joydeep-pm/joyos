/**
 * Intervention Brief API Route
 *
 * GET /api/control-tower/intervention
 * Returns the daily intervention brief with feature requests grouped by PM owner
 */

import { NextResponse } from "next/server";
import {
  assembleFeatureRequests,
  getCachedFeatureRequests,
  readReviewStore,
  type FeatureRequestWithIntervention
} from "@/lib/control-tower";
import { groupByPmOwner } from "@/lib/control-tower/intervention-engine";

function buildEmptyBrief() {
  return {
    generatedAt: new Date().toISOString(),
    date: new Date().toISOString().split("T")[0],
    pmGroups: [],
    totalFeatureRequests: 0,
    totalRequiringIntervention: 0,
    summary: "No feature requests found. Run sync to fetch data from Jira and Confluence."
  };
}

export async function GET() {
  try {
    const featureRequests = await getCachedFeatureRequests();

    if (featureRequests.length === 0) {
      return NextResponse.json({
        success: true,
        brief: buildEmptyBrief(),
        diagnostics: []
      });
    }

    const reviewStore = await readReviewStore();
    const assembled = assembleFeatureRequests({
      featureRequests,
      reviewRecords: reviewStore?.reviews ?? []
    });

    const pmGroups = groupByPmOwner(assembled.featureRequests);
    pmGroups.sort((a, b) => b.totalRequiringIntervention - a.totalRequiringIntervention);

    const totalRequiringIntervention = assembled.featureRequests.filter(
      (fr: FeatureRequestWithIntervention) => fr.requiresIntervention
    ).length;

    const summary =
      totalRequiringIntervention === 0
        ? "All feature requests are on track. No immediate intervention required."
        : `${totalRequiringIntervention} feature request${totalRequiringIntervention > 1 ? "s" : ""} require${totalRequiringIntervention === 1 ? "s" : ""} intervention.`;

    return NextResponse.json({
      success: true,
      brief: {
        generatedAt: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
        pmGroups,
        totalFeatureRequests: assembled.featureRequests.length,
        totalRequiringIntervention,
        summary
      },
      diagnostics: assembled.diagnostics
    });
  } catch (error) {
    console.error("Failed to generate intervention brief:", error);
    return NextResponse.json(
      {
        success: false,
        code: "intervention_brief_failed",
        error: "Failed to generate intervention brief",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
