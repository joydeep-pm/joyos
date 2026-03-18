/**
 * Intervention Brief Page
 *
 * Director's daily morning view of where intervention is needed.
 */

"use client";

import React, { useEffect, useState } from "react";
import { PmOwnerGroup } from "@/components/intervention/PmOwnerGroup";
import { FeatureRequestDetail } from "@/components/intervention/FeatureRequestDetail";
import type { InterventionBrief, FeatureRequestWithIntervention } from "@/lib/control-tower/intervention-engine";

const DEFAULT_LEN_SYNC_JQL = `project = LEN
AND status NOT IN ("Merged to Codebase", Done, Closed, Resolved, Completed)
AND issuetype != Bug
AND issuetype not in subTaskIssueTypes()
ORDER BY updated DESC`;

export default function InterventionPage() {
  const [brief, setBrief] = useState<InterventionBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeatureRequest, setSelectedFeatureRequest] = useState<FeatureRequestWithIntervention | null>(null);
  const [epicFilter, setEpicFilter] = useState("");
  const [jqlFilter, setJqlFilter] = useState(DEFAULT_LEN_SYNC_JQL);
  const [showEpicFilter, setShowEpicFilter] = useState(false);

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
  }, []);

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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchBrief}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Intervention Brief</h1>
              <p className="text-gray-600">
                {new Date(brief.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEpicFilter(!showEpicFilter)}
                className={`px-3 py-2 border rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
                  epicFilter || jqlFilter
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                }`}
                title="Filter sync by epic keys or custom JQL"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                  advanced
                </span>
                {(epicFilter || jqlFilter) && <span className="w-2 h-2 rounded-full bg-blue-500" />}
              </button>
              <button
                onClick={handleSync}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-8 py-3 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-blue-800 whitespace-nowrap">
                Filter by Epics:
              </label>
              <input
                type="text"
                value={epicFilter}
                onChange={(e) => setEpicFilter(e.target.value)}
                placeholder="e.g. LEN-69, LEN-76"
                className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {epicFilter && (
                <button
                  onClick={() => setEpicFilter("")}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
              <span className="text-xs text-blue-600">
                Comma-separated epic keys. Optional.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <label className="text-sm font-medium text-blue-800 whitespace-nowrap pt-2">
                Custom JQL:
              </label>
              <textarea
                value={jqlFilter}
                onChange={(e) => setJqlFilter(e.target.value)}
                placeholder={'e.g. project = LEN AND status NOT IN ("Merged to Codebase", Done, Closed, Resolved, Completed) AND issuetype != Bug AND issuetype not in subTaskIssueTypes()'}
                rows={3}
                className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              />
              {jqlFilter && (
                <button
                  onClick={() => setJqlFilter("")}
                  className="text-sm text-blue-600 hover:text-blue-800 pt-2"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="rounded-md border border-blue-200 bg-white/70 p-3 text-xs text-blue-700 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-blue-900">Default LEN sync query</p>
                <button
                  type="button"
                  onClick={() => setJqlFilter(DEFAULT_LEN_SYNC_JQL)}
                  className="rounded border border-blue-300 bg-white px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-50"
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
        </div>
      )}

      {/* Summary */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Summary</h2>
              <p className="text-gray-700">{brief.summary}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{brief.totalFeatureRequests}</div>
                <div className="text-xs text-gray-500">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{brief.totalRequiringIntervention}</div>
                <div className="text-xs text-gray-500">Need Intervention</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{brief.pmGroups.length}</div>
                <div className="text-xs text-gray-500">PM Owners</div>
              </div>
            </div>
          </div>
        </div>

        {/* PM Groups */}
        {brief.pmGroups.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">No feature requests found. Click "Sync Now" to fetch data from Jira and Confluence.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {brief.pmGroups.map((group) => (
              <PmOwnerGroup
                key={group.pmOwner}
                group={group}
                onOpenDetail={handleOpenDetail}
              />
            ))}
          </div>
        )}
      </div>

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
