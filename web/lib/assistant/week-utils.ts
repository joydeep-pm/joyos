import type { WeeklyWindow } from "@/lib/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ISO_WEEK_FORMAT = /^\d{4}-W\d{2}$/;

function toDateOnlyIso(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function parseDate(input?: string): Date {
  if (!input) {
    return new Date();
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

function getIsoWeekParts(date: Date): { year: number; week: number } {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7);
  return { year: utc.getUTCFullYear(), week };
}

export function resolveWeekId(input?: string): string {
  if (input && ISO_WEEK_FORMAT.test(input)) {
    return input;
  }

  const current = getIsoWeekParts(new Date());
  return `${current.year}-W${String(current.week).padStart(2, "0")}`;
}

export function weekWindowFromWeekId(weekIdInput?: string): WeeklyWindow {
  const weekId = resolveWeekId(weekIdInput);
  const [yearRaw, weekRaw] = weekId.split("-W");
  const year = Number(yearRaw);
  const week = Number(weekRaw);

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

  const start = new Date(mondayWeek1);
  start.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  return {
    weekId: `${year}-W${String(week).padStart(2, "0")}`,
    startDate: toDateOnlyIso(start),
    endDate: toDateOnlyIso(end),
    timezone: "local",
    weekStart: "monday"
  };
}

export function weekWindowFromDate(dateInput?: string): WeeklyWindow {
  const date = parseDate(dateInput);
  const parts = getIsoWeekParts(date);
  return weekWindowFromWeekId(`${parts.year}-W${String(parts.week).padStart(2, "0")}`);
}

export function isDateWithinWeek(dateIso: string, window: WeeklyWindow): boolean {
  return dateIso >= window.startDate && dateIso <= window.endDate;
}

export function previousWeekId(weekIdInput?: string): string {
  const current = weekWindowFromWeekId(weekIdInput);
  const currentStart = new Date(`${current.startDate}T00:00:00.000Z`);
  currentStart.setUTCDate(currentStart.getUTCDate() - 7);
  const parts = getIsoWeekParts(currentStart);
  return `${parts.year}-W${String(parts.week).padStart(2, "0")}`;
}

export function listWeekIds(endingWeekId: string, count: number): string[] {
  const output: string[] = [];
  let cursor = resolveWeekId(endingWeekId);

  for (let i = 0; i < count; i += 1) {
    output.push(cursor);
    cursor = previousWeekId(cursor);
  }

  return output.reverse();
}
