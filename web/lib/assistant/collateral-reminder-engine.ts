import { getAssistantCachePath, readJsonFile, writeJsonFile } from "@/lib/assistant/storage";
import type {
  CollateralReminderInventoryEntry,
  CollateralReminderItem,
  CollateralReminderState,
  CollateralReminderStatus,
  DriftSeverity
} from "@/lib/types";

const COLLATERAL_REMINDER_FILE = "assistant-collateral-reminders.json";
const STATE_VERSION = 1;
const UPCOMING_THRESHOLD_DAYS = 30;

const DEFAULT_INVENTORY: CollateralReminderInventoryEntry[] = [
  {
    assetType: "product_deck",
    vertical: "Gold Loan",
    cadenceMonths: 3,
    lastRefreshedAt: "2025-10-15",
    owner: "Joydeep Sarkar"
  },
  {
    assetType: "product_factsheet",
    vertical: "Gold Loan",
    cadenceMonths: 3,
    lastRefreshedAt: "2025-12-15",
    owner: "Joydeep Sarkar"
  },
  {
    assetType: "product_deck",
    vertical: "Personal Loan",
    cadenceMonths: 3,
    lastRefreshedAt: "2026-02-01",
    owner: "Joydeep Sarkar"
  },
  {
    assetType: "product_factsheet",
    vertical: "Collections",
    cadenceMonths: 3,
    lastRefreshedAt: "2026-03-01",
    owner: "Joydeep Sarkar"
  }
];

function defaultState(): CollateralReminderState {
  return {
    version: STATE_VERSION,
    inventory: DEFAULT_INVENTORY,
    resolved: {}
  };
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number): Date {
  const clone = new Date(date.getTime());
  clone.setUTCMonth(clone.getUTCMonth() + months);
  return clone;
}

function diffDays(fromIso: string, toIso: string): number {
  const diffMs = parseDate(toIso).getTime() - parseDate(fromIso).getTime();
  return Math.round(diffMs / 86400000);
}

function quarterLabelFromDate(dateIso: string): string {
  const date = parseDate(dateIso);
  const month = date.getUTCMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `${date.getUTCFullYear()} Q${quarter}`;
}

function buildReminderId(entry: CollateralReminderInventoryEntry, dueDate: string): string {
  return `${entry.assetType}:${entry.vertical.toLowerCase().replace(/[^a-z0-9]+/g, "-")}:${dueDate}`;
}

function deriveStatus(daysUntilDue: number): CollateralReminderStatus {
  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue === 0) return "due";
  return "upcoming";
}

function deriveSeverity(status: CollateralReminderStatus, daysUntilDue: number): DriftSeverity {
  if (status === "overdue") return "high";
  if (status === "due") return "medium";
  if (daysUntilDue <= 14) return "medium";
  return "low";
}

async function readState(): Promise<CollateralReminderState> {
  return readJsonFile(getAssistantCachePath(COLLATERAL_REMINDER_FILE), defaultState());
}

async function writeState(state: CollateralReminderState): Promise<void> {
  await writeJsonFile(getAssistantCachePath(COLLATERAL_REMINDER_FILE), state);
}

export async function listCollateralReminders(options: {
  date?: string;
  includeResolved?: boolean;
} = {}): Promise<CollateralReminderItem[]> {
  const state = await readState();
  if (!Array.isArray(state.inventory) || state.inventory.length === 0) {
    state.inventory = DEFAULT_INVENTORY;
  }
  if (!state.resolved) {
    state.resolved = {};
  }
  await writeState(state);

  const date = options.date ?? todayIso();
  const reminders: CollateralReminderItem[] = [];

  for (const entry of state.inventory) {
    const dueDate = formatIso(addMonths(parseDate(entry.lastRefreshedAt), entry.cadenceMonths));
    const daysUntilDue = diffDays(date, dueDate);
    if (daysUntilDue > UPCOMING_THRESHOLD_DAYS) {
      continue;
    }

    const id = buildReminderId(entry, dueDate);
    const resolution = state.resolved[id];
    const status: CollateralReminderStatus = resolution ? "resolved" : deriveStatus(daysUntilDue);

    reminders.push({
      id,
      assetType: entry.assetType,
      vertical: entry.vertical,
      cadenceMonths: entry.cadenceMonths,
      quarterLabel: quarterLabelFromDate(dueDate),
      dueDate,
      status,
      severity: resolution ? "low" : deriveSeverity(status, daysUntilDue),
      lastRefreshedAt: entry.lastRefreshedAt,
      daysUntilDue,
      owner: entry.owner,
      resolvedAt: resolution?.resolvedAt
    });
  }

  const visible = options.includeResolved ? reminders : reminders.filter((item) => item.status !== "resolved");

  return visible.sort((left, right) => {
    const severityRank = { high: 0, medium: 1, low: 2 } as const;
    const severityDelta = severityRank[left.severity] - severityRank[right.severity];
    if (severityDelta !== 0) return severityDelta;
    return left.dueDate.localeCompare(right.dueDate);
  });
}

export async function getCollateralReminderState(): Promise<CollateralReminderState> {
  const state = await readState();
  if (!Array.isArray(state.inventory) || state.inventory.length === 0) {
    state.inventory = DEFAULT_INVENTORY;
    await writeState(state);
  }
  return state;
}

export async function resolveCollateralReminder(reminderId: string, resolvedAt = new Date().toISOString()): Promise<CollateralReminderItem | null> {
  const state = await readState();
  if (!Array.isArray(state.inventory) || state.inventory.length === 0) {
    state.inventory = DEFAULT_INVENTORY;
  }
  if (!state.resolved) {
    state.resolved = {};
  }

  const reminders = await listCollateralReminders({ includeResolved: true });
  const reminder = reminders.find((item) => item.id === reminderId);
  if (!reminder) {
    return null;
  }

  state.resolved[reminderId] = { resolvedAt };
  await writeState(state);

  return {
    ...reminder,
    status: "resolved",
    severity: "low",
    resolvedAt
  };
}
