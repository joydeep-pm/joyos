import { NextResponse } from "next/server";

import { getCachedFeatureRequests } from "@/lib/control-tower/cache";
import { assemblePmPortfolios } from "@/lib/control-tower/people-assembler";
import { readPeopleStore } from "@/lib/control-tower/people-store";
import { readReviewStore } from "@/lib/control-tower/reviews";
import type { Artifact } from "@/lib/control-tower/artifacts/types";

interface PeopleDraftRequestBody {
  pmName?: string;
  draftType?: "one_on_one_prep" | "idp_feedback";
}

interface PeopleDraftSuccessResponse {
  ok: true;
  data: {
    artifact: Artifact;
  };
}

interface PeopleDraftErrorResponse {
  ok: false;
  error: {
    code:
      | "control_tower_people_draft_invalid_request"
      | "control_tower_people_draft_pm_not_found"
      | "control_tower_people_draft_generation_failed";
    message: string;
    details?: Record<string, unknown>;
  };
}

function isValidDraftType(value: string | undefined): value is "one_on_one_prep" | "idp_feedback" {
  return value === "one_on_one_prep" || value === "idp_feedback";
}

function buildErrorResponse(
  status: number,
  error: PeopleDraftErrorResponse["error"]
): NextResponse<PeopleDraftErrorResponse> {
  return NextResponse.json({ ok: false, error }, { status });
}

function buildArtifact(pm: NonNullable<ReturnType<typeof assemblePmPortfolios>["pmPortfolios"][number]>, draftType: "one_on_one_prep" | "idp_feedback"): Artifact {
  const now = new Date().toISOString();
  const persistedNotes = pm.peopleRecord.record?.privateNotes ?? "No persisted private notes yet.";
  const coachingFocus = pm.peopleRecord.record?.coachingFocus ?? [];
  const evidenceLines = pm.portfolio
    .map((featureRequest) => `- ${featureRequest.title}: ${featureRequest.interventionReasons.map((reason) => reason.message).join("; ") || featureRequest.latestUpdate.summary}`)
    .join("\n");

  const content =
    draftType === "one_on_one_prep"
      ? `# 1:1 Preparation - ${pm.pmName}

## Persisted notes
${persistedNotes}

## Coaching focus
${coachingFocus.length > 0 ? coachingFocus.map((entry) => `- ${entry}`).join("\n") : "- No coaching focus captured yet."}

## Portfolio evidence
${evidenceLines || "- No live portfolio evidence available."}`
      : `# IDP Feedback - ${pm.pmName}

## Persisted notes
${persistedNotes}

## Coaching focus
${coachingFocus.length > 0 ? coachingFocus.map((entry) => `- ${entry}`).join("\n") : "- No coaching focus captured yet."}

## Portfolio evidence
${evidenceLines || "- No live portfolio evidence available."}

Server-authored IDP draft with ${persistedNotes}`;

  return {
    id: `artifact-${pm.pmName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`,
    type: draftType === "one_on_one_prep" ? "status_update" : "idp_feedback",
    title: draftType === "one_on_one_prep" ? `1:1 Prep - ${pm.pmName}` : `IDP Feedback - ${pm.pmName}`,
    content,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    metadata: {
      featureRequestId: `pm-${pm.pmName.replace(/\s+/g, "-").toLowerCase()}`,
      featureRequestTitle: `PM portfolio for ${pm.pmName}`,
      generatedAt: now,
      generatedBy: "Product Control Tower",
      pmOwner: pm.pmName
    }
  };
}

export async function POST(
  request: Request
): Promise<NextResponse<PeopleDraftSuccessResponse | PeopleDraftErrorResponse>> {
  let body: PeopleDraftRequestBody;

  try {
    body = (await request.json()) as PeopleDraftRequestBody;
  } catch {
    return buildErrorResponse(400, {
      code: "control_tower_people_draft_invalid_request",
      message: "Missing required draft fields.",
      details: {
        missingFields: ["pmName", "draftType"]
      }
    });
  }

  if (typeof body.pmName !== "string" || body.pmName.trim().length === 0 || !isValidDraftType(body.draftType)) {
    return buildErrorResponse(400, {
      code: "control_tower_people_draft_invalid_request",
      message: "Missing required draft fields.",
      details: {
        missingFields: [
          ...(typeof body.pmName === "string" && body.pmName.trim().length > 0 ? [] : ["pmName"]),
          ...(isValidDraftType(body.draftType) ? [] : ["draftType"])
        ]
      }
    });
  }

  const pmName = body.pmName.trim();

  try {
    const [featureRequests, reviewStore, peopleStore] = await Promise.all([
      getCachedFeatureRequests(),
      readReviewStore(),
      readPeopleStore()
    ]);

    const assembled = assemblePmPortfolios({
      featureRequests,
      reviewRecords: reviewStore?.reviews ?? [],
      peopleRecords: peopleStore?.records ?? []
    });

    const pm = assembled.pmPortfolios.find((portfolio) => portfolio.pmName === pmName);

    if (!pm) {
      return buildErrorResponse(404, {
        code: "control_tower_people_draft_pm_not_found",
        message: `PM not found in assembled people workspace: ${pmName}`,
        details: {
          pmName,
          diagnostics: assembled.diagnostics
        }
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        artifact: buildArtifact(pm, body.draftType)
      }
    });
  } catch (error) {
    return buildErrorResponse(500, {
      code: "control_tower_people_draft_generation_failed",
      message: "Failed to generate people draft.",
      details: {
        pmName,
        cause: error instanceof Error ? error.message : "Unknown error"
      }
    });
  }
}
