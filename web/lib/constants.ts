import type { TaskPriority } from "@/lib/types";

export const PRIORITY_RANK: Record<TaskPriority, number> = {
  P0: 100,
  P1: 75,
  P2: 50,
  P3: 25
};

export const BACKLOG_PLACEHOLDER = `# Backlog

Drop raw notes or todos here. Say \`process my backlog\` when you're ready for triage.
`;

export const TASK_CATEGORIES = [
  "technical",
  "outreach",
  "research",
  "writing",
  "content",
  "admin",
  "personal",
  "other"
] as const;
