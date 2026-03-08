import type { Metadata } from "next";
import "@/app/globals.css";
import { AppNav } from "@/components/nav";
import { CopilotPanel } from "@/components/copilot-panel";

export const metadata: Metadata = {
  title: "Personal OS Web",
  description: "Local-first execution assistant for context, planning, and outcome delivery."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
          <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">Personal OS</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Execution Assistant</h1>
            </div>
            <AppNav />
          </header>
          <main className="flex-1">{children}</main>
        </div>
        <CopilotPanel />
      </body>
    </html>
  );
}
