/**
 * Artifact Generation API
 *
 * POST /api/control-tower/artifacts/generate
 * Generate an artifact from a feature request
 */

import { NextRequest, NextResponse } from "next/server";
import { generateArtifact } from "@/lib/control-tower/artifacts/generator";
import { readFeatureRequestCache } from "@/lib/control-tower/cache";
import type { ArtifactType } from "@/lib/control-tower/artifacts/types";
import type { FeatureRequestWithIntervention } from "@/lib/control-tower/intervention-engine";

interface GenerateArtifactRequest {
  featureRequestId: string;
  artifactType: ArtifactType;
  recipientName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateArtifactRequest;
    const { featureRequestId, artifactType, recipientName } = body;

    if (!featureRequestId || !artifactType) {
      return NextResponse.json(
        { error: "Missing required fields: featureRequestId, artifactType" },
        { status: 400 }
      );
    }

    // Read feature requests from cache
    const cache = await readFeatureRequestCache();
    if (!cache) {
      return NextResponse.json({ error: "No feature requests found in cache" }, { status: 404 });
    }

    // Find the specific feature request
    const featureRequest = cache.featureRequests.find(
      (fr) => fr.id === featureRequestId
    ) as FeatureRequestWithIntervention | undefined;

    if (!featureRequest) {
      return NextResponse.json(
        { error: `Feature request not found: ${featureRequestId}` },
        { status: 404 }
      );
    }

    // Generate the artifact
    const artifact = generateArtifact(artifactType, featureRequest, { recipientName });

    return NextResponse.json({
      success: true,
      artifact
    });
  } catch (error) {
    console.error("Error generating artifact:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
