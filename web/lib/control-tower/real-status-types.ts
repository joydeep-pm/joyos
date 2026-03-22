/**
 * Real Status — client-safe taxonomy, types, and colors.
 * No Node.js / fs imports. Safe to use in client components.
 */

export const PRE_GROOMING_STATUSES = [
  "deprioritized",
  "waiting_on_client",
  "engineering_blocked",
  "unclear_requirements",
  "waiting_on_pm",
  "waiting_on_onboarding",
  "grooming_in_progress",
] as const;

export const POST_GROOMING_STATUSES = [
  "in_dev",
  "dev_delayed",
  "in_qa",
  "qa_delayed",
] as const;

export type PreGroomingStatus = (typeof PRE_GROOMING_STATUSES)[number];
export type PostGroomingStatus = (typeof POST_GROOMING_STATUSES)[number];
export type RealStatusValue = PreGroomingStatus | PostGroomingStatus;

export const REAL_STATUS_LABELS: Record<RealStatusValue, string> = {
  deprioritized:         "Deprioritized",
  waiting_on_client:     "Waiting on Client",
  engineering_blocked:   "Engineering Blocked",
  unclear_requirements:  "Unclear Requirements",
  waiting_on_pm:         "Waiting on PM",
  waiting_on_onboarding: "Waiting on Onboarding",
  grooming_in_progress:  "Grooming in Progress",
  in_dev:                "In Dev",
  dev_delayed:           "Dev Delayed",
  in_qa:                 "In QA",
  qa_delayed:            "QA Delayed",
};

export const REAL_STATUS_COLORS: Record<RealStatusValue, { bg: string; text: string; border: string }> = {
  deprioritized:         { bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-300" },
  waiting_on_client:     { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-300" },
  engineering_blocked:   { bg: "bg-red-50",     text: "text-red-700",    border: "border-red-300" },
  unclear_requirements:  { bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-300" },
  waiting_on_pm:         { bg: "bg-purple-50",  text: "text-purple-700", border: "border-purple-300" },
  waiting_on_onboarding: { bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-300" },
  grooming_in_progress:  { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-300" },
  in_dev:                { bg: "bg-green-50",   text: "text-green-700",  border: "border-green-300" },
  dev_delayed:           { bg: "bg-red-50",     text: "text-red-700",    border: "border-red-300" },
  in_qa:                 { bg: "bg-cyan-50",    text: "text-cyan-700",   border: "border-cyan-300" },
  qa_delayed:            { bg: "bg-red-50",     text: "text-red-700",    border: "border-red-300" },
};

export interface RealStatusEntry {
  featureRequestId: string;
  jiraKeys: string[];
  status: RealStatusValue;
  note: string;
  setAt: string;
  setBy: string;
  reviewedToday: boolean;
  reviewedTodayAt?: string;
}

export interface RealStatusStore {
  version: 1;
  lastUpdated: string;
  entries: RealStatusEntry[];
}
