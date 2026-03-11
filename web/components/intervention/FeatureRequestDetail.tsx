/**
 * Feature Request Detail Modal Component
 */

"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { RiskBadge } from "./RiskBadge";
import { InterventionReasonBadge } from "./InterventionReasonBadge";
import { NotesSection } from "./NotesSection";
import { ArtifactViewer } from "../artifacts/ArtifactViewer";
import { getStageLabel, getStageMetadata } from "@/lib/control-tower/stage-config";
import type { FeatureRequestReviewStatus } from "@/lib/control-tower/types";
import type { FeatureRequestWithIntervention } from "@/lib/control-tower/intervention-engine";
import type { Artifact, ArtifactType } from "@/lib/control-tower/artifacts/types";

interface FeatureRequestDetailProps {
  featureRequest: FeatureRequestWithIntervention;
  onClose: () => void;
  onDraftFollowup?: (id: string) => void;
  onRequestClarification?: (id: string) => void;
  onAddNote?: (id: string) => void;
  onReviewSaved?: (featureRequestId: string) => Promise<void>;
}

const reviewStatusMeta: Record<
  NonNullable<FeatureRequestWithIntervention["review"]["record"]>["reviewStatus"],
  { label: string; classes: string; description: string }
> = {
  approved_for_grooming: {
    label: "Approved for grooming",
    classes: "bg-green-100 text-green-800 border border-green-200",
    description: "Director review cleared the request for the next grooming step."
  },
  needs_follow_up: {
    label: "Needs follow-up",
    classes: "bg-amber-100 text-amber-800 border border-amber-200",
    description: "Open decisions or missing inputs still need an owner and follow-up."
  },
  rejected: {
    label: "Rejected",
    classes: "bg-red-100 text-red-800 border border-red-200",
    description: "Director review rejected the request in its current form."
  }
};

function formatReviewStatus(status?: NonNullable<FeatureRequestWithIntervention["review"]["record"]>["reviewStatus"]) {
  return status ? reviewStatusMeta[status] : null;
}

function formatDateTime(value?: string) {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleString();
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function FeatureRequestDetail({
  featureRequest,
  onClose,
  onDraftFollowup,
  onRequestClarification,
  onAddNote,
  onReviewSaved
}: FeatureRequestDetailProps) {
  const fr = featureRequest;
  const [generatedArtifact, setGeneratedArtifact] = useState<Artifact | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewSaveMessage, setReviewSaveMessage] = useState<string | null>(null);
  const [reviewSaveError, setReviewSaveError] = useState<string | null>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const reviewRecord = fr.review.record;
  const reviewStatusOptions: Array<{ value: FeatureRequestReviewStatus; label: string }> = useMemo(
    () => [
      { value: "approved_for_grooming", label: "Approved for grooming" },
      { value: "needs_follow_up", label: "Needs follow-up" },
      { value: "rejected", label: "Rejected" }
    ],
    []
  );
  const [reviewStatus, setReviewStatus] = useState<FeatureRequestReviewStatus>(
    reviewRecord?.reviewStatus ?? "needs_follow_up"
  );
  const [decisionSummary, setDecisionSummary] = useState(reviewRecord?.decisionSummary ?? "");
  const [decisionRationale, setDecisionRationale] = useState(reviewRecord?.decisionRationale ?? "");
  const [pendingDecisions, setPendingDecisions] = useState((reviewRecord?.pendingDecisions ?? []).join("\n"));
  const [nextActions, setNextActions] = useState((reviewRecord?.nextActions ?? []).join("\n"));
  const [reviewedBy, setReviewedBy] = useState(reviewRecord?.reviewedBy ?? "");
  const reviewMeta = formatReviewStatus(reviewRecord?.reviewStatus);

  useEffect(() => {
    if (showNotes && notesRef.current) {
      notesRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [showNotes]);

  useEffect(() => {
    setReviewStatus(reviewRecord?.reviewStatus ?? "needs_follow_up");
    setDecisionSummary(reviewRecord?.decisionSummary ?? "");
    setDecisionRationale(reviewRecord?.decisionRationale ?? "");
    setPendingDecisions((reviewRecord?.pendingDecisions ?? []).join("\n"));
    setNextActions((reviewRecord?.nextActions ?? []).join("\n"));
    setReviewedBy(reviewRecord?.reviewedBy ?? "");
    setReviewSaveMessage(null);
    setReviewSaveError(null);
  }, [reviewRecord, fr.id]);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.code || "Failed to generate artifact");
      }

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
    onDraftFollowup?.(fr.id);
    const pmOwner = fr.pmOwner || "Team";
    handleGenerateArtifact("follow_up", pmOwner);
  };
  const handleDraftClarification = () => {
    onRequestClarification?.(fr.id);
    const pmOwner = fr.pmOwner || "Team";
    handleGenerateArtifact("clarification_request", pmOwner);
  };
  const handleDraftStatusUpdate = () => handleGenerateArtifact("status_update");

  const handleSaveReview = async () => {
    setIsSavingReview(true);
    setReviewSaveMessage(null);
    setReviewSaveError(null);

    try {
      const response = await fetch("/api/control-tower/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureRequestId: fr.id,
          reviewStatus,
          decisionSummary,
          decisionRationale,
          pendingDecisions: parseLines(pendingDecisions),
          nextActions: parseLines(nextActions),
          reviewedBy,
          source: "director_review"
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        const errorCode = data?.error?.code;
        const errorMessage = data?.error?.message ?? "Failed to save review.";
        throw new Error(errorCode ? `${errorMessage} (${errorCode})` : errorMessage);
      }

      if (onReviewSaved) {
        await onReviewSaved(fr.id);
      }

      setReviewSaveMessage("Review saved and refreshed from the latest intervention data.");
    } catch (error) {
      setReviewSaveError(error instanceof Error ? error.message : "Failed to save review.");
    } finally {
      setIsSavingReview(false);
    }
  };

  // Stage metadata now comes from centralized config
  const stageMetadata = getStageMetadata(fr.stage);
  const stageColorClasses = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    cyan: "bg-cyan-100 text-cyan-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    yellow: "bg-yellow-100 text-yellow-700"
  }[stageMetadata.color] || "bg-gray-100 text-gray-700";

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
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${stageColorClasses}`}
                title={stageMetadata.description}
              >
                {getStageLabel(fr.stage)} ({stageMetadata.group.replace('-', ' ')})
              </span>
              {reviewMeta && (
                <span className={`px-2 py-1 text-xs font-medium rounded ${reviewMeta.classes}`}>
                  {reviewMeta.label}
                </span>
              )}
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
                onClick={() => {
                  onAddNote?.(fr.id);
                  setShowNotes(!showNotes);
                }}
                className={`px-4 py-2 ${showNotes ? "bg-gray-700" : "bg-gray-600"} text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium`}
              >
                {showNotes ? "Hide Notes" : "Director Notes"}
              </button>
            </div>

            {/* M2P-Specific Actions */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">M2P Leadership Tools</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleGenerateArtifact("okr_update")}
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Draft OKR Update
                </button>
                <button
                  onClick={() => {
                    const pmOwner = fr.pmOwner || "Team Member";
                    handleGenerateArtifact("idp_feedback", pmOwner);
                  }}
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Draft IDP Feedback
                </button>
              </div>
            </div>
          </div>

          {/* Review Decision */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Review Decision</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {reviewMeta?.description ?? "No persisted review decision has been recorded yet."}
                </p>
              </div>
              {reviewMeta ? (
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${reviewMeta.classes}`}>
                  {reviewMeta.label}
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  Awaiting review
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-5">
              <div className="space-y-4">
                {fr.review.present && reviewRecord ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white rounded-lg border border-slate-200 p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Reviewed by</p>
                        <p className="font-medium text-gray-900">{reviewRecord.reviewedBy}</p>
                      </div>
                      <div className="bg-white rounded-lg border border-slate-200 p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Last reviewed</p>
                        <p className="font-medium text-gray-900">{formatDateTime(reviewRecord.lastReviewedAt)}</p>
                      </div>
                      <div className="bg-white rounded-lg border border-slate-200 p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Review updated</p>
                        <p className="font-medium text-gray-900">{formatDateTime(reviewRecord.updatedAt)}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Decision summary</h4>
                      <p className="text-sm text-gray-700 leading-6">{reviewRecord.decisionSummary}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Rationale</h4>
                      <p className="text-sm text-gray-700 leading-6">{reviewRecord.decisionRationale}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Pending decisions</h4>
                        {reviewRecord.pendingDecisions.length > 0 ? (
                          <ul className="space-y-2 text-sm text-gray-700">
                            {reviewRecord.pendingDecisions.map((decision, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                                <span>{decision}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No pending director decisions.</p>
                        )}
                      </div>

                      <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommended next actions</h4>
                        {reviewRecord.nextActions.length > 0 ? (
                          <ul className="space-y-2 text-sm text-gray-700">
                            {reviewRecord.nextActions.map((action, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No review follow-up actions captured yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-gray-600">
                    Persist a director review to capture decision rationale, pending decisions, and workflow next actions for this request.
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{reviewRecord ? "Edit review" : "Capture review"}</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Save the current decision here, then the detail panel refreshes from assembled server data.
                  </p>
                </div>

                {reviewSaveMessage && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                    {reviewSaveMessage}
                  </div>
                )}

                {reviewSaveError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                    {reviewSaveError}
                  </div>
                )}

                <div>
                  <label htmlFor="review-status" className="mb-1 block text-sm font-medium text-gray-900">
                    Review status
                  </label>
                  <select
                    id="review-status"
                    aria-label="Review status"
                    value={reviewStatus}
                    onChange={(event) => setReviewStatus(event.target.value as FeatureRequestReviewStatus)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {reviewStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="decision-summary" className="mb-1 block text-sm font-medium text-gray-900">
                    Decision summary
                  </label>
                  <textarea
                    id="decision-summary"
                    aria-label="Decision summary"
                    value={decisionSummary}
                    onChange={(event) => setDecisionSummary(event.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="decision-rationale" className="mb-1 block text-sm font-medium text-gray-900">
                    Decision rationale
                  </label>
                  <textarea
                    id="decision-rationale"
                    aria-label="Decision rationale"
                    value={decisionRationale}
                    onChange={(event) => setDecisionRationale(event.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="pending-decisions" className="mb-1 block text-sm font-medium text-gray-900">
                    Pending decisions
                  </label>
                  <textarea
                    id="pending-decisions"
                    aria-label="Pending decisions"
                    value={pendingDecisions}
                    onChange={(event) => setPendingDecisions(event.target.value)}
                    rows={4}
                    placeholder="One line per pending decision"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="next-actions" className="mb-1 block text-sm font-medium text-gray-900">
                    Next actions
                  </label>
                  <textarea
                    id="next-actions"
                    aria-label="Next actions"
                    value={nextActions}
                    onChange={(event) => setNextActions(event.target.value)}
                    rows={4}
                    placeholder="One line per action"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="reviewed-by" className="mb-1 block text-sm font-medium text-gray-900">
                    Reviewed by
                  </label>
                  <input
                    id="reviewed-by"
                    aria-label="Reviewed by"
                    value={reviewedBy}
                    onChange={(event) => setReviewedBy(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveReview}
                  disabled={isSavingReview}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingReview ? "Saving review..." : "Save review"}
                </button>
              </div>
            </div>
          </section>

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
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-blue-700">{issue.key}</span>
                        {issue.boardType && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            issue.boardType === 'cso'
                              ? 'bg-cyan-100 text-cyan-700'
                              : issue.boardType === 'len'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {issue.boardType.toUpperCase()}
                          </span>
                        )}
                        {issue.documentType && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                            {issue.documentType.toUpperCase().replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        {issue.status}
                      </span>
                    </div>

                    {issue.sprintName && (
                      <div className="mb-1 flex items-center gap-1">
                        <span className="text-xs text-blue-900">📅 Sprint:</span>
                        <span className="text-xs font-medium text-blue-900">{issue.sprintName}</span>
                      </div>
                    )}

                    {issue.assignee && (
                      <p className="text-xs text-blue-900">Assignee: {issue.assignee}</p>
                    )}

                    {issue.linkedIssueKeys && issue.linkedIssueKeys.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          🔗 Linked Issues (CSo↔LEN Workflow):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {issue.linkedIssueKeys.map((linkedKey) => (
                            <span key={linkedKey} className="px-2 py-0.5 text-xs font-mono bg-blue-100 text-blue-700 rounded">
                              {linkedKey}
                            </span>
                          ))}
                        </div>
                      </div>
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
