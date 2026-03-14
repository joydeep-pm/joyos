import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TodayPage from "@/app/today/page";

vi.mock("@/lib/client-api", () => ({
  api: {
    getTasks: vi.fn(),
    getSystemStatus: vi.fn(),
    getGoals: vi.fn(),
    capture: vi.fn()
  }
}));

const { api } = await import("@/lib/client-api");

describe("TodayPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.getTasks).mockResolvedValue({
      ok: true,
      data: [
        {
          filename: "task-1.md",
          frontmatter: {
            title: "Resolve stale client escalation",
            category: "outreach",
            priority: "P0",
            status: "n",
            due_date: "2026-03-15"
          }
        },
        {
          filename: "task-2.md",
          frontmatter: {
            title: "Finalize leadership update",
            category: "writing",
            priority: "P1",
            status: "s",
            due_date: "2026-03-18"
          }
        },
        {
          filename: "task-3.md",
          frontmatter: {
            title: "Review grooming readiness gaps",
            category: "technical",
            priority: "P1",
            status: "n"
          }
        },
        {
          filename: "task-4.md",
          frontmatter: {
            title: "Blocked engineering dependency",
            category: "technical",
            priority: "P0",
            status: "b"
          }
        }
      ]
    } as never);

    vi.mocked(api.getSystemStatus).mockResolvedValue({
      ok: true,
      data: { total_active_tasks: 4 }
    } as never);

    vi.mocked(api.getGoals).mockResolvedValue({
      ok: true,
      data: {
        highlights: {
          quarterObjective: "Improve grooming readiness",
          vision: "Run a stronger Director-of-Products operating rhythm",
          topPriorities: "Documentation, Stability, New Business"
        }
      }
    } as never);
  });

  it("renders the intervention-first daily brief", async () => {
    render(<TodayPage />);

    await waitFor(() => {
      expect(screen.getByText("Director intervention brief")).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "Today's Three" })).toBeInTheDocument();
    expect(screen.getByText(/highest-leverage interventions/i)).toBeInTheDocument();
    expect(screen.getByText("Resolve stale client escalation")).toBeInTheDocument();
    expect(screen.getByText("Finalize leadership update")).toBeInTheDocument();
    expect(screen.getByText("Review grooming readiness gaps")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Blockers that may need intervention/i })).toBeInTheDocument();
    expect(screen.getByText("Blocked engineering dependency")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Operating-goal signal/i })).toBeInTheDocument();
  });
});
