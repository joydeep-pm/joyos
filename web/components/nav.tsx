"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const sections = [
  {
    label: "Daily control",
    links: [
      { href: "/today", label: "Today" },
      { href: "/assistant", label: "Assistant" },
      { href: "/intervention", label: "Control Tower" },
      { href: "/grooming", label: "Grooming" }
    ]
  },
  {
    label: "Operating lines",
    links: [
      { href: "/review", label: "Review" },
      { href: "/strategy", label: "Strategy" },
      { href: "/people", label: "People" },
      { href: "/settings", label: "Settings" }
    ]
  }
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-5">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="eyebrow-label mb-2">{section.label}</p>
          <ul className="space-y-2">
            {section.links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href as never}
                    className={clsx(
                      "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "border-petrol/20 bg-petrol/10 text-ink shadow-sm"
                        : "border-transparent bg-transparent text-ink/70 hover:border-ink/10 hover:bg-paper/70 hover:text-ink"
                    )}
                  >
                    <span>{link.label}</span>
                    <span
                      aria-hidden="true"
                      className="mono text-[11px] uppercase tracking-[0.14em] text-slate"
                    >
                      {link.label.slice(0, 3)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
