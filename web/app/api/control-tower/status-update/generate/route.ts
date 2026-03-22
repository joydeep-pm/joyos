/**
 * Status Update Generator API
 *
 * POST /api/control-tower/status-update/generate
 *
 * Body: { verticalId, format, date? }
 * Returns: { success, output, verticalLabel, featureRequestCount }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  generateStatusUpdate,
  ALL_VERTICALS,
  type VerticalId,
  type StatusUpdateFormat,
} from "@/lib/control-tower/status-update-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { verticalId, format, date } = body;

    if (!verticalId || typeof verticalId !== "string") {
      return NextResponse.json({ success: false, error: "verticalId is required" }, { status: 400 });
    }

    const validFormats: StatusUpdateFormat[] = ["teams_quick", "business_status_update", "roadmap_update"];
    const resolvedFormat: StatusUpdateFormat =
      validFormats.includes(format) ? format : "teams_quick";

    const result = await generateStatusUpdate({
      verticalId: verticalId as VerticalId,
      format: resolvedFormat,
      date: typeof date === "string" ? date : undefined,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/** GET returns the list of available verticals */
export async function GET() {
  return NextResponse.json({
    success: true,
    verticals: [
      { id: "overall", label: "Overall Portfolio", group: "overall" },
      ...ALL_VERTICALS.map((v) => ({
        id: v.id,
        label: v.label,
        group: "product_verticals" in v ? "product" : "platform",
      })),
    ],
  });
}
