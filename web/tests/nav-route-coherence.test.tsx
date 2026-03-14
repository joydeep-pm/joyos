import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { AppNav } from "@/components/nav";

const redirectMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  )
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
  redirect: (value: string) => redirectMock(value)
}));

describe("navigation and route coherence", () => {
  it("shows Today and Assistant in primary navigation and omits Intervention", () => {
    render(<AppNav />);

    expect(screen.getByRole("link", { name: "Today" })).toHaveAttribute("href", "/today");
    expect(screen.getByRole("link", { name: "Assistant" })).toHaveAttribute("href", "/assistant");
    expect(screen.queryByRole("link", { name: "Intervention" })).not.toBeInTheDocument();
  });

  it("redirects the home route to /today", async () => {
    const HomePage = (await import("@/app/page")).default;
    HomePage();
    expect(redirectMock).toHaveBeenCalledWith("/today");
  });
});
