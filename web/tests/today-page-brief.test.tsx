import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import TodayPage from "@/app/today/page";

vi.mock("@/lib/client-api", () => ({
  api: {
    getTasks: vi.fn(),
    getSystemStatus: vi.fn(),
    getGoals: vi.fn(),
    getAssistantBrief: vi.fn(),
    capture: vi.fn()
  }
}));

const { api } = await import("@/lib/client-api");

describe("TodayPage daily brief alignment", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.getTasks).mockResolvedValue({
      ok: true,
      data: []
    } as never);

    vi.mocked(api.getSystemStatus).mockResolvedValue({
      ok: true,
      data: {
        total_active_tasks: 10
      }
    } as never);

    vi.mocked(api.getGoals).mockResolvedValue({
      ok: true,
      data: {
        highlights: {
          quarterObjective: "Protect the quarter plan",
          vision: "Build an AI-native product operating system",
          topPriorities: "Flipkart Project"
        }
      }
    } as never);

    vi.mocked(api.getAssistantBrief).mockResolvedValue({
      ok: true,
      data: {
        date: "2026-03-23",
        generatedAt: "2026-03-23T08:00:00.000Z",
        topOutcomes: [
          {
            id: "outcome-1",
            taskId: "task-1",
            title: "Prepare leadership update",
            priority: "P0",
            score: 98,
            whyNow: "Leadership review is approaching.",
            goalReference: "Documentation"
          },
          {
            id: "outcome-2",
            taskId: "task-2",
            title: "Review Flipkart delivery plan",
            priority: "P0",
            score: 92,
            whyNow: "Commercially critical roadmap protection.",
            goalReference: "Flipkart Project"
          }
        ],
        predictedRisks: [],
        middayCheckpoint: "Check progress at midday.",
        eveningClosurePrompt: "Close the loop before end of day."
      }
    } as never);
  });

  it("renders Today's Three from the assistant brief even when raw tasks are empty", async () => {
    render(<TodayPage />);

    await waitFor(() => {
      expect(screen.getByText("Prepare leadership update")).toBeInTheDocument();
    });

    expect(screen.getByText("Review Flipkart delivery plan")).toBeInTheDocument();
    expect(screen.queryByText("No intervention items available")).toBeNull();
  });
});
