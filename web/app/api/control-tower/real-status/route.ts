/**
 * Real Status API Routes
 *
 * GET  /api/control-tower/real-status          - Get all real status overrides
 * POST /api/control-tower/real-status          - Set real status for a feature request
 * POST /api/control-tower/real-status/reviewed - Mark as reviewed today (no status change)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getRealStatusMap,
  setRealStatus,
  markReviewedToday,
  resetDailyReviewFlags,
  type RealStatusValue,
} from "@/lib/control-tower/real-status";

export async function GET() {
  try {
    // Reset any stale daily review flags first
    await resetDailyReviewFlags();
    const map = await getRealStatusMap();
    return NextResponse.json({ success: true, statuses: map });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { featureRequestId, jiraKeys, status, note, reviewedOnly } = body;

    if (!featureRequestId || typeof featureRequestId !== "string") {
      return NextResponse.json({ success: false, error: "featureRequestId is required" }, { status: 400 });
    }

    // reviewedOnly = just mark reviewed without changing status
    if (reviewedOnly === true) {
      await markReviewedToday(featureRequestId);
      return NextResponse.json({ success: true });
    }

    if (!status || typeof status !== "string") {
      return NextResponse.json({ success: false, error: "status is required" }, { status: 400 });
    }

    const entry = await setRealStatus(
      featureRequestId,
      Array.isArray(jiraKeys) ? jiraKeys : [],
      status as RealStatusValue,
      typeof note === "string" ? note : ""
    );

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
