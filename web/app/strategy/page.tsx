import Link from "next/link";
import { StrategyClientShell } from "@/components/strategy/StrategyClientShell";
import { StrategyDeepDiveGrid } from "@/components/strategy/StrategyDeepDiveGrid";
import { StrategyOutputActions } from "@/components/strategy/StrategyOutputActions";
import { StrategyRoadmapBoard } from "@/components/strategy/StrategyRoadmapBoard";
import { getStrategyWorkspace } from "@/lib/strategy";
import { STRATEGY_COMMAND_CENTER } from "@/lib/strategy-command-center";
import { getRoadmapItemsWithStatus } from "@/lib/strategy-status-store";

function summarizeMarkdown(body: string, max = 280) {
  const text = body
    .replace(/^#.*$/gm, "")
    .replace(/[*_`>#-]/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

function SectionCard({ title, eyebrow, body, href }: { title: string; eyebrow?: string; body: string; href?: string }) {
  const content = (
    <article className="rounded-[28px] border border-ink/10 bg-white/85 p-6 shadow-card backdrop-blur transition hover:-translate-y-0.5 hover:shadow-panel">
      {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">{eyebrow}</p> : null}
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-ink/70">{body}</p>
    </article>
  );

  return href ? <Link href={href as never}>{content}</Link> : content;
}

function LinkChip({ label }: { label: string }) {
  return <span className="rounded-full border border-ink/10 bg-cloud/80 px-3 py-1 text-xs font-semibold text-ink/70">{label}</span>;
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-[24px] border border-ink/10 bg-white/85 p-5 shadow-card backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-ink">{value}</p>
      <p className="mt-3 text-sm leading-7 text-ink/65">{note}</p>
    </article>
  );
}

function BulletPanel({ title, eyebrow, items }: { title: string; eyebrow: string; items: string[] }) {
  return (
    <section className="rounded-[30px] border border-ink/10 bg-white/85 p-6 shadow-card backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">{eyebrow}</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{title}</h3>
      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div key={item} className="flex gap-3 rounded-[18px] border border-ink/10 bg-cloud/70 px-4 py-3">
            <span className="mono mt-0.5 text-xs text-ink/40">0{index + 1}</span>
            <p className="text-sm leading-7 text-ink/75">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function OutputCard({ title, body, path, slug }: { title: string; body: string; path: string; slug: string }) {
  return (
    <Link href={`/strategy/${slug}` as never}>
      <article className="rounded-[24px] border border-ink/10 bg-cloud/60 p-5 transition hover:-translate-y-0.5 hover:shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate">Output</p>
            <h4 className="mt-2 text-lg font-semibold text-ink">{title}</h4>
          </div>
          <span className="rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-ink/60">Open</span>
        </div>
        <p className="mt-3 text-sm leading-7 text-ink/70">{summarizeMarkdown(body, 240)}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/45">
          <span className="rounded-full border border-ink/10 px-3 py-1">View in app</span>
          <span className="rounded-full border border-ink/10 px-3 py-1">Copy/export-ready</span>
        </div>
        <p className="mt-4 text-xs text-ink/45">Source: {path}</p>
      </article>
    </Link>
  );
}

export default async function StrategyPage() {
  const workspace = await getStrategyWorkspace();
  const roadmapItems = await getRoadmapItemsWithStatus();
  const current = workspace.currentShareableStatus;
  const latestBusiness = workspace.businessStatusUpdates[0] ?? null;
  const latestRoadmap = workspace.roadmapUpdates[0] ?? null;
  const latestExecutive = workspace.executiveSnapshots[0] ?? null;
  const latestBoard = workspace.boardSummaries[0] ?? null;

  const overview = (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[36px] border border-ink/10 bg-[radial-gradient(circle_at_top_left,rgba(141,215,191,0.28),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(239,191,125,0.22),transparent_28%),linear-gradient(145deg,rgba(255,255,255,0.92),rgba(244,246,243,0.82))] p-8 shadow-panel">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate">Strategy command center</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-ink">
              Full-picture FY27 strategy, roadmap protection, and stakeholder outputs — now visible inside the app.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-ink/70">
              This page is designed to restore what made the original HTML useful: one place to understand the business read, the protected bets,
              the major watchouts, and the latest updates you can share.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <LinkChip label="Executive metrics" />
              <LinkChip label="Roadmap strip" />
              <LinkChip label="Parity and loss lens" />
              <LinkChip label="Protected priorities" />
              <LinkChip label="Shareable outputs" />
            </div>
          </div>
          <div className="rounded-[28px] border border-ink/10 bg-ink p-6 text-cloud shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cloud/60">Current business-facing read</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">{current?.title ?? "Current Shareable Status"}</h3>
            <p className="mt-4 text-sm leading-7 text-cloud/80">
              {current ? summarizeMarkdown(current.body, 420) : "No current shareable status note found yet."}
            </p>
            {current ? (
              <div className="mt-5">
                <Link href={`/strategy/${current.slug}` as never} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cloud transition hover:bg-white/20">
                  Open current status
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspace.metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} note={metric.note} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {workspace.keyStrategyNotes.map((doc) => (
              <SectionCard key={doc.slug} eyebrow="Core strategy" title={doc.title} body={summarizeMarkdown(doc.body, 260)} href={`/strategy/${doc.slug}` as never} />
            ))}
          </div>
          <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Product deep-dives</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">The categories shaping the FY27 story</h3>
              </div>
            </div>
            <div className="mt-6">
              <StrategyDeepDiveGrid items={STRATEGY_COMMAND_CENTER.deepDives} />
            </div>
          </section>
        </div>
        <aside className="space-y-6">
          <BulletPanel eyebrow="Win/loss lens" title="Recurring commercial risk themes" items={workspace.riskThemes} />
          <BulletPanel eyebrow="Dependencies" title="Critical specialist and readiness dependencies" items={workspace.dependencyHighlights} />
        </aside>
      </div>
    </div>
  );

  const roadmap = (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Roadmap strip</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Quarter-by-quarter strategic arc</h3>
          </div>
          <p className="max-w-xl text-right text-sm leading-7 text-ink/65">A simpler frontend version of the HTML roadmap framing: each quarter has a distinct strategic job and protected outcome.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workspace.roadmapQuarters.map((quarter) => (
            <article key={quarter.quarter} className="rounded-[24px] border border-ink/10 bg-cloud/70 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate">{quarter.quarter}</p>
              <h4 className="mt-2 text-lg font-semibold text-ink">{quarter.theme}</h4>
              <p className="mt-3 text-sm leading-7 text-ink/70">{quarter.objective}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Roadmap status</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Where roadmap items currently stand</h3>
          </div>
          <p className="max-w-xl text-right text-sm leading-7 text-ink/65">This is the first real frontend surface for roadmap item status. Use it to inspect and update the current state.</p>
        </div>
        <div className="mt-6">
          <StrategyRoadmapBoard initialItems={roadmapItems} />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <BulletPanel eyebrow="Roadmap protection" title="Current protected priorities" items={workspace.protectedPriorities} />
        <BulletPanel eyebrow="Watchouts" title="Current risks and drift signals" items={workspace.watchouts} />
      </div>

      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Parity and loss lens</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Where the commercial pressure is concentrated</h3>
          </div>
          <p className="max-w-xl text-right text-sm leading-7 text-ink/65">These are the category-level signals that explain why the roadmap needs protection rather than generic expansion.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {workspace.parityHighlights.map((item) => (
            <article key={item.name} className="rounded-[24px] border border-ink/10 bg-cloud/70 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate">{item.name}</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-ink">{item.parity}</p>
              <p className="mt-3 text-sm leading-7 text-ink/70">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <BulletPanel
          eyebrow="Compliance"
          title="Enterprise gatekeepers"
          items={[
            "DPDPA and InfoSec readiness affect enterprise deal survival.",
            "ECL, EIR, and audit depth should be treated as business gates, not optional polish.",
            "Compliance slippage can erase the commercial value of roadmap progress."
          ]}
        />
        <BulletPanel
          eyebrow="Specialist readiness"
          title="Domain support requirements"
          items={[
            "Capital markets requires explicit domain expertise before confident commitment.",
            "Islamic finance needs product leadership plus certification/advisory support.",
            "Regional expansion requires localization and compliance support, not generic ambition."
          ]}
        />
        <BulletPanel
          eyebrow="Referenceability"
          title="Commercial confidence layer"
          items={[
            "Roadmap progress needs proof assets and references to convert commercially.",
            "Stability work protects the business story, not just engineering quality.",
            "Implementation confidence is part of the GTM strategy."
          ]}
        />
      </div>

      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <div className="grid gap-4 md:grid-cols-3">
          {STRATEGY_COMMAND_CENTER.aopPanels.map((panel) => (
            <article key={panel.title} className="rounded-[24px] border border-ink/10 bg-cloud/70 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate">AOP lens</p>
              <h4 className="mt-2 text-lg font-semibold text-ink">{panel.title}</h4>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">{panel.value}</p>
              <p className="mt-3 text-sm leading-7 text-ink/70">{panel.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Risks and hiring</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Operational risks that still need explicit leadership attention</h3>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STRATEGY_COMMAND_CENTER.riskHiring.map((item) => (
            <article key={item.title} className="rounded-[24px] border border-ink/10 bg-cloud/70 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate">{item.severity}</p>
              <h4 className="mt-2 text-lg font-semibold text-ink">{item.title}</h4>
              <p className="mt-3 text-sm leading-7 text-ink/70">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="rounded-[30px] border border-ink/10 bg-white/85 p-6 shadow-card backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Decision support</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">What leadership should watch</h3>
        <div className="mt-5 space-y-4">
          {workspace.decisionSupport.map((doc) => (
            <Link key={doc.slug} href={`/strategy/${doc.slug}` as never}>
              <div className="rounded-[22px] border border-ink/10 bg-cloud/70 p-4 transition hover:bg-cloud">
                <h4 className="text-base font-semibold text-ink">{doc.title}</h4>
                <p className="mt-2 text-sm leading-7 text-ink/70">{summarizeMarkdown(doc.body, 180)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const outputs = (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Shareable outputs</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Latest stakeholder-ready updates</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {workspace.templates.map((template) => (
              <Link key={template.slug} href={`/strategy/${template.slug}` as never}>
                <span className="inline-flex rounded-full border border-ink/10 bg-cloud/80 px-3 py-1 text-xs font-semibold text-ink/70">{template.title}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[latestBusiness, latestRoadmap, latestExecutive, latestBoard].filter(Boolean).map((doc) => (
            <OutputCard key={doc!.slug} title={doc!.title} body={doc!.body} path={doc!.path} slug={doc!.slug} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StrategyOutputActions />

        <div className="rounded-[30px] border border-ink/10 bg-white/85 p-6 shadow-card backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">System index</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">How the strategy system fits together</h3>
          <div className="mt-4 space-y-3">
            {workspace.indexes.map((doc) => (
              <Link key={doc.slug} href={`/strategy/${doc.slug}` as never}>
                <div className="rounded-2xl border border-ink/10 bg-cloud/70 p-4 transition hover:bg-cloud">
                  <h4 className="text-sm font-semibold text-ink">{doc.title}</h4>
                  <p className="mt-2 text-sm leading-7 text-ink/70">{summarizeMarkdown(doc.body, 160)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return <StrategyClientShell overview={overview} roadmap={roadmap} outputs={outputs} />;
}
