import { analyzeForIntervention, type FeatureRequestWithIntervention } from "./intervention-engine";
import { evaluateReadiness } from "./readiness-evaluator";
import type {
  EnrichedFeatureRequest,
  FeatureRequest,
  FeatureRequestAssemblyDiagnostic,
  FeatureRequestReviewOverlay,
  FeatureRequestReviewRecord
} from "./types";

export interface AssembleFeatureRequestsInput {
  featureRequests: FeatureRequest[];
  reviewRecords: FeatureRequestReviewRecord[];
}

export interface AssembleFeatureRequestsResult {
  featureRequests: FeatureRequestWithIntervention[];
  diagnostics: FeatureRequestAssemblyDiagnostic[];
}

function buildReviewOverlay(
  featureRequestId: string,
  reviewsByFeatureRequestId: Map<string, FeatureRequestReviewRecord>
): FeatureRequestReviewOverlay {
  const reviewRecord = reviewsByFeatureRequestId.get(featureRequestId) ?? null;

  return reviewRecord
    ? {
        present: true,
        record: reviewRecord
      }
    : {
        present: false,
        record: null
      };
}

export function assembleFeatureRequests(
  input: AssembleFeatureRequestsInput
): AssembleFeatureRequestsResult {
  const reviewsByFeatureRequestId = new Map<string, FeatureRequestReviewRecord>();
  const diagnostics: FeatureRequestAssemblyDiagnostic[] = [];
  const featureRequestIds = new Set(input.featureRequests.map((featureRequest) => featureRequest.id));

  for (const reviewRecord of input.reviewRecords) {
    if (!featureRequestIds.has(reviewRecord.featureRequestId)) {
      diagnostics.push({
        code: "review_feature_request_missing",
        severity: "error",
        featureRequestId: reviewRecord.featureRequestId,
        reviewId: reviewRecord.id,
        message: `Persisted review record references missing feature request ${reviewRecord.featureRequestId}`
      });
      continue;
    }

    reviewsByFeatureRequestId.set(reviewRecord.featureRequestId, reviewRecord);
  }

  const enrichedFeatureRequests: EnrichedFeatureRequest[] = input.featureRequests.map((featureRequest) => ({
    ...featureRequest,
    readiness: evaluateReadiness(featureRequest),
    review: buildReviewOverlay(featureRequest.id, reviewsByFeatureRequestId)
  }));

  return {
    featureRequests: analyzeForIntervention(enrichedFeatureRequests),
    diagnostics
  };
}
