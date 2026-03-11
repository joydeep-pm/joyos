import { getStageMetadata } from "./stage-config";
import type {
  FeatureRequest,
  FeatureRequestBlocker,
  FeatureRequestPrioritizationPosture,
  FeatureRequestReadinessBlockerClass,
  FeatureRequestReadinessDimension,
  FeatureRequestReadinessEvaluation,
  FeatureRequestReadinessMissingInputCode,
  FeatureRequestReadinessVerdict,
  FeatureRequestStage
} from "./types";

const GROOMING_READY_STAGES: FeatureRequestStage[] = ["estimation", "director_review", "prioritized"];
const TRIAGE_STAGES: FeatureRequestStage[] = ["incoming", "ba_grooming", "pm_exploration", "engineering_validation", "prd_drafting"];
const STALE_UPDATE_DAYS = 14;

function daysSince(dateString: string): number {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  const diffMs = Date.now() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function classifyBlocker(blockers: FeatureRequestBlocker[]): FeatureRequestReadinessBlockerClass {
  if (blockers.length === 0) {
    return "none";
  }

  if (blockers.some((blocker) => blocker.type === "client" || blocker.type === "engineering")) {
    return "external_dependency";
  }

  if (blockers.some((blocker) => blocker.type === "pm")) {
    return "product_dependency";
  }

  return "delivery_blocked";
}

function buildDimension(
  name: FeatureRequestReadinessDimension["name"],
  status: FeatureRequestReadinessDimension["status"],
  rationale: string
): FeatureRequestReadinessDimension {
  return { name, status, rationale };
}

function evaluateDocumentation(fr: FeatureRequest): {
  dimension: FeatureRequestReadinessDimension;
  missingInputs: FeatureRequestReadinessMissingInputCode[];
} {
  const hasDocumentation = fr.confluencePages.length > 0;

  if (hasDocumentation) {
    return {
      dimension: buildDimension("documentation", "pass", "Requirements documentation is linked."),
      missingInputs: []
    };
  }

  return {
    dimension: buildDimension("documentation", "fail", "No PRD or grooming-ready documentation is linked."),
    missingInputs: ["documentation_missing"]
  };
}

function evaluateScope(fr: FeatureRequest): {
  dimension: FeatureRequestReadinessDimension;
  missingInputs: FeatureRequestReadinessMissingInputCode[];
} {
  const hasScopeSignals = fr.confluencePages.length > 0 || fr.localNotes.length > 0;

  if (hasScopeSignals) {
    return {
      dimension: buildDimension("scope", "pass", "Scope signals exist in linked documentation or notes."),
      missingInputs: []
    };
  }

  return {
    dimension: buildDimension("scope", "fail", "Scope boundaries are not captured in linked docs or notes."),
    missingInputs: ["scope_signal_missing"]
  };
}

function evaluateStage(fr: FeatureRequest): FeatureRequestReadinessDimension {
  if (GROOMING_READY_STAGES.includes(fr.stage)) {
    const metadata = getStageMetadata(fr.stage);
    return buildDimension("stage", "pass", `${metadata.label} aligns with engineering grooming.`);
  }

  if (TRIAGE_STAGES.includes(fr.stage)) {
    const metadata = getStageMetadata(fr.stage);
    return buildDimension("stage", "warn", `${metadata.label} is still upstream of grooming commitment.`);
  }

  const metadata = getStageMetadata(fr.stage);
  return buildDimension("stage", "warn", `${metadata.label} is outside the normal grooming intake flow.`);
}

function evaluateUnblockStatus(fr: FeatureRequest): {
  dimension: FeatureRequestReadinessDimension;
  blockerClass: FeatureRequestReadinessBlockerClass;
} {
  const blockerClass = classifyBlocker(fr.blockerSummary.blockers);

  if (!fr.blockerSummary.hasBlockers) {
    return {
      dimension: buildDimension("unblock_status", "pass", "No active blockers are attached to this request."),
      blockerClass
    };
  }

  return {
    dimension: buildDimension(
      "unblock_status",
      "fail",
      `Active blockers prevent grooming commitment (${fr.blockerSummary.blockers.length} blocker${fr.blockerSummary.blockers.length === 1 ? "" : "s"}).`
    ),
    blockerClass
  };
}

function evaluatePrioritization(fr: FeatureRequest): {
  dimension: FeatureRequestReadinessDimension;
  posture: FeatureRequestPrioritizationPosture;
} {
  if (fr.blockerSummary.hasBlockers) {
    return {
      dimension: buildDimension("prioritization", "warn", "Blockers should be resolved before committing engineering capacity."),
      posture: "expedite_blocker_resolution"
    };
  }

  if (fr.stage === "prioritized") {
    return {
      dimension: buildDimension("prioritization", "pass", "The request is already prioritized for near-term planning."),
      posture: "scheduled"
    };
  }

  if (GROOMING_READY_STAGES.includes(fr.stage)) {
    return {
      dimension: buildDimension("prioritization", "pass", "The request is in an active grooming stage."),
      posture: "scheduled"
    };
  }

  return {
    dimension: buildDimension("prioritization", "warn", "The request still needs prioritization or triage before grooming."),
    posture: "needs_triage"
  };
}

function evaluateFreshness(fr: FeatureRequest): {
  dimension: FeatureRequestReadinessDimension;
  missingInputs: FeatureRequestReadinessMissingInputCode[];
} {
  const staleBy = Math.max(daysSince(fr.latestUpdate.date), daysSince(fr.updatedAt));
  const isLateStage = GROOMING_READY_STAGES.includes(fr.stage);

  if (staleBy > STALE_UPDATE_DAYS) {
    return {
      dimension: buildDimension("freshness", isLateStage ? "warn" : "pass", `Latest signal is ${staleBy} days old and should be refreshed before grooming.`),
      missingInputs: isLateStage ? ["stale_update"] : []
    };
  }

  return {
    dimension: buildDimension("freshness", "pass", "Recent source updates are available for grooming review."),
    missingInputs: []
  };
}

function deriveVerdict(dimensions: FeatureRequestReadinessDimension[]): FeatureRequestReadinessVerdict {
  const dimensionMap = new Map(dimensions.map((dimension) => [dimension.name, dimension]));

  if (dimensionMap.get("unblock_status")?.status === "fail") {
    return "blocked";
  }

  const hasFailingCoreDimension = (["documentation", "scope"] as const).some(
    (dimensionName) => dimensionMap.get(dimensionName)?.status === "fail"
  );
  const stageStatus = dimensionMap.get("stage")?.status;
  const prioritizationStatus = dimensionMap.get("prioritization")?.status;

  if (hasFailingCoreDimension || stageStatus === "warn" || prioritizationStatus === "warn") {
    return "low_readiness";
  }

  return "ready";
}

function deriveRecommendedNextStep(
  verdict: FeatureRequestReadinessVerdict,
  missingInputs: FeatureRequestReadinessMissingInputCode[]
): string {
  if (verdict === "blocked") {
    return "Resolve blockers before grooming commitment";
  }

  if (missingInputs.includes("documentation_missing") || missingInputs.includes("scope_signal_missing")) {
    return "Clarify scope and documentation before grooming";
  }

  if (missingInputs.includes("stale_update")) {
    return "Refresh the latest status before grooming";
  }

  return "Schedule for engineering grooming";
}

export function evaluateReadiness(fr: FeatureRequest): FeatureRequestReadinessEvaluation {
  const documentation = evaluateDocumentation(fr);
  const scope = evaluateScope(fr);
  const stage = evaluateStage(fr);
  const unblockStatus = evaluateUnblockStatus(fr);
  const prioritization = evaluatePrioritization(fr);
  const freshness = evaluateFreshness(fr);

  const dimensions = [
    documentation.dimension,
    scope.dimension,
    stage,
    unblockStatus.dimension,
    prioritization.dimension,
    freshness.dimension
  ];

  const missingInputs = Array.from(
    new Set([
      ...documentation.missingInputs,
      ...scope.missingInputs,
      ...freshness.missingInputs
    ])
  );

  const verdict = deriveVerdict(dimensions);

  return {
    verdict,
    dimensions,
    missingInputs,
    blockerClass: unblockStatus.blockerClass,
    prioritizationPosture: prioritization.posture,
    recommendedNextStep: deriveRecommendedNextStep(verdict, missingInputs)
  };
}
