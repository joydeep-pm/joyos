export type TaskPriority = "P0" | "P1" | "P2" | "P3";
export type TaskStatus = "n" | "s" | "b" | "d";

export interface TaskFrontmatter {
  title: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  created_date?: string;
  due_date?: string;
  estimated_time?: number;
  resource_refs?: string[];
}

export interface TaskDocument {
  filename: string;
  frontmatter: TaskFrontmatter;
  body: string;
}

export interface TaskFilters {
  category?: string[];
  priority?: TaskPriority[];
  status?: TaskStatus[];
  includeDone?: boolean;
}

export interface SimilarTask {
  title: string;
  filename: string;
  category: string;
  status: TaskStatus;
  similarity_score: number;
}

export interface PotentialDuplicate {
  item: string;
  similar_tasks: SimilarTask[];
  recommended_action: "merge" | "review";
}

export interface ClarificationItem {
  item: string;
  questions: string[];
  suggestions: string[];
}

export interface SuggestedTask {
  item: string;
  suggested_category: string;
  suggested_priority: TaskPriority;
  ready_to_create: boolean;
}

export interface BacklogProcessSummary {
  total_items: number;
  new_tasks: number;
  duplicates_found: number;
  needs_clarification: number;
  auto_created: number;
  recommendations: string[];
}

export interface BacklogProcessResult {
  new_tasks: SuggestedTask[];
  potential_duplicates: PotentialDuplicate[];
  needs_clarification: ClarificationItem[];
  auto_created: string[];
  summary: BacklogProcessSummary;
}

export interface SystemStatus {
  total_active_tasks: number;
  priority_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  backlog_items: number;
  time_insights: string[];
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface InvokeResult<T> {
  ok: boolean;
  source: "mcp" | "fallback";
  data?: T;
  error?: ApiError;
}

export interface GoalsResponse {
  raw: string;
  highlights: {
    role?: string;
    vision?: string;
    yearlySuccess?: string;
    quarterObjective?: string;
    topPriorities?: string;
  };
}

export interface ModuleActionParam {
  name: string;
  type: "string" | "number" | "boolean" | "array";
  required?: boolean;
  description: string;
  enum?: string[];
  default?: string | number | boolean | string[];
}

export interface ModuleActionDefinition {
  id: string;
  name: string;
  description: string;
  toolName?: string;
  params?: ModuleActionParam[];
}

export interface ActionModuleDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  actions: ModuleActionDefinition[];
}

export interface ModuleEndpointDefinition {
  method: "POST";
  route: string;
  moduleId: string;
  moduleName: string;
  actionId: string;
  actionName: string;
  toolName?: string;
}

export interface ModuleRegistry {
  version: number;
  generated_at: string;
  source_files: string[];
  modules: ActionModuleDefinition[];
  endpoints: ModuleEndpointDefinition[];
  warnings: string[];
}

export interface CopilotExecutedAction {
  id: string;
  summary: string;
}

export interface CopilotReply {
  reply: string;
  source: "mcp" | "fallback";
  suggestions: string[];
  executed?: CopilotExecutedAction;
}

export type AssistantQueueStatus = "queued" | "in_progress" | "awaiting_input" | "done" | "dropped";
export type DriftAlertType = "overdue_high_priority" | "blocked_stale" | "missing_next_action";
export type DriftSeverity = "high" | "medium" | "low";
export type LinkMode = "direct" | "inferred";
export type CommsDraftStatus = "draft" | "approved" | "sent";
export type CommsAuditEvent = "draft_created" | "approved" | "send_denied" | "sent";
export type WeekStartDay = "monday";
export type AssistantAlertType = "priority_drift" | "wip_limit";
export type CorrectiveActionType =
  | "move_to_in_progress"
  | "mark_awaiting_input"
  | "draft_blocker_followup"
  | "seed_next_day";

export interface GoalSignal {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  source: "GOALS.md";
}

export interface TaskSignal {
  taskId: string;
  filename: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  alignmentScore: number;
  urgencyScore: number;
  goalIds: string[];
  knowledgeRefs: string[];
  hasNextAction: boolean;
  driftFlags: DriftAlertType[];
}

export interface KnowledgeSignal {
  id: string;
  path: string;
  title: string;
  summary: string;
  keywords: string[];
  linkedTaskIds: string[];
}

export interface TaskGoalLink {
  taskId: string;
  goalId: string;
  mode: LinkMode;
  score: number;
}

export interface DriftAlert {
  id: string;
  taskId: string;
  type: DriftAlertType;
  severity: DriftSeverity;
  message: string;
}

export interface AssistantContextStats {
  activeTasks: number;
  linkedHighPriorityTasks: number;
  unlinkedHighPriorityTasks: number;
  staleBlockedTasks: number;
}

export interface AssistantContext {
  generatedAt: string;
  indexVersion: number;
  goals: GoalSignal[];
  tasks: TaskSignal[];
  knowledge: KnowledgeSignal[];
  links: TaskGoalLink[];
  driftAlerts: DriftAlert[];
  stats: AssistantContextStats;
}

export interface AssistantContextIndexFile {
  version: number;
  generatedAt: string;
  files: {
    path: string;
    mtimeMs: number;
    size: number;
  }[];
}

export interface BriefOutcome {
  id: string;
  taskId: string;
  title: string;
  priority: TaskPriority;
  goalReference: string;
  whyNow: string;
  score: number;
}

export interface DailyBrief {
  date: string;
  generatedAt: string;
  topOutcomes: BriefOutcome[];
  predictedRisks: DriftAlert[];
  middayCheckpoint: string;
  eveningClosurePrompt: string;
}

export interface AssistantQueueItem {
  id: string;
  taskId: string;
  filename: string;
  title: string;
  priority: TaskPriority;
  status: AssistantQueueStatus;
  goalReference: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutcomeCommitment {
  id: string;
  date: string;
  topTaskIds: string[];
  committedAt: string;
  notes?: string;
}

export interface AssistantQueueState {
  version: number;
  items: AssistantQueueItem[];
  commitments: OutcomeCommitment[];
}

export interface CommsDraft {
  id: string;
  type: "stakeholder_update" | "blocked_followup";
  status: CommsDraftStatus;
  destination: string;
  subject: string;
  body: string;
  requiresApproval: boolean;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalToken?: string;
  sentAt?: string;
  sentBy?: string;
  payloadHash?: string;
  sourceDate: string;
}

export interface CommsApproval {
  draftId: string;
  approved: boolean;
  approvedAt: string;
  approvedBy: string;
  approvalToken: string;
}

export interface CommsSendResult {
  draftId: string;
  status: "sent" | "blocked";
  message: string;
  destination: string;
  sentAt?: string;
}

export interface CommsAuditEntry {
  id: string;
  draftId: string;
  event: CommsAuditEvent;
  actor: string;
  timestamp: string;
  details: string;
}

export interface CommsState {
  version: number;
  drafts: CommsDraft[];
  audit: CommsAuditEntry[];
}

export interface AssistantCommsHistory {
  drafts: CommsDraft[];
  audit: CommsAuditEntry[];
}

export interface WeeklyWindow {
  weekId: string;
  startDate: string;
  endDate: string;
  timezone: string;
  weekStart: WeekStartDay;
}

export interface WeeklyOutcomeItem {
  taskId: string;
  title: string;
  priority: TaskPriority;
  committed: boolean;
  completed: boolean;
  rolledOver: boolean;
  goalReference: string;
}

export interface WeeklyOutcomeScorecard {
  committedCount: number;
  completedCount: number;
  rolloverCount: number;
  closureRate: number;
}

export interface CorrectiveAction {
  id: string;
  type: CorrectiveActionType;
  label: string;
  taskId?: string;
  payload: Record<string, string>;
}

export interface PriorityDriftAlert {
  id: string;
  type: "priority_drift";
  taskId: string;
  taskTitle: string;
  fromPriority: TaskPriority;
  toPriority: TaskPriority;
  changedAt: string;
  reason: string;
  severity: DriftSeverity;
  resolved: boolean;
  correctiveActions: CorrectiveAction[];
}

export interface WipAlert {
  id: string;
  type: "wip_limit";
  activeHighPriorityCount: number;
  limit: number;
  severity: DriftSeverity;
  message: string;
  changedAt: string;
  resolved: boolean;
  correctiveActions: CorrectiveAction[];
}

export type AssistantAlert = PriorityDriftAlert | WipAlert;

export interface WeeklyReview {
  generatedAt: string;
  window: WeeklyWindow;
  outcomes: WeeklyOutcomeItem[];
  scorecard: WeeklyOutcomeScorecard;
  alerts: AssistantAlert[];
}

export interface TrendPoint {
  date: string;
  committed: number;
  completed: number;
  closureRate: number;
}

export interface OutcomeClosureKpi {
  weekId: string;
  closureRate: number;
  target: number;
  metTarget: boolean;
}

export interface AssistantAlertState {
  version: number;
  snapshots: Record<
    string,
    {
      priority: TaskPriority;
      taskTitle: string;
      lastSeenAt: string;
    }
  >;
  resolved: Record<
    string,
    {
      resolvedAt: string;
      actionId?: string;
    }
  >;
}

export interface AssistantWeeklyReviewState {
  version: number;
  reviews: Record<string, WeeklyReview>;
  updatedAt: string;
}

export interface AssistantTrendSnapshotState {
  version: number;
  snapshots: Record<
    string,
    {
      weekId: string;
      date: string;
      committed: number;
      completed: number;
      closureRate: number;
      recordedAt: string;
    }
  >;
}
