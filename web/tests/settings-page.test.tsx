import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import SettingsPage from "@/app/settings/page";

vi.mock("@/lib/client-api", () => ({
  api: {
    getSettings: vi.fn()
  }
}));

const { api } = await import("@/lib/client-api");

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nested config values as formatted JSON instead of object coercion", async () => {
    vi.mocked(api.getSettings).mockResolvedValue({
      ok: true,
      data: {
        root: "/tmp/workspace",
        assistantFlags: {
          assistant_context_v1: true,
          assistant_loop_v1: false
        }
      }
    } as never);

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("assistantFlags")).toBeInTheDocument();
    });

    expect(screen.getByText(/"assistant_context_v1": true/)).toBeInTheDocument();
    expect(screen.queryByText("[object Object]")).toBeNull();
  });
});
