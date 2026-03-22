"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/today", label: "Today" },
  { href: "/assistant", label: "Assistant" },
  { href: "/strategy", label: "Strategy" },
  { href: "/intervention", label: "Control Tower" },
  { href: "/grooming", label: "Grooming" },
  { href: "/people", label: "People" },
  { href: "/settings", label: "Settings" }
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="rounded-2xl border border-slate/20 bg-white/80 p-2 shadow-card backdrop-blur">
      <ul className="flex flex-wrap items-center gap-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href as never}
                className={clsx(
                  "inline-flex rounded-xl px-4 py-2 text-sm font-semibold tracking-tight transition",
                  active
                    ? "bg-ink text-cloud shadow-sm"
                    : "text-ink/70 hover:bg-ink/10 hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
