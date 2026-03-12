"use client";

import React, { useEffect, useMemo, useState } from "react";

import { ArtifactViewer } from "@/components/artifacts/ArtifactViewer";
import type { Artifact } from "@/lib/control-tower/artifacts/types";
import type { PmPortfolioSummary, PeopleAssemblyDiagnostic } from "@/lib/control-tower/people-assembler";
import type { FeatureRequestAssemblyDiagnostic } from "@/lib/control-tower/types";

type PeopleDiagnostic = FeatureRequestAssemblyDiagnostic | PeopleAssemblyDiagnostic;

interface PeopleResponse {
  success: boolean;
  summary: {
    generatedAt: string;
    totalPMs: number;
    totalNeedingAttention: number;
    message: string;
  };
  pmPortfolios: PmPortfolioSummary[];
  diagnostics: PeopleDiagnostic[];
}

interface PeopleNotesFormState {
  lastOneOnOneDate: string;
  nextOneOnOneDate: string;
  coachingFocus: string;
  privateNotes: string;
  lastUpdatedBy: string;
}

const ATTENTION_STYLES: Record<PmPortfolioSummary["attention"]["level"], string> = {
  high: "bg-rose-100 text-rose-700 border border-rose-200",
  medium: "bg-amber-100 text-amber-700 border border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border border-emerald-200"
};

const ATTENTION_PANEL_STYLES: Record<PmPortfolioSummary["attention"]["level"], string> = {
  high: "border-rose-200 bg-rose-50/80",
  medium: "border-amber-200 bg-amber-50/80",
  low: "border-emerald-200 bg-emerald-50/80"
};

function formatGeneratedAt(value: string): string {
  return new Date(value).toLocaleString();
}

function buildIdpDraft(pm: PmPortfolioSummary): Artifact {
  const now = new Date().toISOString();
  const developmentSignals = pm.portfolio
    .filter((featureRequest) => featureRequest.review.record?.reviewStatus === "needs_follow_up" || featureRequest.blockerSummary.hasBlockers)
    .map((featureRequest) => `- ${featureRequest.title}: ${featureRequest.review.record?.decisionSummary ?? featureRequest.blockerSummary.blockers[0]?.description ?? "Needs coaching attention"}`);

  const strengths = pm.portfolio
    .filter((featureRequest) => featureRequest.stage === "prod_deploy")
    .map((featureRequest) => `- ${featureRequest.title}: delivered to production`);

  const persistedCoachingFocus = pm.peopleRecord.record?.coachingFocus ?? [];

  const content = `# IDP Feedback - ${pm.pmName}

**Generated:** ${new Date(now).toLocaleDateString()}
**Attention Level:** ${pm.attention.level}

## Strength Signals
${strengths.length > 0 ? strengths.join("\n") : "- No shipped delivery signals captured in the current window."}

## Development Signals
${developmentSignals.length > 0 ? developmentSignals.join("\n") : "- No major development concerns were surfaced in the current portfolio snapshot."}

## Recommended Coaching Focus
${[...persistedCoachingFocus, ...pm.attention.reasons].map((reason) => `- ${reason}`).join("\n")}

## Portfolio Snapshot
- Feature requests in scope: ${pm.featureRequestCount}
- Positive evidence: ${pm.evidenceSummary.positiveCount}
- Developmental evidence: ${pm.evidenceSummary.developmentalCount}

## Private Notes Snapshot
${pm.peopleRecord.record?.privateNotes ? pm.peopleRecord.record.privateNotes : "No persisted private notes yet."}

## Draft Development Plan
- [ ] Review recurring blocker patterns
- [ ] Confirm next quarter capability goals
- [ ] Agree on one measurable follow-up before the next 1:1
`;

  return {
    id: `idp-${pm.pmName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`,
    type: "idp_feedback",
    title: `IDP Feedback - ${pm.pmName}`,
    content,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    metadata: {
      featureRequestId: `pm-${pm.pmName.replace(/\s+/g, "-").toLowerCase()}`,
      featureRequestTitle: `PM portfolio for ${pm.pmName}`,
      generatedAt: now,
      generatedBy: "Product Control Tower",
      pmOwner: pm.pmName
    }
  };
}

function buildOneOnOneDraft(pm: PmPortfolioSummary): Artifact {
  const now = new Date().toISOString();
  const portfolioHighlights = pm.portfolio
    .slice(0, 5)
    .map((featureRequest) => {
      const reasons = featureRequest.interventionReasons.map((reason) => reason.message).join("; ");
      return `- ${featureRequest.title} (${featureRequest.stage})${reasons ? ` — ${reasons}` : ""}`;
    });

  const content = `# 1:1 Preparation - ${pm.pmName}

**Generated:** ${new Date(now).toLocaleDateString()}
**1:1 Status:** ${pm.oneOnOne.status === "missing_history" ? "No prior 1:1 history captured" : pm.oneOnOne.overdue ? "Overdue" : "Up to date"}

## Why this PM needs attention
${pm.attention.reasons.map((reason) => `- ${reason}`).join("\n")}

## Persisted coaching state
- Last 1:1: ${pm.peopleRecord.record?.lastOneOnOneDate ?? "Not captured yet"}
- Next 1:1: ${pm.peopleRecord.record?.nextOneOnOneDate ?? "Not scheduled yet"}
- Coaching focus: ${pm.peopleRecord.record?.coachingFocus.join(", ") || "Not captured yet"}

## Portfolio highlights
${portfolioHighlights.length > 0 ? portfolioHighlights.join("\n") : "- No live feature requests currently mapped."}

## Evidence snapshot
- Positive evidence: ${pm.evidenceSummary.positiveCount}
- Developmental evidence: ${pm.evidenceSummary.developmentalCount}
- Total evidence points: ${pm.evidenceSummary.totalEvidence}

## Suggested agenda
- [ ] Review wins since the last checkpoint
- [ ] Discuss active blockers and where escalation is needed
- [ ] Confirm ownership and follow-through on review follow-ups
- [ ] Agree on one development goal before the next session
`;

  return {
    id: `1on1-${pm.pmName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`,
    type: "status_update",
    title: `1:1 Prep - ${pm.pmName}`,
    content,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    metadata: {
      featureRequestId: `pm-${pm.pmName.replace(/\s+/g, "-").toLowerCase()}`,
      featureRequestTitle: `PM portfolio for ${pm.pmName}`,
      generatedAt: now,
      generatedBy: "Product Control Tower",
      pmOwner: pm.pmName
    }
  };
}

function buildInitialNotesForm(pm: PmPortfolioSummary): PeopleNotesFormState {
  return {
    lastOneOnOneDate: pm.peopleRecord.record?.lastOneOnOneDate ?? "",
    nextOneOnOneDate: pm.peopleRecord.record?.nextOneOnOneDate ?? "",
    coachingFocus: pm.peopleRecord.record?.coachingFocus.join(", ") ?? "",
    privateNotes: pm.peopleRecord.record?.privateNotes ?? "",
    lastUpdatedBy: pm.peopleRecord.record?.lastUpdatedBy ?? ""
  };
}

export default function PeoplePage() {
  const [data, setData] = useState<PeopleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingArtifact, setViewingArtifact] = useState<Artifact | null>(null);
  const [savingPmName, setSavingPmName] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [drafting, setDrafting] = useState<{ pmName: string; draftType: "one_on_one_prep" | "idp_feedback" } | null>(null);
  const [formsByPm, setFormsByPm] = useState<Record<string, PeopleNotesFormState>>({});

  async function loadPeopleData() {
    const response = await fetch("/api/control-tower/people", { cache: "no-store" });
    const payload = (await response.json()) as PeopleResponse | { success: false; error?: string; details?: string };

    if (!response.ok || !payload.success) {
      throw new Error("details" in payload && payload.details ? payload.details : "Failed to load people workspace.");
    }

    setData(payload);
    setFormsByPm((current) => {
      const next = { ...current };
      for (const pm of payload.pmPortfolios) {
        next[pm.pmName] = buildInitialNotesForm(pm);
      }
      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        await loadPeopleData();
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load people workspace.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const portfolios = data?.pmPortfolios ?? [];
  const diagnostics = data?.diagnostics ?? [];

  const summaryCards = useMemo(() => {
    const totalPMs = data?.summary.totalPMs ?? 0;
    const totalNeedingAttention = data?.summary.totalNeedingAttention ?? 0;
    const upToDate = Math.max(totalPMs - totalNeedingAttention, 0);

    return [
      {
        label: "PMs Tracked",
        value: totalPMs,
        tone: "bg-white text-slate-900 border border-slate-200"
      },
      {
        label: "Need Attention",
        value: totalNeedingAttention,
        tone: "bg-rose-50 text-rose-700 border border-rose-200"
      },
      {
        label: "Lower Attention",
        value: upToDate,
        tone: "bg-emerald-50 text-emerald-700 border border-emerald-200"
      }
    ];
  }, [data]);

  const updateForm = (pmName: string, patch: Partial<PeopleNotesFormState>) => {
    setFormsByPm((current) => ({
      ...current,
      [pmName]: {
        ...(current[pmName] ?? {
          lastOneOnOneDate: "",
          nextOneOnOneDate: "",
          coachingFocus: "",
          privateNotes: "",
          lastUpdatedBy: ""
        }),
        ...patch
      }
    }));
  };

  const handleSaveNotes = async (pmName: string) => {
    const form = formsByPm[pmName];
    if (!form) {
      return;
    }

    setSavingPmName(pmName);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const response = await fetch("/api/control-tower/people/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pmName,
          lastOneOnOneDate: form.lastOneOnOneDate || undefined,
          nextOneOnOneDate: form.nextOneOnOneDate || undefined,
          coachingFocus: form.coachingFocus
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean),
          privateNotes: form.privateNotes,
          lastUpdatedBy: form.lastUpdatedBy
        })
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        const errorMessage = payload?.error?.message ?? "Failed to save PM notes.";
        throw new Error(errorMessage);
      }

      await loadPeopleData();
      setSaveMessage("Saved notes and refreshed the latest PM workspace state.");
    } catch (mutationError) {
      setSaveError(mutationError instanceof Error ? mutationError.message : "Failed to save PM notes.");
    } finally {
      setSavingPmName(null);
    }
  };

  const handleGenerateDraft = async (pmName: string, draftType: "one_on_one_prep" | "idp_feedback") => {
    setDrafting({ pmName, draftType });
    setDraftError(null);

    try {
      const response = await fetch("/api/control-tower/people/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pmName,
          draftType
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok || !payload?.data?.artifact) {
        const errorMessage = payload?.error?.message ?? "Failed to generate people draft.";
        throw new Error(errorMessage);
      }

      setViewingArtifact(payload.data.artifact as Artifact);
    } catch (generationError) {
      setDraftError(generationError instanceof Error ? generationError.message : "Failed to generate people draft.");
    } finally {
      setDrafting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-3 rounded-[28px] border border-stone-200 bg-white/90 p-8 shadow-[0_20px_60px_rgba(56,44,24,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-stone-500">People Management</p>
              <h1 className="mt-2 font-serif text-4xl text-stone-900">PM coaching, 1:1 readiness, and portfolio evidence</h1>
            </div>
            {data?.summary.generatedAt && (
              <div className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-600">
                Updated {formatGeneratedAt(data.summary.generatedAt)}
              </div>
            )}
          </div>
          <p className="max-w-3xl text-sm leading-6 text-stone-600">
            This workspace is now driven by live synthesized portfolio context. It surfaces who needs attention, why they need it,
            and what the current evidence says before you start a 1:1 or draft development feedback.
          </p>
        </div>

        {saveMessage && (
          <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800 shadow-sm">
            {saveMessage}
          </div>
        )}

        {saveError && (
          <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700 shadow-sm">
            {saveError}
          </div>
        )}

        {draftError && (
          <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700 shadow-sm">
            {draftError}
          </div>
        )}

        {loading ? (
          <div className="rounded-[24px] border border-stone-200 bg-white p-8 text-sm text-stone-600 shadow-sm">
            Loading people workspace…
          </div>
        ) : error ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm">
            Failed to load people workspace: {error}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {summaryCards.map((card) => (
                <div key={card.label} className={`rounded-[24px] p-6 shadow-sm ${card.tone}`}>
                  <div className="text-xs uppercase tracking-[0.24em] opacity-70">{card.label}</div>
                  <div className="mt-3 text-4xl font-semibold">{card.value}</div>
                </div>
              ))}
            </div>

            {diagnostics.length > 0 && (
              <div className="rounded-[24px] border border-amber-200 bg-amber-50/70 p-6 shadow-sm">
                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">Diagnostics</div>
                <div className="space-y-2 text-sm text-amber-900">
                  {diagnostics.map((diagnostic, index) => (
                    <div key={`${diagnostic.code}-${index}`} className="rounded-2xl border border-amber-200 bg-white/70 px-4 py-3">
                      <div className="font-medium">{diagnostic.code}</div>
                      <div className="mt-1 text-amber-800">{diagnostic.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {portfolios.length === 0 ? (
              <div className="rounded-[24px] border border-stone-200 bg-white p-8 text-sm text-stone-600 shadow-sm">
                {data?.summary.message ?? "No PM portfolio data available yet."}
              </div>
            ) : (
              <div className="space-y-5">
                {portfolios.map((pm) => {
                  const form = formsByPm[pm.pmName] ?? buildInitialNotesForm(pm);

                  return (
                    <section
                      key={pm.pmName}
                      className={`rounded-[28px] border p-6 shadow-[0_16px_40px_rgba(56,44,24,0.08)] ${ATTENTION_PANEL_STYLES[pm.attention.level]}`}
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-4 xl:w-[58%]">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl font-semibold text-stone-900">{pm.pmName}</h2>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${ATTENTION_STYLES[pm.attention.level]}`}>
                              {pm.attention.level} attention
                            </span>
                            <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs font-medium text-stone-600">
                              {pm.featureRequestCount} feature request{pm.featureRequestCount === 1 ? "" : "s"}
                            </span>
                          </div>

                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                              <div className="text-xs uppercase tracking-[0.18em] text-stone-500">1:1 status</div>
                              <div className="mt-2 text-sm font-semibold text-stone-900">
                                {pm.oneOnOne.status === "missing_history"
                                  ? "Missing history"
                                  : pm.oneOnOne.overdue
                                    ? `Overdue by ${pm.oneOnOne.daysSinceLastOneOnOne} days`
                                    : "Up to date"}
                              </div>
                              <p className="mt-2 text-sm text-stone-600">
                                {pm.oneOnOne.status === "missing_history"
                                  ? "No persisted 1:1 history has been captured yet for this PM."
                                  : "1:1 timing is being tracked from persisted history."}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                              <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Evidence mix</div>
                              <div className="mt-2 text-sm font-semibold text-stone-900">
                                {pm.evidenceSummary.totalEvidence} evidence point{pm.evidenceSummary.totalEvidence === 1 ? "" : "s"}
                              </div>
                              <p className="mt-2 text-sm text-stone-600">
                                {pm.evidenceSummary.positiveCount} positive · {pm.evidenceSummary.developmentalCount} developmental
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                              <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Action hooks</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <button
                                  onClick={() => void handleGenerateDraft(pm.pmName, "one_on_one_prep")}
                                  disabled={drafting?.pmName === pm.pmName && drafting.draftType === "one_on_one_prep"}
                                  className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {drafting?.pmName === pm.pmName && drafting.draftType === "one_on_one_prep" ? "Generating..." : "1:1 Prep"}
                                </button>
                                <button
                                  onClick={() => void handleGenerateDraft(pm.pmName, "idp_feedback")}
                                  disabled={drafting?.pmName === pm.pmName && drafting.draftType === "idp_feedback"}
                                  className="rounded-full bg-teal-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {drafting?.pmName === pm.pmName && drafting.draftType === "idp_feedback" ? "Generating..." : "Draft IDP"}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Why this PM needs attention</div>
                            <ul className="mt-3 space-y-2 text-sm text-stone-700">
                              {pm.attention.reasons.map((reason) => (
                                <li key={reason} className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-[24px] border border-stone-200 bg-white/85 p-5">
                            <div className="mb-4 text-xs uppercase tracking-[0.2em] text-stone-500">Live portfolio context</div>
                            <div className="space-y-3">
                              {pm.portfolio.map((featureRequest) => (
                                <div key={featureRequest.id} className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="text-sm font-semibold text-stone-900">{featureRequest.title}</div>
                                    <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-600">
                                      {featureRequest.stage.replace(/_/g, " ")}
                                    </span>
                                    <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-600">
                                      {featureRequest.readiness.verdict.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                  <div className="mt-2 text-sm text-stone-600">{featureRequest.latestUpdate.summary}</div>
                                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600">
                                    {featureRequest.interventionReasons.map((reason) => (
                                      <span key={`${featureRequest.id}-${reason.type}`} className="rounded-full bg-white px-3 py-1 border border-stone-200">
                                        {reason.message}
                                      </span>
                                    ))}
                                    {featureRequest.review.record && (
                                      <span className="rounded-full bg-white px-3 py-1 border border-stone-200">
                                        Review: {featureRequest.review.record.decisionSummary}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="xl:w-[38%] rounded-[24px] border border-stone-200 bg-white/90 p-5 shadow-sm">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Private people state</div>
                              <div className="mt-1 text-sm font-semibold text-stone-900">
                                {pm.peopleRecord.present ? "Persisted coaching notes available" : "No persisted notes yet"}
                              </div>
                            </div>
                            {pm.peopleRecord.record?.updatedAt && (
                              <div className="text-xs text-stone-500">Updated {formatGeneratedAt(pm.peopleRecord.record.updatedAt)}</div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500" htmlFor={`last-1on1-${pm.pmName}`}>
                                Last 1:1 date for {pm.pmName}
                              </label>
                              <input
                                id={`last-1on1-${pm.pmName}`}
                                type="date"
                                value={form.lastOneOnOneDate}
                                onChange={(event) => updateForm(pm.pmName, { lastOneOnOneDate: event.target.value })}
                                className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:bg-white"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500" htmlFor={`next-1on1-${pm.pmName}`}>
                                Next 1:1 date for {pm.pmName}
                              </label>
                              <input
                                id={`next-1on1-${pm.pmName}`}
                                type="date"
                                value={form.nextOneOnOneDate}
                                onChange={(event) => updateForm(pm.pmName, { nextOneOnOneDate: event.target.value })}
                                className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:bg-white"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500" htmlFor={`coaching-focus-${pm.pmName}`}>
                                Coaching focus for {pm.pmName}
                              </label>
                              <input
                                id={`coaching-focus-${pm.pmName}`}
                                type="text"
                                value={form.coachingFocus}
                                onChange={(event) => updateForm(pm.pmName, { coachingFocus: event.target.value })}
                                placeholder="Comma-separated coaching themes"
                                className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:bg-white"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500" htmlFor={`private-notes-${pm.pmName}`}>
                                Private notes for {pm.pmName}
                              </label>
                              <textarea
                                id={`private-notes-${pm.pmName}`}
                                value={form.privateNotes}
                                onChange={(event) => updateForm(pm.pmName, { privateNotes: event.target.value })}
                                rows={6}
                                className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:bg-white"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500" htmlFor={`updated-by-${pm.pmName}`}>
                                Updated by for {pm.pmName}
                              </label>
                              <input
                                id={`updated-by-${pm.pmName}`}
                                type="text"
                                value={form.lastUpdatedBy}
                                onChange={(event) => updateForm(pm.pmName, { lastUpdatedBy: event.target.value })}
                                className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:bg-white"
                              />
                            </div>

                            <button
                              onClick={() => void handleSaveNotes(pm.pmName)}
                              disabled={savingPmName === pm.pmName}
                              className="w-full rounded-full bg-stone-900 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {savingPmName === pm.pmName ? "Saving…" : `Save notes for ${pm.pmName}`}
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {viewingArtifact && (
        <ArtifactViewer artifact={viewingArtifact} onClose={() => setViewingArtifact(null)} />
      )}
    </div>
  );
}
