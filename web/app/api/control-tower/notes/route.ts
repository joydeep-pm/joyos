/**
 * Director Notes API
 *
 * GET /api/control-tower/notes?featureRequestId=xyz - Get notes for feature request
 * POST /api/control-tower/notes - Add new note
 */

import { NextRequest, NextResponse } from "next/server";
import { addDirectorNote, getNotesForFeatureRequest } from "@/lib/control-tower/notes";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featureRequestId = searchParams.get("featureRequestId");

    if (!featureRequestId) {
      return NextResponse.json({ error: "Missing featureRequestId parameter" }, { status: 400 });
    }

    const notes = await getNotesForFeatureRequest(featureRequestId);

    return NextResponse.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error("Error getting director notes:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { featureRequestId, content, author } = body;

    if (!featureRequestId || !content) {
      return NextResponse.json(
        { error: "Missing required fields: featureRequestId, content" },
        { status: 400 }
      );
    }

    const note = await addDirectorNote(featureRequestId, content, author);

    return NextResponse.json({
      success: true,
      note
    });
  } catch (error) {
    console.error("Error adding director note:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
