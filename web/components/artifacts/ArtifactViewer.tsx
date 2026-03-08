"use client";

import { useState } from "react";
import type { Artifact, ArtifactType } from "@/lib/control-tower/artifacts/types";
import { X, Copy, Download, Edit2, Check, Send } from "lucide-react";
import { canSendViaComms, artifactToCommsDraft } from "@/lib/control-tower/artifacts/comms-integration";

interface ArtifactViewerProps {
  artifact: Artifact;
  onClose: () => void;
  onEdit?: (editedContent: string) => void;
}

const ARTIFACT_TYPE_LABELS: Record<ArtifactType, string> = {
  prd: "Product Requirements Document",
  user_story: "User Story",
  follow_up: "Follow-up Communication",
  clarification_request: "Clarification Request",
  status_update: "Status Update",
  leadership_update: "Leadership Update",
  client_summary: "Client Escalation Summary",
  okr_update: "OKR Progress Update",
  okr_tracking: "OKR Tracking (M2P Format)",
  idp_feedback: "IDP Feedback (M2P Format)",
  monthly_product_update: "Monthly Product Update (M2P Format)",
  grooming_checklist: "Grooming Checklist (M2P Format)",
  product_roadmap: "Product Roadmap (M2P Format)",
  bmad_prd: "PRD (BMAD Format)"
};

export function ArtifactViewer({ artifact, onClose, onEdit }: ArtifactViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(artifact.content);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editedContent : artifact.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDownload = () => {
    const content = isEditing ? editedContent : artifact.content;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editedContent);
    }
    setIsEditing(false);
  };

  const handleSubmitForApproval = async () => {
    setIsSubmitting(true);
    try {
      // Update artifact content if edited
      const currentArtifact = isEditing
        ? { ...artifact, content: editedContent, updatedAt: new Date().toISOString() }
        : artifact;

      // Convert to comms draft
      const commsDraft = artifactToCommsDraft(currentArtifact);

      // Submit to comms system
      const response = await fetch("/api/assistant/comms/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commsDraft)
      });

      if (!response.ok) {
        throw new Error("Failed to submit for approval");
      }

      alert("Artifact submitted for approval! Check the /assistant page to approve and send.");
      onClose();
    } catch (error) {
      console.error("Error submitting for approval:", error);
      alert("Failed to submit for approval");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <div className="text-sm text-gray-500">{ARTIFACT_TYPE_LABELS[artifact.type]}</div>
            <h2 className="text-xl font-semibold text-gray-900">{artifact.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  artifact.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : artifact.status === "review"
                      ? "bg-blue-100 text-blue-800"
                      : artifact.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                }`}
              >
                {artifact.status}
              </span>
              {artifact.metadata.pmOwner && (
                <span className="text-xs text-gray-500">PM: {artifact.metadata.pmOwner}</span>
              )}
              {artifact.metadata.client && (
                <span className="text-xs text-gray-500">Client: {artifact.metadata.client}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copySuccess ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              {canSendViaComms(artifact.type) && (
                <button
                  onClick={handleSubmitForApproval}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Submitting..." : "Submit for Approval"}
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditedContent(artifact.content);
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {!isEditing ? (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                {artifact.content}
              </pre>
            </div>
          ) : (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-full min-h-[500px] p-4 font-mono text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              spellCheck={false}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          Generated {new Date(artifact.metadata.generatedAt).toLocaleString()} by{" "}
          {artifact.metadata.generatedBy}
        </div>
      </div>
    </div>
  );
}
