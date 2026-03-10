/**
 * Intervention Brief Page
 *
 * Director's daily morning view of where intervention is needed.
 */

"use client";

import { useEffect, useState } from "react";
import { PmOwnerGroup } from "@/components/intervention/PmOwnerGroup";
import { FeatureRequestDetail } from "@/components/intervention/FeatureRequestDetail";
import type { InterventionBrief, FeatureRequestWithIntervention } from "@/lib/control-tower/intervention-engine";

export default function InterventionPage() {
  const [brief, setBrief] = useState<InterventionBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeatureRequest, setSelectedFeatureRequest] = useState<FeatureRequestWithIntervention | null>(null);
  const [epicFilter, setEpicFilter] = useState("");
  const [showEpicFilter, setShowEpicFilter] = useState(false);

  useEffect(() => {
    fetchBrief();
  }, []);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load intervention brief");
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

  function handleDraftFollowup(id: string) {
    alert(`Draft follow-up for ${id} - Coming in next task`);
  }

  function handleRequestClarification(id: string) {
    alert(`Request clarification for ${id} - Coming in next task`);
  }

  function handleAddNote(id: string) {
    alert(`Add director note for ${id} - Coming in next task`);
  }

  async function handleSync() {
    try {
      setLoading(true);
      setError(null);

      const epicKeys = epicFilter
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const response = await fetch("/api/control-tower/feature-requests/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(epicKeys.length > 0 ? { epicKeys } : {})
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
                  epicFilter
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                }`}
                title="Filter sync by epic keys"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Epics
                {epicFilter && <span className="w-2 h-2 rounded-full bg-blue-500" />}
              </button>
              <button
                onClick={handleSync}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Sync Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Epic Filter Panel */}
      {showEpicFilter && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-8 py-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-blue-800 whitespace-nowrap">
                Filter by Epics:
              </label>
              <input
                type="text"
                value={epicFilter}
                onChange={(e) => setEpicFilter(e.target.value)}
                placeholder="e.g. CSO-123, LEN-456"
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
                Comma-separated epic keys. Leave empty to sync all.
              </span>
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
        />
      )}
    </div>
  );
}
