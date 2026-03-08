export type AssistantFeatureFlag =
  | "assistant_context_v1"
  | "assistant_loop_v1"
  | "assistant_comms_v1"
  | "assistant_review_v1"
  | "assistant_alerts_v1";

const envMap: Record<AssistantFeatureFlag, string> = {
  assistant_context_v1: "ASSISTANT_CONTEXT_V1",
  assistant_loop_v1: "ASSISTANT_LOOP_V1",
  assistant_comms_v1: "ASSISTANT_COMMS_V1",
  assistant_review_v1: "ASSISTANT_REVIEW_V1",
  assistant_alerts_v1: "ASSISTANT_ALERTS_V1"
};

export function isAssistantFeatureEnabled(flag: AssistantFeatureFlag): boolean {
  const envKey = envMap[flag];
  const raw = process.env[envKey];

  if (!raw) return true;

  return raw.toLowerCase() !== "false" && raw !== "0";
}

export function getAssistantFeatureFlags(): Record<AssistantFeatureFlag, boolean> {
  return {
    assistant_context_v1: isAssistantFeatureEnabled("assistant_context_v1"),
    assistant_loop_v1: isAssistantFeatureEnabled("assistant_loop_v1"),
    assistant_comms_v1: isAssistantFeatureEnabled("assistant_comms_v1"),
    assistant_review_v1: isAssistantFeatureEnabled("assistant_review_v1"),
    assistant_alerts_v1: isAssistantFeatureEnabled("assistant_alerts_v1")
  };
}
