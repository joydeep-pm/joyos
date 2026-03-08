import { fail } from "@/app/api/_utils";
import { isAssistantFeatureEnabled, type AssistantFeatureFlag } from "@/lib/assistant/flags";
import { resolveWeekId } from "@/lib/assistant/week-utils";

export function requireAssistantFlag(flag: AssistantFeatureFlag) {
  if (!isAssistantFeatureEnabled(flag)) {
    return fail(404, {
      code: "FEATURE_DISABLED",
      message: `${flag} is disabled.`
    });
  }

  return null;
}

export function readDateParam(value: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 10);

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

export function readWeekParam(value: string | null): string {
  return resolveWeekId(value ?? undefined);
}
