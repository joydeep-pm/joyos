import { NextResponse } from "next/server";

import { getCachedFeatureRequests } from "@/lib/control-tower/cache";
import { assemblePmPortfolios } from "@/lib/control-tower/people-assembler";
import { readPeopleStore, upsertPeopleRecord } from "@/lib/control-tower/people-store";
import { readReviewStore } from "@/lib/control-tower/reviews";
import type { PeopleRecord } from "@/lib/control-tower/people-types";

interface PeopleMutationRequestBody {
  pmName?: string;
  lastOneOnOneDate?: string;
  nextOneOnOneDate?: string;
  coachingFocus?: string[];
  privateNotes?: string;
  lastUpdatedBy?: string;
}

interface PeopleMutationSuccessResponse {
  ok: true;
  data: {
    record: PeopleRecord;
    created: boolean;
  };
}

interface PeopleMutationErrorResponse {
  ok: false;
  error: {
    code:
      | "control_tower_people_invalid_request"
      | "control_tower_people_pm_not_found"
      | "control_tower_people_persistence_failed";
    message: string;
    details?: Record<string, unknown>;
  };
}

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: string[] | undefined): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function buildErrorResponse(
  status: number,
  error: PeopleMutationErrorResponse["error"]
): NextResponse<PeopleMutationErrorResponse> {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(
  request: Request
): Promise<NextResponse<PeopleMutationSuccessResponse | PeopleMutationErrorResponse>> {
  let body: PeopleMutationRequestBody;

  try {
    body = (await request.json()) as PeopleMutationRequestBody;
  } catch {
    return buildErrorResponse(400, {
      code: "control_tower_people_invalid_request",
      message: "Missing required people note fields.",
      details: {
        missingFields: ["pmName", "coachingFocus", "privateNotes", "lastUpdatedBy"]
      }
    });
  }

  const missingFields: string[] = [];
  if (!isNonEmptyString(body.pmName)) missingFields.push("pmName");
  if (!isStringArray(body.coachingFocus)) missingFields.push("coachingFocus");
  if (!isNonEmptyString(body.privateNotes)) missingFields.push("privateNotes");
  if (!isNonEmptyString(body.lastUpdatedBy)) missingFields.push("lastUpdatedBy");

  if (missingFields.length > 0) {
    return buildErrorResponse(400, {
      code: "control_tower_people_invalid_request",
      message: "Missing required people note fields.",
      details: { missingFields }
    });
  }

  const pmName = body.pmName!.trim();

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

    const existingRecord = assembled.pmPortfolios.find((portfolio) => portfolio.pmName === pmName)?.peopleRecord.record;

    if (!assembled.pmPortfolios.some((portfolio) => portfolio.pmName === pmName)) {
      return buildErrorResponse(404, {
        code: "control_tower_people_pm_not_found",
        message: `PM not found in assembled people workspace: ${pmName}`,
        details: {
          pmName,
          diagnostics: assembled.diagnostics
        }
      });
    }

    const record = await upsertPeopleRecord({
      pmName,
      lastOneOnOneDate: body.lastOneOnOneDate,
      nextOneOnOneDate: body.nextOneOnOneDate,
      coachingFocus: body.coachingFocus!.map((entry) => entry.trim()),
      privateNotes: body.privateNotes!.trim(),
      lastUpdatedBy: body.lastUpdatedBy!.trim()
    });

    return NextResponse.json({
      ok: true,
      data: {
        record,
        created: existingRecord === null || existingRecord === undefined
      }
    });
  } catch (error) {
    return buildErrorResponse(500, {
      code: "control_tower_people_persistence_failed",
      message: "Failed to persist PM people record.",
      details: {
        pmName,
        cause: error instanceof Error ? error.message : "Unknown error"
      }
    });
  }
}
