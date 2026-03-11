import { NextResponse } from "next/server";

import { getCachedFeatureRequests } from "@/lib/control-tower/cache";
import { assembleFeatureRequests } from "@/lib/control-tower/feature-request-assembler";
import { readReviewStore, upsertFeatureRequestReview } from "@/lib/control-tower/reviews";
import type {
  FeatureRequestReviewRecord,
  FeatureRequestReviewSource,
  FeatureRequestReviewStatus
} from "@/lib/control-tower/types";

interface ReviewMutationRequestBody {
  featureRequestId?: string;
  reviewStatus?: FeatureRequestReviewStatus;
  decisionSummary?: string;
  decisionRationale?: string;
  pendingDecisions?: string[];
  nextActions?: string[];
  reviewedBy?: string;
  source?: FeatureRequestReviewSource;
}

interface ReviewMutationSuccessResponse {
  ok: true;
  data: {
    review: FeatureRequestReviewRecord;
    created: boolean;
  };
}

interface ReviewMutationErrorResponse {
  ok: false;
  error: {
    code:
      | "control_tower_review_invalid_request"
      | "control_tower_review_feature_request_not_found"
      | "control_tower_review_persistence_failed";
    message: string;
    details?: Record<string, unknown>;
  };
}

const REVIEW_STATUSES: FeatureRequestReviewStatus[] = [
  "approved_for_grooming",
  "needs_follow_up",
  "rejected"
];

const REVIEW_SOURCES: FeatureRequestReviewSource[] = ["director_review", "system_backfill"];

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: string[] | undefined): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function buildErrorResponse(
  status: number,
  error: ReviewMutationErrorResponse["error"]
): NextResponse<ReviewMutationErrorResponse> {
  return NextResponse.json({ ok: false, error }, { status });
}

type ValidatedReviewMutationInput = Parameters<typeof upsertFeatureRequestReview>[0];

function validateBody(
  body: ReviewMutationRequestBody
):
  | {
      ok: true;
      value: ValidatedReviewMutationInput;
      normalized: {
        featureRequestId: string;
        decisionSummary: string;
        decisionRationale: string;
        pendingDecisions: string[];
        nextActions: string[];
        reviewedBy: string;
      };
    }
  | { ok: false; missingFields: string[] } {
  const missingFields: string[] = [];

  if (!isNonEmptyString(body.featureRequestId)) {
    missingFields.push("featureRequestId");
  }

  if (!REVIEW_STATUSES.includes(body.reviewStatus as FeatureRequestReviewStatus)) {
    missingFields.push("reviewStatus");
  }

  if (!isNonEmptyString(body.decisionSummary)) {
    missingFields.push("decisionSummary");
  }

  if (!isNonEmptyString(body.decisionRationale)) {
    missingFields.push("decisionRationale");
  }

  if (!isStringArray(body.pendingDecisions)) {
    missingFields.push("pendingDecisions");
  }

  if (!isStringArray(body.nextActions)) {
    missingFields.push("nextActions");
  }

  if (!isNonEmptyString(body.reviewedBy)) {
    missingFields.push("reviewedBy");
  }

  if (!REVIEW_SOURCES.includes(body.source as FeatureRequestReviewSource)) {
    missingFields.push("source");
  }

  if (missingFields.length > 0) {
    return { ok: false, missingFields };
  }

  const featureRequestId = body.featureRequestId;
  const decisionSummary = body.decisionSummary;
  const decisionRationale = body.decisionRationale;
  const pendingDecisions = body.pendingDecisions;
  const nextActions = body.nextActions;
  const reviewedBy = body.reviewedBy;

  if (
    !featureRequestId ||
    !decisionSummary ||
    !decisionRationale ||
    !pendingDecisions ||
    !nextActions ||
    !reviewedBy
  ) {
    return { ok: false, missingFields };
  }

  const normalized = {
    featureRequestId: featureRequestId.trim(),
    decisionSummary: decisionSummary.trim(),
    decisionRationale: decisionRationale.trim(),
    pendingDecisions: pendingDecisions.map((entry: string) => entry.trim()),
    nextActions: nextActions.map((entry: string) => entry.trim()),
    reviewedBy: reviewedBy.trim()
  };

  return {
    ok: true,
    value: {
      featureRequestId: normalized.featureRequestId,
      reviewStatus: body.reviewStatus as FeatureRequestReviewStatus,
      decisionSummary: normalized.decisionSummary,
      decisionRationale: normalized.decisionRationale,
      pendingDecisions: normalized.pendingDecisions,
      nextActions: normalized.nextActions,
      reviewedBy: normalized.reviewedBy,
      source: body.source as FeatureRequestReviewSource
    },
    normalized
  };
}

export async function POST(request: Request): Promise<NextResponse<ReviewMutationSuccessResponse | ReviewMutationErrorResponse>> {
  let body: ReviewMutationRequestBody;

  try {
    body = (await request.json()) as ReviewMutationRequestBody;
  } catch {
    return buildErrorResponse(400, {
      code: "control_tower_review_invalid_request",
      message: "Missing required review fields.",
      details: {
        missingFields: [
          "featureRequestId",
          "reviewStatus",
          "decisionSummary",
          "decisionRationale",
          "pendingDecisions",
          "nextActions",
          "reviewedBy",
          "source"
        ]
      }
    });
  }

  const validation = validateBody(body);
  if (!validation.ok) {
    return buildErrorResponse(400, {
      code: "control_tower_review_invalid_request",
      message: "Missing required review fields.",
      details: {
        missingFields: validation.missingFields
      }
    });
  }

  const input = validation.value;

  try {
    const [featureRequests, reviewStore] = await Promise.all([
      getCachedFeatureRequests(),
      readReviewStore()
    ]);

    const assembled = assembleFeatureRequests({
      featureRequests,
      reviewRecords: reviewStore?.reviews ?? []
    });

    const existingReview = assembled.featureRequests.find(
      (featureRequest) => featureRequest.id === input.featureRequestId
    )?.review.record;

    if (!assembled.featureRequests.some((featureRequest) => featureRequest.id === input.featureRequestId)) {
      return buildErrorResponse(404, {
        code: "control_tower_review_feature_request_not_found",
        message: `Feature request not found: ${input.featureRequestId}`,
        details: {
          featureRequestId: input.featureRequestId,
          diagnostics: assembled.diagnostics
        }
      });
    }

    const review = await upsertFeatureRequestReview(input);

    return NextResponse.json({
      ok: true,
      data: {
        review,
        created: existingReview === null || existingReview === undefined
      }
    });
  } catch (error) {
    return buildErrorResponse(500, {
      code: "control_tower_review_persistence_failed",
      message: "Failed to persist review.",
      details: {
        featureRequestId: input.featureRequestId,
        cause: error instanceof Error ? error.message : "Unknown error"
      }
    });
  }
}
