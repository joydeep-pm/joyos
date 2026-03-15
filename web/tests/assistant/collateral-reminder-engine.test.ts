import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCollateralReminderState, listCollateralReminders, resolveCollateralReminder } from "@/lib/assistant/collateral-reminder-engine";

const { GET: getCollateralRemindersRoute } = await import("@/app/api/assistant/collateral-reminders/route");
const { POST: resolveCollateralReminderRoute } = await import("@/app/api/assistant/collateral-reminders/[id]/resolve/route");

let tempRoot = "";

beforeEach(async () => {
  tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "personal-os-collateral-reminders-"));
  process.env.PERSONAL_OS_ROOT = tempRoot;
  process.env.ASSISTANT_CACHE_DIR = path.join(tempRoot, ".cache");
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-15T10:00:00.000Z"));
});

afterEach(async () => {
  vi.useRealTimers();
  if (tempRoot) {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
  delete process.env.PERSONAL_OS_ROOT;
  delete process.env.ASSISTANT_CACHE_DIR;
});

describe("collateral reminder engine", () => {
  it("derives deterministic due and overdue reminders from the seeded quarterly inventory", async () => {
    const reminders = await listCollateralReminders({ date: "2026-03-15" });

    expect(reminders).toHaveLength(2);
    expect(reminders).toEqual([
      expect.objectContaining({
        assetType: "product_deck",
        vertical: "Gold Loan",
        dueDate: "2026-01-15",
        quarterLabel: "2026 Q1",
        status: "overdue",
        severity: "high"
      }),
      expect.objectContaining({
        assetType: "product_factsheet",
        vertical: "Gold Loan",
        dueDate: "2026-03-15",
        quarterLabel: "2026 Q1",
        status: "due",
        severity: "medium"
      })
    ]);
  });

  it("persists inspectable reminder inventory and resolution state in assistant cache", async () => {
    await listCollateralReminders({ date: "2026-03-15" });

    const state = await getCollateralReminderState();
    expect(state.inventory.length).toBeGreaterThan(0);
    expect(state.inventory[0]).toMatchObject({
      assetType: expect.any(String),
      vertical: expect.any(String),
      cadenceMonths: 3,
      lastRefreshedAt: expect.any(String)
    });
    expect(state.resolved).toEqual({});

    const persisted = JSON.parse(
      await fs.readFile(path.join(tempRoot, ".cache", "assistant-collateral-reminders.json"), "utf8")
    ) as { inventory: unknown[]; resolved: Record<string, unknown> };

    expect(persisted.inventory.length).toBe(state.inventory.length);
    expect(persisted.resolved).toEqual({});
  });

  it("returns a stable API payload for assistant collateral reminders", async () => {
    const response = await getCollateralRemindersRoute(
      new Request("http://localhost/api/assistant/collateral-reminders?date=2026-03-15")
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringContaining("product_deck"),
          assetType: "product_deck",
          vertical: "Gold Loan",
          dueDate: "2026-01-15",
          status: "overdue"
        })
      ])
    });
  });

  it("resolves a reminder and hides it from default reminder reads while preserving inspectable state", async () => {
    const reminders = await listCollateralReminders({ date: "2026-03-15" });
    const target = reminders[0];

    expect(target).toBeDefined();

    const resolved = await resolveCollateralReminder(target.id, "2026-03-15T11:00:00.000Z");
    expect(resolved).toMatchObject({
      id: target.id,
      status: "resolved",
      resolvedAt: "2026-03-15T11:00:00.000Z"
    });

    const visible = await listCollateralReminders({ date: "2026-03-15" });
    expect(visible.find((item) => item.id === target.id)).toBeUndefined();

    const inspectable = await listCollateralReminders({ date: "2026-03-15", includeResolved: true });
    expect(inspectable.find((item) => item.id === target.id)).toMatchObject({
      status: "resolved",
      resolvedAt: "2026-03-15T11:00:00.000Z"
    });

    const state = await getCollateralReminderState();
    expect(state.resolved[target.id]).toMatchObject({
      resolvedAt: "2026-03-15T11:00:00.000Z"
    });
  });

  it("resolves reminders through the route contract", async () => {
    const reminders = await listCollateralReminders({ date: "2026-03-15" });
    const target = reminders[0];

    const response = await resolveCollateralReminderRoute(new Request(`http://localhost/api/assistant/collateral-reminders/${target.id}/resolve`, {
      method: "POST"
    }), { params: Promise.resolve({ id: target.id }) });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        id: target.id,
        status: "resolved"
      }
    });
  });
});
