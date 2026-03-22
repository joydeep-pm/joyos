import { StrategyClientShell } from "@/components/strategy/StrategyClientShell";
import { StrategyDeepDiveGrid } from "@/components/strategy/StrategyDeepDiveGrid";
import { StrategyStatusConsole } from "@/components/strategy/StrategyStatusConsole";
import { StrategyKanbanBoard } from "@/components/strategy/StrategyKanbanBoard";
import { StrategyAopTable } from "@/components/strategy/StrategyAopTable";
import { STRATEGY_COMMAND_CENTER } from "@/lib/strategy-command-center";

const PROB_COLOR: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Med: "bg-amber-100 text-amber-700",
  Low: "bg-green-100 text-green-700",
};

const IMPACT_COLOR: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-amber-100 text-amber-700",
  Med: "bg-blue-100 text-blue-700",
};

export default async function StrategyPage() {
  const {
    kpiMetrics, insights, epics, parityData,
    pillars, moats, frictionZones,
    risks: riskItems, hires, decisions,
    gallery, deepDives,
  } = STRATEGY_COMMAND_CENTER;

  // ── OVERVIEW ─────────────────────────────────────────────────────────────
  const overview = (
    <StrategyStatusConsole
      kpiMetrics={kpiMetrics}
      insights={insights}
      epics={epics}
      gallery={gallery}
    />
  );

  // ── PRODUCT STRATEGY ──────────────────────────────────────────────────────
  const strategy = (
    <div className="space-y-8">
      {/* Strategic Pillars */}
      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Strategic Imperatives</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Five pillars driving FY27</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {pillars.map((p) => (
            <article
              key={p.title}
              style={{ borderLeftColor: p.color }}
              className="rounded-[20px] border border-ink/10 border-l-4 bg-cloud/70 p-4"
            >
              <h4 className="text-sm font-semibold tracking-tight text-ink">{p.title}</h4>
              <p className="mt-2 text-xs leading-6 text-ink/65">{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Parity Bars */}
      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Parity &amp; Loss Lens</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">M2P vs. best-in-class coverage</h3>
        <div className="mt-6 space-y-3">
          {[...parityData].sort((a, b) => (a.us - a.best) - (b.us - b.best)).map((item) => {
            const gap = item.best - item.us;
            return (
              <div key={item.name} className="grid grid-cols-[180px_1fr_64px] items-center gap-4">
                <div>
                  <p className="text-xs font-semibold text-ink">{item.name}</p>
                  <p className="text-[11px] text-ink/45">vs {item.who}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 text-right text-[10px] text-ink/40">M2P</span>
                    <div className="h-1.5 flex-1 rounded-full bg-ink/10">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${item.us}%` }} />
                    </div>
                    <span className="w-7 text-[10px] text-ink/60">{item.us}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-7 text-right text-[10px] text-ink/40">Best</span>
                    <div className="h-1.5 flex-1 rounded-full bg-ink/10">
                      <div className="h-1.5 rounded-full bg-ink/25" style={{ width: `${item.best}%` }} />
                    </div>
                    <span className="w-7 text-[10px] text-ink/60">{item.best}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${gap > 30 ? "bg-red-100 text-red-700" : gap > 10 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                    {gap > 0 ? `−${gap}%` : `+${Math.abs(gap)}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Strategic Moats */}
      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Strategic Moats</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Where M2P builds defensible advantage</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {moats.map((m) => (
            <article
              key={m.title}
              style={{ borderTopColor: m.color }}
              className="rounded-[24px] border border-ink/10 border-t-4 bg-cloud/70 p-5"
            >
              <p className="text-xl">{m.icon}</p>
              <h4 className="mt-3 text-lg font-semibold tracking-tight text-ink">{m.title}</h4>
              <p className="mt-3 text-sm leading-7 text-ink/70">{m.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Friction Zones */}
      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Friction Zones</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Where execution risk is highest</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {frictionZones.map((fz) => (
            <article
              key={fz.label}
              style={{ borderTopColor: fz.color }}
              className="rounded-[20px] border border-ink/10 border-t-4 bg-cloud/70 p-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: fz.color }}>{fz.label}</p>
              <h4 className="mt-2 text-sm font-semibold text-ink">{fz.title}</h4>
              <p className="mt-2 text-xs leading-6 text-ink/65">{fz.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );

  // ── ROADMAP ────────────────────────────────────────────────────────────────
  const roadmap = <StrategyKanbanBoard epics={epics} />;

  // ── AOP PLANNING ──────────────────────────────────────────────────────────
  const aop = <StrategyAopTable epics={epics} />;

  // ── RISKS & HIRING ────────────────────────────────────────────────────────
  const risks = (
    <div className="space-y-8">
      {/* Risk Register */}
      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Risk Register</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Execution risks requiring leadership attention</h3>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10">
                <th className="pb-3 pr-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/50">Prob</th>
                <th className="pb-3 pr-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/50">Impact</th>
                <th className="pb-3 pl-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/50">Risk</th>
                <th className="pb-3 pl-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/50">Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {riskItems.map((r) => (
                <tr key={r.name} className="transition hover:bg-cloud/50">
                  <td className="py-3 pr-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PROB_COLOR[r.prob]}`}>{r.prob}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${IMPACT_COLOR[r.impact]}`}>{r.impact}</span>
                  </td>
                  <td className="py-3 pl-4 font-semibold text-ink">{r.name}</td>
                  <td className="max-w-sm py-3 pl-4 text-ink/65">{r.mit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Hiring Plan */}
      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Hiring Plan</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Domain specialist hires needed to execute</h3>
        <div className="mt-6 space-y-3">
          {hires.map((h) => (
            <div key={h.role} className="flex items-start gap-4 rounded-[20px] border border-ink/10 bg-cloud/70 px-4 py-3">
              <span className="mt-0.5 whitespace-nowrap rounded-full border border-ink/10 bg-white/70 px-3 py-1 font-mono text-[11px] font-semibold text-ink/60">{h.when}</span>
              <div>
                <p className="text-sm font-semibold text-ink">{h.role}</p>
                <p className="mt-1 text-xs leading-6 text-ink/65">{h.why}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* C-suite Decisions */}
      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">C-suite Decisions</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Decisions that need leadership sign-off</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {decisions.map((d) => (
            <article
              key={d.title}
              style={{ borderTopColor: d.color }}
              className="rounded-[20px] border border-ink/10 border-t-4 bg-cloud/70 p-4"
            >
              <h4 className="text-sm font-semibold text-ink">{d.title}</h4>
              <p className="mt-2 text-xs leading-6 text-ink/65">{d.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );

  // ── DEEP-DIVES ────────────────────────────────────────────────────────────
  const verticals = gallery.filter((g) => g.type === "v");
  const horizontals = gallery.filter((g) => g.type === "h");

  const deepdives = (
    <div className="space-y-8">
      {/* Verticals */}
      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Vertical Products</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Product verticals and coverage depth</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {verticals.map((g) => (
            <article
              key={g.id}
              style={{ borderTopColor: g.color }}
              className="rounded-[24px] border border-ink/10 border-t-4 bg-cloud/70 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{g.icon}</span>
                <h4 className="text-sm font-semibold text-ink">{g.name}</h4>
              </div>
              {g.us !== null && g.best !== null && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 text-right text-[10px] text-ink/40">M2P</span>
                    <div className="h-1.5 flex-1 rounded-full bg-ink/10">
                      <div className="h-1.5 rounded-full" style={{ width: `${g.us}%`, backgroundColor: g.color }} />
                    </div>
                    <span className="text-[10px] text-ink/60">{g.us}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-7 text-right text-[10px] text-ink/40">Best</span>
                    <div className="h-1.5 flex-1 rounded-full bg-ink/10">
                      <div className="h-1.5 rounded-full bg-ink/25" style={{ width: `${g.best}%` }} />
                    </div>
                    <span className="text-[10px] text-ink/60">{g.best}%</span>
                  </div>
                </div>
              )}
              <p className="mt-3 text-xs leading-5 text-ink/55">{g.tag}</p>
              {g.loss && <p className="mt-2 text-[11px] font-semibold text-red-600">{g.loss}</p>}
              {g.epics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {g.epics.map((e) => (
                    <span key={e} className="rounded border border-ink/10 bg-white/70 px-1.5 py-0.5 font-mono text-[10px] text-ink/50">{e}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Horizontals */}
      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Horizontal Platforms</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Cross-cutting capabilities shaping the FY27 arc</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {horizontals.map((g) => (
            <article
              key={g.id}
              style={{ borderTopColor: g.color }}
              className="rounded-[24px] border border-ink/10 border-t-4 bg-cloud/70 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{g.icon}</span>
                <h4 className="text-sm font-semibold text-ink">{g.name}</h4>
              </div>
              <p className="mt-3 text-xs leading-5 text-ink/55">{g.tag}</p>
              {g.opp && <p className="mt-2 text-[11px] font-semibold text-blue-600">{g.opp}</p>}
              {g.epics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {g.epics.map((e) => (
                    <span key={e} className="rounded border border-ink/10 bg-white/70 px-1.5 py-0.5 font-mono text-[10px] text-ink/50">{e}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Legacy deep-dives */}
      <section className="rounded-[32px] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate">Product Deep-Dives</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Category analysis and commercial framing</h3>
        <div className="mt-6">
          <StrategyDeepDiveGrid items={deepDives} />
        </div>
      </section>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-ink/10 bg-[radial-gradient(circle_at_top_left,rgba(141,215,191,0.28),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(239,191,125,0.22),transparent_28%),linear-gradient(145deg,rgba(255,255,255,0.92),rgba(244,246,243,0.82))] p-8 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate">Strategy Command Center</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-ink">FY27 product strategy, roadmap protection, and execution tracking.</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-ink/70">37 EPICs · 5,551 PD · four quarters · one operating view.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {["KPI Overview", "Strategic Pillars", "EPIC Kanban", "AOP Planning", "Risk Register", "Deep-Dives"].map((l) => (
            <span key={l} className="rounded-full border border-ink/10 bg-cloud/80 px-3 py-1 text-xs font-semibold text-ink/70">{l}</span>
          ))}
        </div>
      </div>

      <StrategyClientShell
        overview={overview}
        strategy={strategy}
        roadmap={roadmap}
        aop={aop}
        risks={risks}
        deepdives={deepdives}
      />
    </div>
  );
}
