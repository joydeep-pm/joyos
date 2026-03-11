/**
 * API Route: Grooming Readiness
 *
 * Returns grooming readiness summary for biweekly engineering sessions
 */

import { NextResponse } from "next/server";
import { ingestFeatureRequests } from "@/lib/control-tower/feature-request-engine";
import { generateGroomingSummary } from "@/lib/control-tower/grooming-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Ingest feature requests
    const featureRequests = await ingestFeatureRequests();

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
