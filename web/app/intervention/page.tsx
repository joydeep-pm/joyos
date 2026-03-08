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
      const response = await fetch("/api/control-tower/feature-requests/sync", { method: "POST" });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to sync");
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
