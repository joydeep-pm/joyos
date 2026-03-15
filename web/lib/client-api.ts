import type {
  ActionModuleDefinition,
  AssistantCommsHistory,
  AssistantContext,
  AssistantAlert,
  AssistantQueueItem,
  AssistantQueueStatus,
  BacklogProcessResult,
  CommsApproval,
  CommsDraft,
  CommsSendResult,
  CopilotReply,
  DailyBrief,
  GoalsResponse,
  OutcomeClosureKpi,
  OutcomeCommitment,
  SystemStatus,
  TaskDocument,
  TaskStatus,
  TrendPoint,
  WeeklyReview,
  ApprovalEnvelopeRecord,
  ApprovalEnvelopeTransitionPayload,
  CollateralReminderItem
} from "@/lib/types";

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  source?: "mcp" | "fallback";
  error?: {
    code: string;
    message: string;
  };
}

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  return (await response.json()) as ApiResponse<T>;
}

export const api = {
  getSystemStatus: () => request<SystemStatus>("/api/system/status"),
  getGoals: () => request<GoalsResponse>("/api/goals"),
  getTasks: (params: URLSearchParams) => request<TaskDocument[]>(`/api/tasks?${params.toString()}`),
  createTask: (payload: Record<string, unknown>) => request<TaskDocument | unknown>("/api/tasks", { method: "POST", body: JSON.stringify(payload) }),
  updateTaskStatus: (filename: string, status: TaskStatus) =>
    request(`/api/tasks/${encodeURIComponent(filename)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  capture: (text: string) => request<{ appended: string; backlog_items: number }>("/api/capture", { method: "POST", body: JSON.stringify({ text }) }),
  processBacklog: () => request<BacklogProcessResult>("/api/backlog/process", { method: "POST", body: JSON.stringify({}) }),
  clearBacklog: () => request<{ cleared: boolean }>("/api/backlog/clear", { method: "POST", body: JSON.stringify({}) }),
  getSettings: () => request<Record<string, unknown>>("/api/settings"),
  getModules: () => request<ActionModuleDefinition[]>("/api/modules"),
  runModuleAction: (moduleId: string, actionId: string, args: Record<string, unknown>) =>
    request(`/api/modules/${encodeURIComponent(moduleId)}/actions/${encodeURIComponent(actionId)}/run`, {
      method: "POST",
      body: JSON.stringify({ args })
    }),
  getAssistantContext: () => request<AssistantContext>("/api/assistant/context"),
  rebuildAssistantContext: () => request<AssistantContext>("/api/assistant/context/rebuild", { method: "POST", body: JSON.stringify({}) }),
  getAssistantBrief: (date: string) => request<DailyBrief>(`/api/assistant/brief?date=${encodeURIComponent(date)}`),
  getAssistantReview: (week: string) => request<WeeklyReview>(`/api/assistant/review?week=${encodeURIComponent(week)}`),
  rebuildAssistantReview: (week: string) =>
    request<WeeklyReview>(`/api/assistant/review/rebuild?week=${encodeURIComponent(week)}`, { method: "POST", body: JSON.stringify({}) }),
  getAssistantAlerts: (date: string) => request<AssistantAlert[]>(`/api/assistant/alerts?date=${encodeURIComponent(date)}`),
  resolveAssistantAlert: (id: string, actionId?: string, actor?: string) =>
    request<{ alertId: string; resolvedAt: string; actionResult?: string }>(`/api/assistant/alerts/${encodeURIComponent(id)}/resolve`, {
      method: "POST",
      body: JSON.stringify({ actionId, actor })
    }),
  getAssistantTrends: (windowWeeks = 8, week?: string) =>
    request<TrendPoint[]>(
      `/api/assistant/trends?window_weeks=${encodeURIComponent(String(windowWeeks))}${week ? `&week=${encodeURIComponent(week)}` : ""}`
    ),
  getOutcomeClosureKpi: (week: string) =>
    request<OutcomeClosureKpi>(`/api/assistant/kpi/outcome-closure?week=${encodeURIComponent(week)}`),
  commitAssistantPlan: (payload: { date?: string; taskIds?: string[]; notes?: string }) =>
    request<{ commitment: OutcomeCommitment; items: AssistantQueueItem[] }>("/api/assistant/plan/commit", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getAssistantQueue: () => request<AssistantQueueItem[]>("/api/assistant/queue"),
  updateAssistantQueueStatus: (id: string, status: AssistantQueueStatus) =>
    request<AssistantQueueItem>(`/api/assistant/queue/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
  createCommsDraft: (payload: {
    type?: "stakeholder_update" | "blocked_followup";
    destination?: string;
    date?: string;
    actor?: string;
  }) =>
    request<CommsDraft>("/api/assistant/comms/draft", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  approveCommsDraft: (id: string, actor?: string) =>
    request<CommsApproval>(`/api/assistant/comms/${encodeURIComponent(id)}/approve`, {
      method: "POST",
      body: JSON.stringify({ actor })
    }),
  sendCommsDraft: (id: string, actor?: string) =>
    request<CommsSendResult>(`/api/assistant/comms/${encodeURIComponent(id)}/send`, {
      method: "POST",
      body: JSON.stringify({ actor })
    }),
  getCommsHistory: () => request<AssistantCommsHistory>("/api/assistant/comms/history"),
  getApprovalEnvelopes: () => request<ApprovalEnvelopeRecord[]>("/api/assistant/approval-envelopes"),
  getCollateralReminders: (date?: string) =>
    request<CollateralReminderItem[]>(
      `/api/assistant/collateral-reminders${date ? `?date=${encodeURIComponent(date)}` : ""}`
    ),
  resolveCollateralReminder: (id: string) =>
    request<CollateralReminderItem>(`/api/assistant/collateral-reminders/${encodeURIComponent(id)}/resolve`, {
      method: "POST",
      body: JSON.stringify({})
    }),
  createApprovalEnvelope: (payload: {
    actionType: "comms_send" | "jira_writeback" | "confluence_writeback";
    targetType: "comms_draft" | "jira_issue" | "confluence_page";
    targetId: string;
    summary: string;
    evidence: string[];
    proposedBy: string;
  }) =>
    request<ApprovalEnvelopeRecord>("/api/assistant/approval-envelopes", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getApprovalEnvelope: (id: string) =>
    request<ApprovalEnvelopeRecord>(`/api/assistant/approval-envelopes/${encodeURIComponent(id)}`),
  transitionApprovalEnvelope: (id: string, payload: ApprovalEnvelopeTransitionPayload) =>
    request<ApprovalEnvelopeRecord>(`/api/assistant/approval-envelopes/${encodeURIComponent(id)}`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  chatCopilot: (message: string) =>
    request<CopilotReply>("/api/copilot/chat", {
      method: "POST",
      body: JSON.stringify({ message })
    })
};
