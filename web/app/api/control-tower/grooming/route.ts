/**
 * API Route: Grooming Readiness
 *
 * Returns grooming readiness summary for biweekly engineering sessions
 */

import { NextResponse } from "next/server";
import { getCachedFeatureRequests } from "@/lib/control-tower/cache";
import { generateGroomingSummary } from "@/lib/control-tower/grooming-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Use the persisted control-tower cache so grooming matches intervention and people views.
    const featureRequests = await getCachedFeatureRequests();

    // Generate grooming summary with serialized readiness diagnostics
    const summary = generateGroomingSummary(featureRequests);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to generate grooming summary:", error);
    return NextResponse.json(
      { error: "Failed to generate grooming summary" },
      { status: 500 }
    );
  }
}
