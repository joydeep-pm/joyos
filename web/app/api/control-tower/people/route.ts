import { NextResponse } from "next/server";

import { getCachedFeatureRequests } from "@/lib/control-tower/cache";
import { assemblePmPortfolios } from "@/lib/control-tower/people-assembler";
import { readPeopleStore } from "@/lib/control-tower/people-store";
import { readReviewStore } from "@/lib/control-tower/reviews";

function buildEmptyResponse() {
  return {
    success: true,
    summary: {
      generatedAt: new Date().toISOString(),
      totalPMs: 0,
      totalNeedingAttention: 0,
      message: "No PM portfolio data available. Run sync to populate feature requests first."
    },
    pmPortfolios: [],
    diagnostics: []
  };
}

export async function GET() {
  try {
    const featureRequests = await getCachedFeatureRequests();

    if (featureRequests.length === 0) {
      return NextResponse.json(buildEmptyResponse());
    }

    const [reviewStore, peopleStore] = await Promise.all([
      readReviewStore(),
      readPeopleStore()
    ]);
    const assembled = assemblePmPortfolios({
      featureRequests,
      reviewRecords: reviewStore?.reviews ?? [],
      peopleRecords: peopleStore?.records ?? []
    });

    const totalNeedingAttention = assembled.pmPortfolios.filter(
      (portfolio) => portfolio.attention.level !== "low"
    ).length;

    return NextResponse.json({
      success: true,
      summary: {
        generatedAt: new Date().toISOString(),
        totalPMs: assembled.pmPortfolios.length,
        totalNeedingAttention,
        message:
          totalNeedingAttention === 0
            ? "All PM portfolios look up to date."
            : `${totalNeedingAttention} PM portfolio${totalNeedingAttention === 1 ? " needs" : "s need"} attention.`
      },
      pmPortfolios: assembled.pmPortfolios,
      diagnostics: assembled.diagnostics
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: "control_tower_people_brief_failed",
        error: "Failed to assemble PM portfolios",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
