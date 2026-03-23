/**
 * Feature Request Card Component
 */

"use client";

import React from "react";
import { RiskBadge } from "./RiskBadge";
import { InterventionReasonBadge } from "./InterventionReasonBadge";
import { RealStatusPicker } from "./RealStatusPicker";
import { getStageLabel, getStageColor, getStageMetadata } from "@/lib/control-tower/stage-config";
import type { FeatureRequestWithIntervention } from "@/lib/control-tower/intervention-engine";
import type { RealStatusEntry, RealStatusValue } from "@/lib/control-tower/real-status-types";

interface FeatureRequestCardProps {
  featureRequest: FeatureRequestWithIntervention;
  onOpenDetail?: (id: string) => void;
  realStatus?: RealStatusEntry;
  onRealStatusSaved?: (id: string, status: RealStatusValue, note: string) => void;
}

export function FeatureRequestCard({ featureRequest, onOpenDetail, realStatus, onRealStatusSaved }: FeatureRequestCardProps) {
  const fr = featureRequest;

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

  // Get stage metadata for color coding
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

  return (
    <div
      className={`rounded-[22px] border p-4 transition hover:-translate-y-[1px] hover:shadow-card cursor-pointer ${
        fr.requiresIntervention ? "border-oxblood/30 bg-paper/90 shadow-card" : "border-ink/10 bg-paper/70"
      }`}
      onClick={() => onOpenDetail?.(fr.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-base text-ink mb-1">{fr.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate">{sourceLabels[fr.source]}</span>
            <span className="text-xs text-slate/50">•</span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${stageColorClasses}`}
              title={stageMetadata.description}
            >
              {getStageLabel(fr.stage)}
            </span>
            {fr.productCharter && (
              <>
                <span className="text-xs text-slate/50">•</span>
                <span className="rounded-full border border-petrol/20 bg-petrol/10 px-2 py-0.5 text-xs font-semibold text-petrol">
                  {fr.productCharter}
                </span>
              </>
            )}
            {fr.client && (
              <>
                <span className="text-xs text-slate/50">•</span>
                <span className="text-xs text-slate">{fr.client}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {realStatus?.reviewedToday && (
            <span className="inline-flex items-center gap-1 rounded-full border border-moss/20 bg-moss/10 px-2 py-0.5 text-xs font-medium text-moss">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Reviewed
            </span>
          )}
          <RiskBadge severity={fr.riskSummary.severity} />
        </div>
      </div>

      {/* Intervention Reasons */}
      {fr.interventionReasons.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {fr.interventionReasons.map((reason, idx) => (
              <InterventionReasonBadge key={idx} reason={reason} />
            ))}
          </div>
        </div>
      )}

      {/* Linked Sources */}
      <div className="flex items-center gap-4 text-xs text-slate">
        {fr.jiraIssues.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Jira:</span>
            <span>{fr.jiraIssues.map((i) => i.key).join(", ")}</span>
          </div>
        )}
        {fr.confluencePages.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Confluence:</span>
            <span>{fr.confluencePages.length} page{fr.confluencePages.length > 1 ? "s" : ""}</span>
          </div>
        )}
        {fr.blockerSummary.hasBlockers && (
          <div className="flex items-center gap-1 text-oxblood">
            <span>🚧</span>
            <span>{fr.blockerSummary.blockerCount} blocker{fr.blockerSummary.blockerCount > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Real Status + Latest Update */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink/10 pt-3">
        <RealStatusPicker
          featureRequestId={fr.id}
          jiraKeys={fr.jiraIssues.map((i) => i.key)}
          currentStatus={realStatus?.status}
          currentNote={realStatus?.note}
          onSaved={(status, note) => onRealStatusSaved?.(fr.id, status, note)}
          compact
        />
        <span className="text-xs text-slate/70 shrink-0">
          {new Date(fr.latestUpdate.date).toLocaleDateString()} · {fr.latestUpdate.source}
        </span>
      </div>
    </div>
  );
}
