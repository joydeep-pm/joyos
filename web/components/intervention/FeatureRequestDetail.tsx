/**
 * Feature Request Detail Modal Component
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { RiskBadge } from "./RiskBadge";
import { InterventionReasonBadge } from "./InterventionReasonBadge";
import { NotesSection } from "./NotesSection";
import { ArtifactViewer } from "../artifacts/ArtifactViewer";
import type { FeatureRequestWithIntervention } from "@/lib/control-tower/intervention-engine";
import type { Artifact, ArtifactType } from "@/lib/control-tower/artifacts/types";

interface FeatureRequestDetailProps {
  featureRequest: FeatureRequestWithIntervention;
  onClose: () => void;
  onDraftFollowup?: (id: string) => void;
  onRequestClarification?: (id: string) => void;
  onAddNote?: (id: string) => void;
}

export function FeatureRequestDetail({
  featureRequest,
  onClose,
  onDraftFollowup,
  onRequestClarification,
  onAddNote
}: FeatureRequestDetailProps) {
  const fr = featureRequest;
  const [generatedArtifact, setGeneratedArtifact] = useState<Artifact | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const notesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showNotes && notesRef.current) {
      notesRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [showNotes]);

  const handleGenerateArtifact = async (artifactType: ArtifactType, recipientName?: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/control-tower/artifacts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureRequestId: fr.id,
          artifactType,
          recipientName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate artifact");
      }

      const data = await response.json();
      setGeneratedArtifact(data.artifact);
    } catch (error) {
      console.error("Error generating artifact:", error);
      alert(error instanceof Error ? error.message : "Failed to generate artifact");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDraftPRD = () => handleGenerateArtifact("prd");
  const handleDraftUserStory = () => handleGenerateArtifact("user_story");
  const handleDraftFollowUp = () => {
    const pmOwner = fr.pmOwner || "Team";
    handleGenerateArtifact("follow_up", pmOwner);
  };
  const handleDraftClarification = () => {
    const pmOwner = fr.pmOwner || "Team";
    handleGenerateArtifact("clarification_request", pmOwner);
  };
  const handleDraftStatusUpdate = () => handleGenerateArtifact("status_update");

  const stageLabels: Record<string, string> = {
    incoming: "Incoming",
    ba_grooming: "BA Grooming",
    pm_exploration: "PM Exploration",
    director_review: "Director Review",
    engineering_validation: "Engineering Validation",
    prd_drafting: "PRD Drafting",
    estimation: "Estimation",
    prioritized: "Prioritized",
    in_delivery: "In Delivery",
    testing: "Testing",
    client_update: "Client Update",
    uat_deploy: "UAT Deploy",
    prod_deploy: "Production"
  };

  const sourceLabels: Record<string, string> = {
    client_escalation: "Client Escalation",
    pm_ask: "PM Request",
    sales_rfp: "Sales/RFP",
    implementation_gap: "Implementation Gap",
    bug_stability: "Bug/Stability",
    engineering_blocker: "Engineering Blocker",
    leadership_request: "Leadership",
    unknown: "Unknown"
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{fr.title}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <RiskBadge severity={fr.riskSummary.severity} />
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                {sourceLabels[fr.source]}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {stageLabels[fr.stage]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDraftPRD}
                disabled={isGenerating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Draft PRD"}
              </button>
              <button
                onClick={handleDraftUserStory}
                disabled={isGenerating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Draft User Story"}
              </button>
              <button
                onClick={handleDraftFollowUp}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Draft Follow-up"}
              </button>
              <button
                onClick={handleDraftClarification}
                disabled={isGenerating}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Request Clarification"}
              </button>
              <button
                onClick={handleDraftStatusUpdate}
                disabled={isGenerating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Draft Status Update"}
              </button>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`px-4 py-2 ${showNotes ? "bg-gray-700" : "bg-gray-600"} text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium`}
              >
                {showNotes ? "Hide Notes" : "Director Notes"}
              </button>
            </div>
          </div>

          {/* Intervention Reasons */}
          {fr.interventionReasons.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Intervention Required</h3>
              <div className="flex flex-wrap gap-2">
                {fr.interventionReasons.map((reason, idx) => (
                  <InterventionReasonBadge key={idx} reason={reason} />
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">PM Owner</h3>
              <p className="text-gray-700">{fr.pmOwner || "Unassigned"}</p>
            </div>
            {fr.client && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Client</h3>
                <p className="text-gray-700">{fr.client}</p>
              </div>
            )}
            {fr.productCharter && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Product Charter</h3>
                <p className="text-gray-700">{fr.productCharter}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Created</h3>
              <p className="text-gray-700">{new Date(fr.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Last Updated</h3>
              <p className="text-gray-700">{new Date(fr.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Risk Summary */}
          {fr.riskSummary.factors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Risk Factors</h3>
              <ul className="space-y-2">
                {fr.riskSummary.factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Blockers */}
          {fr.blockerSummary.hasBlockers && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Blockers</h3>
              <div className="space-y-3">
                {fr.blockerSummary.blockers.map((blocker, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                        {blocker.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-xs text-red-600">{blocker.daysOpen} days open</span>
                    </div>
                    <p className="text-sm text-red-900">{blocker.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jira Issues */}
          {fr.jiraIssues.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Linked Jira Issues</h3>
              <div className="space-y-2">
                {fr.jiraIssues.map((issue) => (
                  <div key={issue.key} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-medium text-blue-700">{issue.key}</span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        {issue.status}
                      </span>
                    </div>
                    {issue.assignee && (
                      <p className="text-xs text-blue-900">Assignee: {issue.assignee}</p>
                    )}
                    <p className="text-xs text-blue-700 mt-1">
                      Last updated: {new Date(issue.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confluence Pages */}
          {fr.confluencePages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Linked Confluence Pages</h3>
              <div className="space-y-2">
                {fr.confluencePages.map((page) => (
                  <div key={page.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-purple-700 hover:underline"
                    >
                      {page.title}
                    </a>
                    <p className="text-xs text-purple-700 mt-1">
                      Last modified: {new Date(page.lastModified).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Notes */}
          {fr.localNotes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Local Notes</h3>
              <div className="space-y-2">
                {fr.localNotes.map((note, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700">{note.path}</p>
                    <p className="text-sm text-gray-600 mt-1">{note.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Director Notes Section */}
          {showNotes && (
            <div ref={notesRef}>
              <NotesSection featureRequestId={fr.id} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Artifact Viewer Modal */}
      {generatedArtifact && (
        <ArtifactViewer
          artifact={generatedArtifact}
          onClose={() => setGeneratedArtifact(null)}
          onEdit={(editedContent) => {
            setGeneratedArtifact({
              ...generatedArtifact,
              content: editedContent,
              updatedAt: new Date().toISOString()
            });
          }}
        />
      )}
    </div>
  );
}
