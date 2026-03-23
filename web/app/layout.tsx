import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import "@/app/globals.css";
import { AppNav } from "@/components/nav";
import { CopilotPanel } from "@/components/copilot-panel";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Product Control Tower",
  description: "M2P Fintech Product Management - Director-level intervention, grooming, and team management."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={instrumentSerif.variable}>
        <div className="mx-auto min-h-screen w-full max-w-[1480px] px-4 py-4 md:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="panel-surface section-shell lg:sticky lg:top-4 lg:self-start">
              <p className="eyebrow-label">Joydeep Sarkar</p>
              <h1 className="page-title mt-4">JoyOS Control Tower</h1>
              <p className="mt-4 max-w-xs text-sm leading-6 text-ink/70">
                Personal operating cockpit for intervention, grooming, strategy, people review, and approval-gated product execution.
              </p>
              <div className="mt-8">
                <AppNav />
              </div>
              <div className="mt-8 rounded-2xl border border-ink/10 bg-paper/70 p-4">
                <p className="eyebrow-label">Operating lens</p>
                <p className="mt-2 text-sm text-ink/75">
                  Feature request is the primary unit. Bias the product toward review, decision quality, and visible intervention.
                </p>
              </div>
            </aside>
            <div className="app-shell-main space-y-5">
              <header className="panel-muted section-shell">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="eyebrow-label">Director intervention workspace</p>
                    <h2 className="section-title mt-3">Calm authority under pressure.</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70">
                      Use the tower to decide where to intervene, what to clarify, what to queue for grooming, and what to turn into approval-ready communication.
                    </p>
                  </div>
                  <div className="rounded-full border border-ink/10 bg-paper/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                    Desktop-first daily desk
                  </div>
                </div>
              </header>
              <main>{children}</main>
            </div>
          </div>
        </div>
        <CopilotPanel />
      </body>
    </html>
  );
}
