/**
 * Individual Director Note API
 *
 * PUT /api/control-tower/notes/[id] - Update note
 * DELETE /api/control-tower/notes/[id] - Delete note
 */

import { NextRequest, NextResponse } from "next/server";
import { updateDirectorNote, deleteDirectorNote } from "@/lib/control-tower/notes";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Missing required field: content" }, { status: 400 });
    }

    const note = await updateDirectorNote(id, content);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      note
    });
  } catch (error) {
    console.error("Error updating director note:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteDirectorNote(id);

    if (!success) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error("Error deleting director note:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
