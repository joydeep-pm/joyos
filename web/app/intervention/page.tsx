/**
 * Intervention Brief Page
 *
 * Director's daily morning view of where intervention is needed.
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PmOwnerGroup } from "@/components/intervention/PmOwnerGroup";
import { FeatureRequestDetail } from "@/components/intervention/FeatureRequestDetail";
import { StatusUpdateModal } from "@/components/intervention/StatusUpdateModal";
import type { InterventionBrief, FeatureRequestWithIntervention } from "@/lib/control-tower/intervention-engine";
import type { RealStatusEntry, RealStatusValue } from "@/lib/control-tower/real-status";

const DEFAULT_LEN_SYNC_JQL = `project = LEN
AND status NOT IN ("Merged to Codebase", Done, Closed, Resolved, Completed)
AND issuetype != Bug
AND issuetype not in subTaskIssueTypes()
AND "Epic Link" in (
  LEN-64,
  LEN-69,
  LEN-76,
  LEN-85,
  LEN-86,
  LEN-87,
  LEN-91,
  LEN-110,
  LEN-113,
  LEN-115,
  LEN-146,
  LEN-150,
  LEN-474,
  LEN-478,
  LEN-1027,
  LEN-1523,
  LEN-1525,
  LEN-1529,
  LEN-1723,
  LEN-1724,
  LEN-1725,
  LEN-1727,
  LEN-2115,
  LEN-2395,
  LEN-2903,
  LEN-3733,
  LEN-3794,
  LEN-3806
)
ORDER BY updated DESC`;

export default function InterventionPage() {
  const [brief, setBrief] = useState<InterventionBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeatureRequest, setSelectedFeatureRequest] = useState<FeatureRequestWithIntervention | null>(null);
  const [epicFilter, setEpicFilter] = useState("");
  const [jqlFilter, setJqlFilter] = useState(DEFAULT_LEN_SYNC_JQL);
  const [showEpicFilter, setShowEpicFilter] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true); // noise filter
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [realStatuses, setRealStatuses] = useState<Record<string, RealStatusEntry>>({});

  // Load real status overrides from server
  const loadRealStatuses = useCallback(async () => {
    try {
      const res = await fetch("/api/control-tower/real-status");
      const data = await res.json();
      if (data.success) setRealStatuses(data.statuses ?? {});
    } catch { /* non-fatal */ }
  }, []);

  function handleRealStatusSaved(id: string, status: RealStatusValue, note: string) {
    setRealStatuses((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), featureRequestId: id, status, note, reviewedToday: true, reviewedTodayAt: new Date().toISOString(), jiraKeys: [], setAt: new Date().toISOString(), setBy: "director" },
    }));
  }

  useEffect(() => {
    const savedEpicFilter = typeof window !== "undefined" ? window.localStorage.getItem("intervention-sync-epic-filter") : null;
    const savedJqlFilter = typeof window !== "undefined" ? window.localStorage.getItem("intervention-sync-jql-filter") : null;

    if (savedEpicFilter) {
      setEpicFilter(savedEpicFilter);
    }

    if (savedJqlFilter && savedJqlFilter.trim()) {
      setJqlFilter(savedJqlFilter);
    }

    fetchBrief();
    loadRealStatuses();
  }, [loadRealStatuses]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("intervention-sync-epic-filter", epicFilter);
  }, [epicFilter]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("intervention-sync-jql-filter", jqlFilter);
  }, [jqlFilter]);

  async function fetchBrief() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/control-tower/intervention");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch intervention brief");
      }

      setBrief(data.brief);
      return data.brief as InterventionBrief;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load intervention brief");
      return null;
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDetail(id: string) {
    // Find the feature request across all PM groups
    for (const group of brief?.pmGroups ?? []) {
      const fr = group.featureRequests.find((f) => f.id === id);
      if (fr) {
        setSelectedFeatureRequest(fr);
        return;
      }
    }
  }

  function handleDraftFollowup(_id: string) {}

  function handleRequestClarification(_id: string) {}

  function handleAddNote(_id: string) {}

  async function handleReviewSaved(featureRequestId: string) {
    const refreshedBrief = await fetchBrief();

    if (!refreshedBrief) {
      return;
    }

    for (const group of refreshedBrief.pmGroups ?? []) {
      const refreshedFeatureRequest = group.featureRequests.find((featureRequest) => featureRequest.id === featureRequestId);
      if (refreshedFeatureRequest) {
        setSelectedFeatureRequest(refreshedFeatureRequest);
        return;
      }
    }
  }

  async function handleSync() {
    try {
      setLoading(true);
      setError(null);

      const epicKeys = epicFilter
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload: { epicKeys?: string[]; jql?: string } = {};
      if (epicKeys.length > 0) {
        payload.epicKeys = epicKeys;
      }
      if (jqlFilter.trim()) {
        payload.jql = jqlFilter.trim();
      }

      const response = await fetch("/api/control-tower/feature-requests/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || data.details || "Failed to sync");
      }

      // Refresh brief after sync
      await fetchBrief();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="section-shell panel-muted">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="mb-4 h-8 w-1/4 rounded bg-bone"></div>
            <div className="mb-8 h-4 w-1/2 rounded bg-bone"></div>
            <div className="space-y-4">
              <div className="h-32 rounded bg-bone"></div>
              <div className="h-32 rounded bg-bone"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-shell panel-muted">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-oxblood/20 bg-oxblood/10 p-4">
            <h2 className="mb-2 font-semibold text-oxblood">Error</h2>
            <p className="text-oxblood">{error}</p>
            <button
              onClick={fetchBrief}
              className="danger-button mt-4"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!brief) {
    return null;
  }

  // Daily review progress
  const allFRs = brief.pmGroups.flatMap((g) => g.featureRequests);
  const reviewedCount = allFRs.filter((fr) => realStatuses[fr.id]?.reviewedToday).length;
  const totalCount = allFRs.length;

  // Active-only filter: hide items with no real status and Jira stage = done/backlog candidates
  const filteredGroups = activeOnly
    ? {
        ...brief,
        pmGroups: brief.pmGroups
          .map((g) => ({
            ...g,
            featureRequests: g.featureRequests.filter((fr) => {
              // Keep if has real status (director has touched it) OR stage is not done
              const rs = realStatuses[fr.id];
              if (rs?.status === "deprioritized") return false;
              return true;
            }),
          }))
          .filter((g) => g.featureRequests.length > 0),
      }
    : brief;
  return (
    <div className="space-y-6">
      <div className="panel-surface section-shell">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="eyebrow-label">Director intervention desk</p>
            <h1 className="section-title mt-3">Intervention Brief</h1>
            <p className="mt-3 text-sm text-ink/65">
              {new Date(brief.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-sm">
                <span className={`font-semibold ${reviewedCount === totalCount && totalCount > 0 ? "text-moss" : "text-ink/80"}`}>
                  {reviewedCount}/{totalCount}
                </span>
                <span className="text-slate">reviewed</span>
                {reviewedCount === totalCount && totalCount > 0 && (
                  <span className="text-xs text-moss">✓ done</span>
                )}
              </div>

              <button
                onClick={() => setActiveOnly(!activeOnly)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeOnly
                    ? "border-petrol/20 bg-petrol/10 text-petrol"
                    : "border-ink/10 bg-paper text-slate hover:bg-bone"
                }`}
                title={activeOnly ? "Showing active items only — click to show all" : "Showing all items — click to hide deprioritized"}
              >
                {activeOnly ? "Active only" : "All items"}
              </button>

              <button
                onClick={() => setShowStatusModal(true)}
                className="ghost-button flex items-center gap-1.5"
                title="Generate a Teams-ready status update for any vertical"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Status
              </button>

              <button
                onClick={() => setShowEpicFilter(!showEpicFilter)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  epicFilter || jqlFilter
                    ? "border-petrol/20 bg-petrol/10 text-petrol"
                    : "border-ink/10 bg-paper text-slate hover:bg-bone"
                }`}
                title="Filter sync by epic keys or custom JQL"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                <span className="rounded-full border border-petrol/20 bg-petrol/10 px-2 py-0.5 text-[10px] font-semibold text-petrol">
                  advanced
                </span>
                {(epicFilter || jqlFilter) && <span className="h-2 w-2 rounded-full bg-petrol" />}
              </button>
              <button
                onClick={handleSync}
                className="primary-button flex items-center gap-2"
                title="Sync using the saved/default LEN filter"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Sync LEN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Filter Panel */}
      {showEpicFilter && (
        <div className="panel-muted section-shell space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-petrol whitespace-nowrap">
                Filter by Epics:
              </label>
              <input
                type="text"
                value={epicFilter}
                onChange={(e) => setEpicFilter(e.target.value)}
                placeholder="e.g. LEN-69, LEN-76"
                className="paper-input flex-1 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-petrol/30"
              />
              {epicFilter && (
                <button
                  onClick={() => setEpicFilter("")}
                  className="text-sm text-petrol hover:text-ink"
                >
                  Clear
                </button>
              )}
              <span className="text-xs text-slate">
                Comma-separated epic keys. Optional.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <label className="text-sm font-medium text-petrol whitespace-nowrap pt-2">
                Custom JQL:
              </label>
              <textarea
                value={jqlFilter}
                onChange={(e) => setJqlFilter(e.target.value)}
                placeholder={'e.g. project = LEN AND status NOT IN ("Merged to Codebase", Done, Closed, Resolved, Completed) AND issuetype != Bug AND issuetype not in subTaskIssueTypes()'}
                rows={3}
                className="paper-input flex-1 rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-petrol/30"
              />
              {jqlFilter && (
                <button
                  onClick={() => setJqlFilter("")}
                  className="pt-2 text-sm text-petrol hover:text-ink"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-ink/10 bg-paper/80 p-3 text-xs text-ink/75 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-ink">Default LEN sync query</p>
                <button
                  type="button"
                  onClick={() => setJqlFilter(DEFAULT_LEN_SYNC_JQL)}
                  className="ghost-button rounded-xl px-2 py-1 text-[11px]"
                >
                  Use default
                </button>
              </div>
              <pre className="whitespace-pre-wrap break-words rounded bg-slate-950/90 p-3 text-[11px] leading-relaxed text-slate-100 overflow-x-auto">{DEFAULT_LEN_SYNC_JQL}</pre>
              <p>
                This query is loaded by default and used automatically when you click Sync Now. Custom JQL overrides the default Jira sync query. If both are provided, JQL takes precedence over board/project sync scope.
              </p>
            </div>
        </div>
      )}

      {/* Summary */}
      <div className="space-y-6">
        <div className="panel-muted section-shell">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow-label">Signal summary</p>
              <h2 className="font-display mt-3 text-[2rem] leading-none text-ink">Where intervention matters now.</h2>
              <p className="mt-3 text-ink/75">{brief.summary}</p>
            </div>
            <div className="flex gap-4">
              <div className="metric-card text-center">
                <div className="text-2xl font-bold text-ink">{brief.totalFeatureRequests}</div>
                <div className="text-xs text-slate">Total Requests</div>
              </div>
              <div className="metric-card text-center">
                <div className="text-2xl font-bold text-oxblood">{brief.totalRequiringIntervention}</div>
                <div className="text-xs text-slate">Need Intervention</div>
              </div>
              <div className="metric-card text-center">
                <div className="text-2xl font-bold text-petrol">{brief.pmGroups.length}</div>
                <div className="text-xs text-slate">PM Owners</div>
              </div>
            </div>
          </div>
        </div>

        {/* PM Groups */}
        {filteredGroups.pmGroups.length === 0 ? (
          <div className="panel-muted section-shell text-center">
            <p className="text-slate">
              {activeOnly
                ? "No active items — all have been deprioritized or none remain. Toggle \"Active only\" to see everything."
                : "No feature requests found. Click \"Sync LEN\" to fetch data from Jira."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.pmGroups.map((group) => (
              <PmOwnerGroup
                key={group.pmOwner}
                group={group}
                onOpenDetail={handleOpenDetail}
                realStatuses={realStatuses}
                onRealStatusSaved={handleRealStatusSaved}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal open={showStatusModal} onClose={() => setShowStatusModal(false)} />

      {/* Feature Request Detail Modal */}
      {selectedFeatureRequest && (
        <FeatureRequestDetail
          featureRequest={selectedFeatureRequest}
          onClose={() => setSelectedFeatureRequest(null)}
          onDraftFollowup={handleDraftFollowup}
          onRequestClarification={handleRequestClarification}
          onAddNote={handleAddNote}
          onReviewSaved={handleReviewSaved}
        />
      )}
    </div>
  );
}
