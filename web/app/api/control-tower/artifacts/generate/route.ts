/**
 * Artifact Generation API
 *
 * POST /api/control-tower/artifacts/generate
 * Generate an artifact from a feature request
 */

import { NextRequest, NextResponse } from "next/server";
import { generateArtifact } from "@/lib/control-tower/artifacts/generator";
import {
  assembleFeatureRequests,
  getCachedFeatureRequests,
  readReviewStore
} from "@/lib/control-tower";
import type { ArtifactType } from "@/lib/control-tower/artifacts/types";

interface GenerateArtifactRequest {
  featureRequestId: string;
  artifactType: ArtifactType;
  recipientName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<GenerateArtifactRequest>;
    const { featureRequestId, artifactType, recipientName } = body;

    if (!featureRequestId || !artifactType) {
      return NextResponse.json(
        {
          success: false,
          code: "artifact_generation_invalid_request",
          error: "Missing required fields: featureRequestId, artifactType"
        },
        { status: 400 }
      );
    }

    const featureRequests = await getCachedFeatureRequests();
    if (featureRequests.length === 0) {
      return NextResponse.json(
        {
          success: false,
          code: "artifact_generation_cache_empty",
          error: "No feature requests found in cache"
        },
        { status: 404 }
      );
    }

    const reviewStore = await readReviewStore();
    const assembled = assembleFeatureRequests({
      featureRequests,
      reviewRecords: reviewStore?.reviews ?? []
    });

    const featureRequest = assembled.featureRequests.find((fr) => fr.id === featureRequestId);

    if (!featureRequest) {
      return NextResponse.json(
        {
          success: false,
          code: "artifact_generation_feature_request_not_found",
          error: `Feature request not found: ${featureRequestId}`,
          details: {
            featureRequestId,
            diagnostics: assembled.diagnostics
          }
        },
        { status: 404 }
      );
    }

    const artifact = generateArtifact(artifactType, featureRequest, { recipientName });

    return NextResponse.json({
      success: true,
      artifact,
      diagnostics: assembled.diagnostics
    });
  } catch (error) {
    console.error("Error generating artifact:", error);
    return NextResponse.json(
      {
        success: false,
        code: "artifact_generation_failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
