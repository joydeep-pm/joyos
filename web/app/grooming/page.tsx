/**
 * Grooming Dashboard Page
 *
 * Prepares for biweekly engineering grooming sessions.
 * Shows actionable readiness reviews, blocker pressure, and export capabilities.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  FeatureRequest,
  FeatureRequestReadinessDimension,
  FeatureRequestReadinessDimensionStatus,
  FeatureRequestReadinessMissingInputCode,
  FeatureRequestPrioritizationPosture
} from "@/lib/control-tower/types";
import type { GroomingReadinessEntry, GroomingSummary } from "@/lib/control-tower/grooming-engine";
import { exportGroomingChecklistToCSV, exportGroomingChecklistToMarkdown } from "@/lib/control-tower/grooming-engine";

function matchesFilters(featureRequest: FeatureRequest, selectedPm: string, selectedCharter: string): boolean {
  const matchesPm = selectedPm === "all" || (featureRequest.pmOwner || "Unassigned") === selectedPm;
  const matchesCharter = selectedCharter === "all" || (featureRequest.productCharter || "Unassigned") === selectedCharter;
  return matchesPm && matchesCharter;
}

function filterEntries(entries: GroomingReadinessEntry[], selectedPm: string, selectedCharter: string): GroomingReadinessEntry[] {
  return entries.filter(({ featureRequest }) => matchesFilters(featureRequest, selectedPm, selectedCharter));
}

const VERDICT_META = {
  ready: {
    label: "Ready for commitment",
    shortLabel: "Ready",
    emoji: "✅",
    sectionClassName: "border-emerald-200 bg-emerald-50/70",
    headerClassName: "text-emerald-900",
    badgeClassName: "bg-emerald-100 text-emerald-800 border-emerald-200",
    accentClassName: "border-emerald-500",
    description: "These requests have enough scope, documentation, and momentum to enter engineering grooming."
  },
  low_readiness: {
    label: "Needs directed follow-up",
    shortLabel: "Low readiness",
    emoji: "⚠️",
    sectionClassName: "border-amber-200 bg-amber-50/70",
    headerClassName: "text-amber-900",
    badgeClassName: "bg-amber-100 text-amber-800 border-amber-200",
    accentClassName: "border-amber-500",
    description: "These requests are close enough to review, but the rubric is signaling gaps that should be closed first."
  },
  blocked: {
    label: "Blocked before grooming",
    shortLabel: "Blocked",
    emoji: "🚫",
    sectionClassName: "border-rose-200 bg-rose-50/70",
    headerClassName: "text-rose-900",
    badgeClassName: "bg-rose-100 text-rose-800 border-rose-200",
    accentClassName: "border-rose-500",
    description: "These requests should not consume grooming time until the active blocker path is resolved."
  }
} as const;

const DIMENSION_META: Record<
  FeatureRequestReadinessDimension["name"],
  { label: string; shortLabel: string }
> = {
  documentation: { label: "Documentation", shortLabel: "Docs" },
  scope: { label: "Scope clarity", shortLabel: "Scope" },
  stage: { label: "Workflow stage", shortLabel: "Stage" },
  unblock_status: { label: "Blocker status", shortLabel: "Blockers" },
  prioritization: { label: "Prioritization posture", shortLabel: "Priority" },
  freshness: { label: "Signal freshness", shortLabel: "Freshness" }
};

const MISSING_INPUT_LABELS: Record<FeatureRequestReadinessMissingInputCode, string> = {
  documentation_missing: "Attach PRD or linked requirements documentation",
  scope_signal_missing: "Capture scope boundaries in notes or requirements",
  stage_signal_missing: "Refresh the workflow stage before review",
  stale_update: "Refresh the latest source update before grooming"
};

const POSTURE_META: Record<
  FeatureRequestPrioritizationPosture,
  { label: string; description: string; className: string }
> = {
  scheduled: {
    label: "Scheduled",
    description: "This request is already positioned for near-term engineering review.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800"
  },
  needs_triage: {
    label: "Needs triage",
    description: "Product still needs to decide whether this should advance into a grooming slot.",
    className: "border-amber-200 bg-amber-50 text-amber-800"
  },
  expedite_blocker_resolution: {
    label: "Expedite blocker resolution",
    description: "Resolve the blocking dependency before using engineering time on sizing or commitment.",
    className: "border-rose-200 bg-rose-50 text-rose-800"
  }
};

function getDimensionStatusClasses(status: FeatureRequestReadinessDimensionStatus): string {
  if (status === "pass") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "warn") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-rose-200 bg-rose-50 text-rose-800";
}

function formatVerdictLabel(verdict: keyof typeof VERDICT_META): string {
  return VERDICT_META[verdict].shortLabel;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function ReadinessCard({ entry }: { entry: GroomingReadinessEntry }) {
  const { featureRequest, readiness } = entry;
  const verdictMeta = VERDICT_META[readiness.verdict];
  const postureMeta = POSTURE_META[readiness.prioritizationPosture];
  const failingDimensions = readiness.dimensions.filter((dimension) => dimension.status !== "pass");
  const jiraSummary = featureRequest.jiraIssues.map((issue) => issue.key).join(", ") || "No linked Jira issues";
  const blockerCount = featureRequest.blockerSummary.blockers.length;

  return (
    <article
      className={`rounded-3xl border border-ink/10 bg-white/90 p-5 shadow-card backdrop-blur ${verdictMeta.sectionClassName}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${verdictMeta.badgeClassName}`}>
              {verdictMeta.emoji} {verdictMeta.shortLabel}
            </span>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${postureMeta.className}`}>
              {postureMeta.label}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-ink">{featureRequest.title}</h3>
            <p className="mt-1 text-sm text-slate">
              {featureRequest.pmOwner || "Unassigned PM"} · {featureRequest.productCharter || "No charter"} · Stage {featureRequest.stage.replaceAll("_", " ")}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-slate shadow-sm">
          <div className="font-medium text-ink">Latest signal</div>
          <div>{featureRequest.latestUpdate.summary}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate/70">
            {featureRequest.latestUpdate.source} · {formatDate(featureRequest.latestUpdate.date)}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className={`text-sm font-semibold uppercase tracking-[0.18em] ${verdictMeta.headerClassName}`}>
                Review call
              </h4>
              <span className="text-xs text-slate">Jira: {jiraSummary}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink">{readiness.recommendedNextStep}</p>
            <p className="mt-2 text-sm text-slate">{postureMeta.description}</p>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Rubric dimensions</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {readiness.dimensions.map((dimension) => (
                <div key={dimension.name} className={`rounded-2xl border p-3 ${getDimensionStatusClasses(dimension.status)}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{DIMENSION_META[dimension.name].label}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                      {dimension.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-5">{dimension.rationale}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Director review checklist</h4>
            <ul className="mt-3 space-y-3 text-sm text-slate">
              <li className="rounded-2xl border border-ink/10 bg-white/80 p-3">
                <span className="font-medium text-ink">Weak signals:</span>{" "}
                {failingDimensions.length > 0
                  ? failingDimensions.map((dimension) => DIMENSION_META[dimension.name].shortLabel).join(", ")
                  : "None — rubric is fully passing."}
              </li>
              <li className="rounded-2xl border border-ink/10 bg-white/80 p-3">
                <span className="font-medium text-ink">Missing inputs:</span>{" "}
                {readiness.missingInputs.length > 0 ? (
                  <span>{readiness.missingInputs.map((code) => MISSING_INPUT_LABELS[code]).join(" • ")}</span>
                ) : (
                  <span>All required inputs present.</span>
                )}
              </li>
              <li className="rounded-2xl border border-ink/10 bg-white/80 p-3">
                <span className="font-medium text-ink">Blocker class:</span>{" "}
                {readiness.blockerClass.replaceAll("_", " ")}
              </li>
            </ul>
          </section>

          {blockerCount > 0 ? (
            <section className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-900">Active blockers</h4>
              <div className="mt-3 space-y-3">
                {featureRequest.blockerSummary.blockers.map((blocker, index) => (
                  <div key={`${featureRequest.id}-${index}`} className="rounded-2xl border border-rose-200 bg-white/80 p-3 text-sm text-rose-900">
                    <div className="font-medium">{blocker.description}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-rose-700">
                      {blocker.type} · open {blocker.daysOpen} days
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-ink/10 bg-white/80 p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Source coverage</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-ink/10 bg-white/80 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate/70">Jira issues</div>
                <div className="mt-2 text-xl font-semibold text-ink">{featureRequest.jiraIssues.length}</div>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-white/80 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate/70">Confluence docs</div>
                <div className="mt-2 text-xl font-semibold text-ink">{featureRequest.confluencePages.length}</div>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-white/80 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate/70">Local notes</div>
                <div className="mt-2 text-xl font-semibold text-ink">{featureRequest.localNotes.length}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}

function ReviewSection({
  title,
  description,
  verdict,
  entries
}: {
  title: string;
  description: string;
  verdict: keyof typeof VERDICT_META;
  entries: GroomingReadinessEntry[];
}) {
  const verdictMeta = VERDICT_META[verdict];

  return (
    <section className={`rounded-[2rem] border p-6 shadow-panel ${verdictMeta.sectionClassName}`}>
      <div className="flex flex-col gap-3 border-b border-ink/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className={`text-2xl font-semibold ${verdictMeta.headerClassName}`}>
            {verdictMeta.emoji} {title} ({entries.length})
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate">{description}</p>
        </div>
        <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${verdictMeta.badgeClassName}`}>
          {formatVerdictLabel(verdict)} queue
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {entries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/15 bg-white/70 p-8 text-sm text-slate">
            No requests currently fall into this review lane.
          </div>
        ) : (
          entries.map((entry) => <ReadinessCard key={entry.featureRequest.id} entry={entry} />)
        )}
      </div>
    </section>
  );
}

export default function GroomingPage() {
  const [summary, setSummary] = useState<GroomingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPm, setSelectedPm] = useState<string>("all");
  const [selectedCharter, setSelectedCharter] = useState<string>("all");

  useEffect(() => {
    void fetchGroomingSummary();
  }, []);

  const fetchGroomingSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/control-tower/grooming");
      if (!response.ok) throw new Error("Failed to fetch grooming summary");
      const data: GroomingSummary = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Failed to load grooming summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!summary) return;
    const markdown = exportGroomingChecklistToMarkdown(summary);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `grooming-checklist-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!summary) return;
    const csv = exportGroomingChecklistToCSV(summary);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `grooming-checklist-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const filteredEntries = useMemo(() => {
    if (!summary) {
      return [] as GroomingReadinessEntry[];
    }

    return filterEntries(summary.readiness.evaluations, selectedPm, selectedCharter);
  }, [selectedCharter, selectedPm, summary]);

  const filteredReady = filteredEntries.filter((entry) => entry.readiness.verdict === "ready");
  const filteredLowReadiness = filteredEntries.filter((entry) => entry.readiness.verdict === "low_readiness");
  const filteredBlocked = filteredEntries.filter((entry) => entry.readiness.verdict === "blocked");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-warm-600"></div>
          <p className="mt-4 text-warm-700">Loading grooming readiness...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-50">
        <p className="text-warm-700">Failed to load grooming data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex items-center rounded-full border border-ink/10 bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cloud">
                Grooming readiness engine
              </span>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-warm-900">Engineering Grooming Prep</h1>
                <p className="mt-3 text-base leading-7 text-warm-700">
                  Review each request with the readiness rubric, see why it is ready or not, and leave the session with a concrete next move for every item.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={handleExportMarkdown}
                className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-cloud shadow-sm transition hover:translate-y-[-1px]"
              >
                Export Markdown
              </button>
              <button
                onClick={handleExportCSV}
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:translate-y-[-1px]"
              >
                Export CSV
              </button>
              <button
                onClick={() => void fetchGroomingSummary()}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm ring-1 ring-ink/10 transition hover:translate-y-[-1px]"
              >
                Refresh
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-ink/10 bg-white/85 p-5 shadow-card">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate/70">Total items</div>
            <div className="mt-3 text-4xl font-semibold text-ink">{summary.totalFeatureRequests}</div>
            <p className="mt-2 text-sm text-slate">Requests currently in the grooming intake view.</p>
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-card">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Ready</div>
            <div className="mt-3 text-4xl font-semibold text-emerald-900">{summary.readyCount}</div>
            <p className="mt-2 text-sm text-emerald-800">Can be scheduled without additional clarification work.</p>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 shadow-card">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Low readiness</div>
            <div className="mt-3 text-4xl font-semibold text-amber-900">{summary.readiness.lowReadiness.length}</div>
            <p className="mt-2 text-sm text-amber-800">Need documentation, scope, freshness, or prioritization follow-up.</p>
          </div>
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-5 shadow-card">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Blocked</div>
            <div className="mt-3 text-4xl font-semibold text-rose-900">{summary.blockedCount}</div>
            <p className="mt-2 text-sm text-rose-800">Should stay out of commitment discussions until blockers are cleared.</p>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink">Filter the review queue</h2>
                <p className="mt-1 text-sm text-slate">Focus the rubric by PM owner or charter without losing the aggregate readiness totals.</p>
              </div>
              <div className="text-sm text-slate">
                Showing <span className="font-semibold text-ink">{filteredEntries.length}</span> of {summary.totalFeatureRequests} requests
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate/70">PM owner</span>
                <select
                  value={selectedPm}
                  onChange={(event) => setSelectedPm(event.target.value)}
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none ring-0 transition focus:border-ink/25"
                >
                  <option value="all">All PMs</option>
                  {Object.keys(summary.byPmOwner).map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate/70">Product charter</span>
                <select
                  value={selectedCharter}
                  onChange={(event) => setSelectedCharter(event.target.value)}
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none ring-0 transition focus:border-ink/25"
                >
                  <option value="all">All charters</option>
                  {Object.keys(summary.byCharter).map((charter) => (
                    <option key={charter} value={charter}>
                      {charter}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-panel backdrop-blur">
            <h2 className="text-xl font-semibold text-ink">Session signal</h2>
            <div className="mt-4 space-y-4 text-sm text-slate">
              <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate/70">Estimate coverage</div>
                <div className="mt-2 text-3xl font-semibold text-ink">{summary.estimateCoverage}%</div>
                <p className="mt-2">Share of visible requests that are already ready for engineering grooming.</p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate/70">Immediate action needed</div>
                <p className="mt-2 leading-6">
                  {filteredBlocked.length > 0
                    ? `${filteredBlocked.length} filtered request${filteredBlocked.length === 1 ? " is" : "s are"} blocked and should be routed to dependency resolution before the next grooming slot.`
                    : "No filtered requests are currently hard-blocked."}
                </p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate/70">Clarification lane</div>
                <p className="mt-2 leading-6">
                  {filteredLowReadiness.length > 0
                    ? `${filteredLowReadiness.length} filtered request${filteredLowReadiness.length === 1 ? " needs" : "s need"} directed PM follow-up before the director can use grooming time efficiently.`
                    : "No filtered requests currently need clarification follow-up."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <ReviewSection
            title="Ready for commitment"
            description={VERDICT_META.ready.description}
            verdict="ready"
            entries={filteredReady}
          />
          <ReviewSection
            title="Needs directed follow-up"
            description={VERDICT_META.low_readiness.description}
            verdict="low_readiness"
            entries={filteredLowReadiness}
          />
          <ReviewSection
            title="Blocked before grooming"
            description={VERDICT_META.blocked.description}
            verdict="blocked"
            entries={filteredBlocked}
          />
        </div>
      </div>
    </div>
  );
}
