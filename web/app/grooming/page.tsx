/**
 * Grooming Dashboard Page
 *
 * Prepares for biweekly engineering grooming sessions.
 * Shows ready vs. blocked items with export capabilities.
 */

"use client";

import { useEffect, useState } from "react";
import type { GroomingSummary } from "@/lib/control-tower/grooming-engine";
import { exportGroomingChecklistToMarkdown, exportGroomingChecklistToCSV } from "@/lib/control-tower/grooming-engine";

export default function GroomingPage() {
  const [summary, setSummary] = useState<GroomingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPm, setSelectedPm] = useState<string>("all");
  const [selectedCharter, setSelectedCharter] = useState<string>("all");

  useEffect(() => {
    fetchGroomingSummary();
  }, []);

  const fetchGroomingSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/control-tower/grooming");
      if (!response.ok) throw new Error("Failed to fetch grooming summary");
      const data = await response.json();
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
    const a = document.createElement("a");
    a.href = url;
    a.download = `grooming-checklist-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!summary) return;
    const csv = exportGroomingChecklistToCSV(summary);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grooming-checklist-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-600 mx-auto"></div>
          <p className="mt-4 text-warm-700">Loading grooming readiness...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <p className="text-warm-700">Failed to load grooming data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-warm-900 mb-2">Engineering Grooming Prep</h1>
          <p className="text-warm-600">Biweekly grooming session readiness dashboard</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Items</div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalFeatureRequests}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-green-600 mb-1">Ready</div>
            <div className="text-3xl font-bold text-green-700">{summary.readyCount}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-red-600 mb-1">Blocked</div>
            <div className="text-3xl font-bold text-red-700">{summary.blockedCount}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-blue-600 mb-1">Estimate Coverage</div>
            <div className="text-3xl font-bold text-blue-700">{summary.estimateCoverage}%</div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={handleExportMarkdown}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Export Markdown
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Export CSV
          </button>
          <button
            onClick={fetchGroomingSummary}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PM Owner</label>
            <select
              value={selectedPm}
              onChange={(e) => setSelectedPm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All PMs</option>
              {Object.keys(summary.byPmOwner).map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Charter</label>
            <select
              value={selectedCharter}
              onChange={(e) => setSelectedCharter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Charters</option>
              {Object.keys(summary.byCharter).map((charter) => (
                <option key={charter} value={charter}>
                  {charter}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Readiness Categories */}
        <div className="space-y-6">
          {/* Ready */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-green-700">
                ✅ Ready for Grooming ({summary.readiness.ready.length})
              </h2>
            </div>
            <div className="p-6">
              {summary.readiness.ready.length === 0 ? (
                <p className="text-gray-500 italic">No items ready for grooming</p>
              ) : (
                <div className="space-y-4">
                  {summary.readiness.ready.map((fr) => (
                    <div key={fr.id} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{fr.title}</h3>
                      <p className="text-sm text-gray-600">
                        {fr.pmOwner || "Unassigned"} • {fr.productCharter || "No Charter"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Jira: {fr.jiraIssues.map((i) => i.key).join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Needs Clarity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-yellow-700">
                ⚠️ Needs Clarity ({summary.readiness.needsClarity.length})
              </h2>
            </div>
            <div className="p-6">
              {summary.readiness.needsClarity.length === 0 ? (
                <p className="text-gray-500 italic">None</p>
              ) : (
                <div className="space-y-4">
                  {summary.readiness.needsClarity.map((fr) => (
                    <div key={fr.id} className="border-l-4 border-yellow-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{fr.title}</h3>
                      <p className="text-sm text-gray-600">
                        {fr.pmOwner || "Unassigned"} • Missing PRD
                      </p>
                      <p className="text-xs text-red-600">Action: PM to draft PRD</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Blocked */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-red-700">
                🚫 Blocked ({summary.readiness.blocked.length})
              </h2>
            </div>
            <div className="p-6">
              {summary.readiness.blocked.length === 0 ? (
                <p className="text-gray-500 italic">None</p>
              ) : (
                <div className="space-y-4">
                  {summary.readiness.blocked.map((fr) => (
                    <div key={fr.id} className="border-l-4 border-red-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{fr.title}</h3>
                      <p className="text-sm text-gray-600">{fr.pmOwner || "Unassigned"}</p>
                      <div className="mt-2">
                        {fr.blockerSummary.blockers.map((blocker, idx) => (
                          <p key={idx} className="text-xs text-red-600">
                            • {blocker.description} ({blocker.daysOpen} days)
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
