import { assembleFeatureRequests } from "./feature-request-assembler";
import { extractPerformanceEvidence } from "./people-engine";
import type {
  FeatureRequest,
  FeatureRequestAssemblyDiagnostic,
  FeatureRequestReviewRecord,
  FeatureRequestWithIntervention
} from "./index";
import type { PeopleRecord, PeopleRecordOverlay } from "./people-types";

export type PeopleAssemblyDiagnosticCode =
  | "pm_owner_missing"
  | "pm_one_on_one_history_missing";

export interface PeopleAssemblyDiagnostic {
  code: PeopleAssemblyDiagnosticCode;
  severity: "warn";
  message: string;
  featureRequestId?: string;
  pmName?: string;
}

export interface PmAttentionSummary {
  level: "high" | "medium" | "low";
  reasons: string[];
}

export interface PmOneOnOneStatus {
  overdue: boolean;
  daysSinceLastOneOnOne: number | null;
  status: "missing_history" | "up_to_date";
}

export interface PmEvidenceSummary {
  totalEvidence: number;
  positiveCount: number;
  developmentalCount: number;
}

export interface PmPortfolioSummary {
  pmName: string;
  featureRequestCount: number;
  attention: PmAttentionSummary;
  peopleRecord: PeopleRecordOverlay;
  oneOnOne: PmOneOnOneStatus;
  evidenceSummary: PmEvidenceSummary;
  portfolio: FeatureRequestWithIntervention[];
}

export interface AssemblePmPortfoliosInput {
  featureRequests: FeatureRequest[];
  reviewRecords: FeatureRequestReviewRecord[];
  peopleRecords?: PeopleRecord[];
}

export interface AssemblePmPortfoliosResult {
  pmPortfolios: PmPortfolioSummary[];
  diagnostics: Array<FeatureRequestAssemblyDiagnostic | PeopleAssemblyDiagnostic>;
}

function compareAttentionLevel(a: PmAttentionSummary["level"], b: PmAttentionSummary["level"]): number {
  const rank = { high: 3, medium: 2, low: 1 } as const;
  return rank[b] - rank[a];
}

function buildAttentionSummary(featureRequests: FeatureRequestWithIntervention[]): PmAttentionSummary {
  const reasons: string[] = [];
  const requiringIntervention = featureRequests.filter((featureRequest) => featureRequest.requiresIntervention);
  const blocked = featureRequests.filter((featureRequest) => featureRequest.blockerSummary.hasBlockers);
  const pendingReviewFollowUp = featureRequests.filter(
    (featureRequest) => featureRequest.review.record?.reviewStatus === "needs_follow_up"
  );

  if (requiringIntervention.length > 0) {
    reasons.push(`${requiringIntervention.length} feature request${requiringIntervention.length === 1 ? " requires" : "s require"} intervention`);
  }

  if (blocked.length > 0) {
    reasons.push(`${blocked.length} blocker-linked item${blocked.length === 1 ? "" : "s"}`);
  }

  if (pendingReviewFollowUp.length > 0) {
    reasons.push(`${pendingReviewFollowUp.length} review follow-up item${pendingReviewFollowUp.length === 1 ? "" : "s"}`);
  }

  reasons.push("1:1 history missing");

  const level: PmAttentionSummary["level"] =
    requiringIntervention.length > 0 || blocked.length > 0 || pendingReviewFollowUp.length > 0
      ? "high"
      : "medium";

  return {
    level,
    reasons
  };
}

function buildEvidenceSummary(featureRequests: FeatureRequest[], pmName: string): PmEvidenceSummary {
  const evidence = extractPerformanceEvidence(featureRequests, pmName);
  const positiveCount = evidence.filter((entry) => entry.evidenceType === "positive").length;
  const developmentalCount = evidence.filter((entry) => entry.evidenceType === "developmental").length;

  return {
    totalEvidence: evidence.length,
    positiveCount,
    developmentalCount
  };
}

function buildPeopleRecordOverlay(
  pmName: string,
  recordsByPmName: Map<string, PeopleRecord>
): PeopleRecordOverlay {
  const record = recordsByPmName.get(pmName) ?? null;

  return record
    ? {
        present: true,
        record
      }
    : {
        present: false,
        record: null
      };
}

function buildOneOnOneStatus(overlay: PeopleRecordOverlay): PmOneOnOneStatus {
  if (!overlay.present || !overlay.record?.lastOneOnOneDate) {
    return {
      overdue: true,
      daysSinceLastOneOnOne: null,
      status: "missing_history"
    };
  }

  const daysSinceLastOneOnOne = Math.floor(
    (new Date().getTime() - new Date(overlay.record.lastOneOnOneDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    overdue: daysSinceLastOneOnOne > 30,
    daysSinceLastOneOnOne,
    status: "up_to_date"
  };
}

export function assemblePmPortfolios(
  input: AssemblePmPortfoliosInput
): AssemblePmPortfoliosResult {
  const assembled = assembleFeatureRequests(input);
  const diagnostics: Array<FeatureRequestAssemblyDiagnostic | PeopleAssemblyDiagnostic> = [...assembled.diagnostics];
  const portfoliosByPm = new Map<string, FeatureRequestWithIntervention[]>();
  const recordsByPmName = new Map((input.peopleRecords ?? []).map((record) => [record.pmName.trim(), record]));

  for (const featureRequest of assembled.featureRequests) {
    const pmName = featureRequest.pmOwner?.trim();
    if (!pmName) {
      diagnostics.push({
        code: "pm_owner_missing",
        severity: "warn",
        featureRequestId: featureRequest.id,
        message: `Feature request ${featureRequest.id} cannot be assigned to a PM portfolio because pmOwner is missing.`
      });
      continue;
    }

    const existing = portfoliosByPm.get(pmName) ?? [];
    existing.push(featureRequest);
    portfoliosByPm.set(pmName, existing);
  }

  const pmPortfolios: PmPortfolioSummary[] = Array.from(portfoliosByPm.entries()).map(([pmName, portfolio]) => {
    const peopleRecord = buildPeopleRecordOverlay(pmName, recordsByPmName);
    const oneOnOne = buildOneOnOneStatus(peopleRecord);

    if (!peopleRecord.present) {
      diagnostics.push({
        code: "pm_one_on_one_history_missing",
        severity: "warn",
        pmName,
        message: `No persisted 1:1 history exists yet for ${pmName}.`
      });
    }

    return {
      pmName,
      featureRequestCount: portfolio.length,
      attention: buildAttentionSummary(portfolio),
      peopleRecord,
      oneOnOne,
      evidenceSummary: buildEvidenceSummary(assembled.featureRequests, pmName),
      portfolio
    };
  });

  pmPortfolios.sort((a, b) => {
    const attentionDelta = compareAttentionLevel(a.attention.level, b.attention.level);
    if (attentionDelta !== 0) {
      return attentionDelta;
    }

    return b.featureRequestCount - a.featureRequestCount;
  });

  return {
    pmPortfolios,
    diagnostics
  };
}
