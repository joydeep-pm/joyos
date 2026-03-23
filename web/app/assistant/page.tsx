"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client-api";
import { EmptyState, PriorityBadge } from "@/components/ui";
import { presentBriefOutcome, presentMeetingContinuityItem } from "@/lib/intervention-presenters";
import type {
  ApprovalEnvelopeRecord,
  AssistantAlert,
  AssistantCommsHistory,
  AssistantContext,
  AssistantQueueItem,
  AssistantQueueStatus,
  CollateralReminderItem,
  DailyBrief,
  OutcomeClosureKpi,
  WeeklyReview
} from "@/lib/types";

const queueStatuses: AssistantQueueStatus[] = ["queued", "in_progress", "awaiting_input", "done", "dropped"];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoWeekIdFromDate(dateInput?: string): string {
  const date = dateInput ? new Date(`${dateInput}T00:00:00`) : new Date();
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function severityClass(severity: "high" | "medium" | "low"): string {
  if (severity === "high") return "border-oxblood/20 bg-oxblood/10 text-oxblood";
  if (severity === "medium") return "border-amber/25 bg-amber/12 text-amber";
  return "border-petrol/20 bg-petrol/10 text-petrol";
}

function collateralAssetLabel(assetType: CollateralReminderItem["assetType"]): string {
  return assetType === "product_deck" ? "Product Deck" : "Product Factsheet";
}

function dueTimingLabel(reminder: CollateralReminderItem): string {
  if (reminder.status === "overdue") {
    return `${Math.abs(reminder.daysUntilDue)} day${Math.abs(reminder.daysUntilDue) === 1 ? "" : "s"} overdue`;
  }
  if (reminder.status === "due") {
    return "Due today";
  }
  return `Due in ${reminder.daysUntilDue} day${reminder.daysUntilDue === 1 ? "" : "s"}`;
}

export default function AssistantPage() {
  const [date, setDate] = useState(todayIso());
  const [context, setContext] = useState<AssistantContext | null>(null);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [queue, setQueue] = useState<AssistantQueueItem[]>([]);
  const [comms, setComms] = useState<AssistantCommsHistory | null>(null);
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [kpi, setKpi] = useState<OutcomeClosureKpi | null>(null);
  const [alerts, setAlerts] = useState<AssistantAlert[]>([]);
  const [collateralReminders, setCollateralReminders] = useState<CollateralReminderItem[]>([]);
  const [approvalEnvelopes, setApprovalEnvelopes] = useState<ApprovalEnvelopeRecord[]>([]);
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [destination, setDestination] = useState("stakeholders@local");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [commsEnabled, setCommsEnabled] = useState(true);
  const [reviewEnabled, setReviewEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const weekId = useMemo(() => isoWeekIdFromDate(date), [date]);

  const load = async () => {
    setLoading(true);

    const [contextRes, briefRes, queueRes, commsRes, reviewRes, alertsRes, remindersRes, kpiRes, envelopesRes] = await Promise.all([
      api.getAssistantContext(),
      api.getAssistantBrief(date),
      api.getAssistantQueue(),
      api.getCommsHistory(),
      api.getAssistantReview(weekId),
      api.getAssistantAlerts(date),
      api.getCollateralReminders(date),
      api.getOutcomeClosureKpi(weekId),
      api.getApprovalEnvelopes()
    ]);

    if (contextRes.ok && contextRes.data) setContext(contextRes.data);
    if (briefRes.ok && briefRes.data) {
      setBrief(briefRes.data);
      setSelectedTaskIds(briefRes.data.topOutcomes.map((item) => item.taskId).slice(0, 3));
    }
    if (queueRes.ok && Array.isArray(queueRes.data)) setQueue(queueRes.data);

    if (commsRes.ok && commsRes.data) {
      setComms(commsRes.data);
      setCommsEnabled(true);
    } else if (commsRes.error?.code === "FEATURE_DISABLED") {
      setCommsEnabled(false);
      setComms(null);
    }

    if (reviewRes.ok && reviewRes.data) {
      setReview(reviewRes.data);
      setReviewEnabled(true);
    } else if (reviewRes.error?.code === "FEATURE_DISABLED") {
      setReviewEnabled(false);
      setReview(null);
    }

    if (alertsRes.ok && Array.isArray(alertsRes.data)) {
      setAlerts(alertsRes.data);
      setAlertsEnabled(true);
    } else if (alertsRes.error?.code === "FEATURE_DISABLED") {
      setAlertsEnabled(false);
      setAlerts([]);
    }

    if (remindersRes.ok && Array.isArray(remindersRes.data)) {
      setCollateralReminders(remindersRes.data);
    } else {
      setCollateralReminders([]);
    }

    if (kpiRes.ok && kpiRes.data) {
      setKpi(kpiRes.data);
    } else if (kpiRes.error?.code === "FEATURE_DISABLED") {
      setKpi(null);
    }

    if (envelopesRes.ok && Array.isArray(envelopesRes.data)) {
      const envelopeData = envelopesRes.data;
      setApprovalEnvelopes(envelopeData);
      setSelectedEnvelopeId((current) => {
        if (current && envelopeData.some((entry) => entry.id === current)) return current;
        return envelopeData[0]?.id ?? null;
      });
    }

    const responseErrors = [contextRes, briefRes, queueRes, commsRes, reviewRes, alertsRes, remindersRes, kpiRes, envelopesRes]
      .map((entry) => entry.error)
      .filter((entry): entry is { code: string; message: string } => entry !== undefined && entry.code !== "FEATURE_DISABLED");

    if (responseErrors.length) {
      setMessage(responseErrors[0].message);
    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [date, weekId]);

  const top3Selected = useMemo(() => selectedTaskIds.slice(0, 3), [selectedTaskIds]);
  const latestDraft = comms?.drafts[0];
  const selectedEnvelope = useMemo(
    () => approvalEnvelopes.find((envelope) => envelope.id === selectedEnvelopeId) ?? null,
    [approvalEnvelopes, selectedEnvelopeId]
  );

  const commitDayPlan = async () => {
    setBusy("commit");
    const response = await api.commitAssistantPlan({
      date,
      taskIds: top3Selected,
      notes: notes.trim() || undefined
    });

    if (!response.ok) {
      setMessage(response.error?.message ?? "Unable to commit day plan.");
      setBusy(null);
      return;
    }

    setMessage(`Committed ${response.data?.items.length ?? 0} outcome(s) for ${date}.`);
    setNotes("");
    await load();
    setBusy(null);
  };

  const refreshContext = async () => {
    setBusy("rebuild");
    const response = await api.rebuildAssistantContext();
    if (!response.ok) {
      setMessage(response.error?.message ?? "Unable to rebuild context.");
      setBusy(null);
      return;
    }
    setMessage("Assistant context rebuilt.");
    await load();
    setBusy(null);
  };

  const updateQueueStatus = async (id: string, status: AssistantQueueStatus) => {
    const response = await api.updateAssistantQueueStatus(id, status);
    if (!response.ok) {
      setMessage(response.error?.message ?? "Unable to update queue item.");
      return;
    }
    setQueue((current) => current.map((item) => (item.id === id ? response.data ?? item : item)));
  };

  const resolveAlert = async (alertId: string, actionId?: string) => {
    setBusy(`alert:${alertId}`);
    const response = await api.resolveAssistantAlert(alertId, actionId, "user");
    if (!response.ok) {
      setMessage(response.error?.message ?? "Unable to resolve alert.");
      setBusy(null);
      return;
    }
    setMessage(response.data?.actionResult ?? `Resolved alert ${alertId}.`);
    await load();
    setBusy(null);
  };

  const resolveCollateralReminder = async (reminderId: string) => {
    setBusy(`collateral:${reminderId}`);
    const response = await api.resolveCollateralReminder(reminderId);
    if (!response.ok) {
      setMessage(response.error?.message ?? "Unable to resolve collateral reminder.");
      setBusy(null);
      return;
    }
    setMessage(`Resolved collateral reminder for ${response.data?.vertical ?? reminderId}.`);
    await load();
    setBusy(null);
  };

  const createDraft = async (type: "stakeholder_update" | "blocked_followup") => {
    setBusy("draft");
    const response = await api.createCommsDraft({ type, destination, date });
    if (!response.ok) {
      setMessage(response.error?.message ?? "Unable to create draft.");
      setBusy(null);
      return;
    }
    setMessage(`Draft created: ${response.data?.subject ?? "outbound update"}`);
    await load();
    setBusy(null);
  };

  const approveDraft = async (id: string) => {
    setBusy(`approve:${id}`);
    const response = await api.approveCommsDraft(id, "user");
    if (!response.ok) {
      setMessage(response.error?.message ?? "Unable to approve draft.");
      setBusy(null);
      return;
    }
    setMessage(`Draft approved (${response.data?.approvalToken?.slice(0, 8) ?? "token"}...).`);
    await load();
    setBusy(null);
  };

  const sendDraft = async (id: string) => {
    setBusy(`send:${id}`);
    const response = await api.sendCommsDraft(id, "user");
    if (!response.ok) {
      setMessage(response.error?.message ?? "Unable to send draft.");
      setBusy(null);
      return;
    }
    setMessage(response.data?.message ?? "Send attempted.");
    await load();
    setBusy(null);
  };

  const createApprovalEnvelope = async (draftId: string) => {
    const approvedDraft = comms?.drafts.find((draft) => draft.id === draftId && draft.status === "approved");

    if (!approvedDraft) {
      setMessage("Approve the draft before creating an approval envelope.");
      return;
    }

    setBusy(`envelope:create:${draftId}`);
    const response = await api.createApprovalEnvelope({
      actionType: "comms_send",
      targetType: "comms_draft",
      targetId: draftId,
      summary: `Send stakeholder update draft ${draftId}`,
      evidence: [
        "Draft created from reviewed artifact",
        `Approved by ${approvedDraft.approvedBy ?? "user"}`,
        `Approval token present: ${approvedDraft.approvalToken ? "yes" : "no"}`
      ],
      proposedBy: "assistant"
    });

    if (!response.ok || !response.data) {
      setMessage(response.error?.message ?? "Unable to create approval envelope.");
      setBusy(null);
      return;
    }

    upsertApprovalEnvelope(response.data);
    setMessage(`Approval envelope created for ${draftId}.`);
    setBusy(null);
  };

  const refreshApprovalEnvelope = async (id: string): Promise<ApprovalEnvelopeRecord | null> => {
    const response = await api.getApprovalEnvelope(id);
    if (!response.ok || !response.data) {
      return null;
    }

    setApprovalEnvelopes((current) => [response.data!, ...current.filter((entry) => entry.id !== id)]);
    setSelectedEnvelopeId(id);
    return response.data;
  };

  const upsertApprovalEnvelope = (envelope: ApprovalEnvelopeRecord) => {
    setApprovalEnvelopes((current) => [envelope, ...current.filter((entry) => entry.id !== envelope.id)]);
    setSelectedEnvelopeId(envelope.id);
  };

  const transitionApprovalEnvelope = async (id: string, action: "approve" | "execute") => {
    setBusy(`envelope:${action}:${id}`);
    const response = await api.transitionApprovalEnvelope(id, { action, actor: "user" });

    if (!response.ok) {
      const refreshed = await refreshApprovalEnvelope(id);
      if (refreshed?.status === "failed") {
        setMessage(
          refreshed.failureMessage
            ? `${response.error?.message ?? "Approval envelope transition failed."} ${refreshed.failureMessage}`
            : response.error?.message ?? "Approval envelope transition failed."
        );
      } else {
        setMessage(response.error?.message ?? "Approval envelope transition failed.");
      }
      setBusy(null);
      return;
    }

    if (response.data) {
      upsertApprovalEnvelope(response.data);
    }

    const latest = await refreshApprovalEnvelope(id);
    if (action === "approve") {
      setMessage("Approval envelope approved.");
    } else if (latest?.status === "executed") {
      setMessage("Approval envelope executed.");
    } else if (latest?.status === "failed") {
      setMessage(latest.failureMessage ?? "Approval envelope execution failed.");
    } else {
      setMessage("Approval envelope updated.");
    }
    setBusy(null);
  };

  return (
    <section className="space-y-6">
      <div className="panel-surface section-shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow-label">Director intervention workspace</p>
            <h2 className="section-title mt-3">Daily intervention brief and action queue</h2>
            <p className="mt-2 text-sm text-ink/65">
              Review today&apos;s intervention candidates, commit the right outcomes, track drift during the day, and draft outbound updates with explicit approval.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="paper-input rounded-2xl px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={refreshContext}
              disabled={busy === "rebuild"}
              className="ghost-button"
            >
              {busy === "rebuild" ? "Rebuilding..." : "Rebuild context"}
            </button>
          </div>
        </div>
        {message && <p className="mt-3 text-sm text-ink/75">{message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel-muted rounded-[24px] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate">Weekly operating signal</h3>
            <Link href="/review" className="text-xs font-semibold text-ink underline-offset-2 hover:underline">
              Open weekly review
            </Link>
          </div>
          {!reviewEnabled ? (
            <p className="mt-2 text-sm text-ink/65">Weekly review is disabled by feature flag.</p>
          ) : !review ? (
            <p className="mt-2 text-sm text-ink/65">Loading weekly scorecard...</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-ink/10 bg-cloud/60 p-3">
                <p className="eyebrow-label !tracking-[0.14em]">Committed</p>
                <p className="mt-1 text-xl font-semibold">{review.scorecard.committedCount}</p>
              </div>
              <div className="rounded-xl border border-ink/10 bg-cloud/60 p-3">
                <p className="text-xs text-ink/60">Completed</p>
                <p className="mt-1 text-xl font-semibold">{review.scorecard.completedCount}</p>
              </div>
              <div className="rounded-xl border border-ink/10 bg-cloud/60 p-3">
                <p className="text-xs text-ink/60">Rollover</p>
                <p className="mt-1 text-xl font-semibold">{review.scorecard.rolloverCount}</p>
              </div>
              <div className="rounded-xl border border-ink/10 bg-cloud/60 p-3">
                <p className="text-xs text-ink/60">Closure rate</p>
                <p className="mt-1 text-xl font-semibold">{Math.round(review.scorecard.closureRate * 100)}%</p>
              </div>
            </div>
          )}
          {kpi && (
            <p className="mt-3 text-xs text-ink/65">
              KPI target: {Math.round(kpi.target * 100)}% ({kpi.metTarget ? "on track" : "below target"})
            </p>
          )}
        </div>

        <div className="panel-muted rounded-[24px] p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate">Intervention alerts</h3>
          {!alertsEnabled ? (
            <p className="mt-2 text-sm text-ink/65">Alerts are disabled by feature flag.</p>
          ) : alerts.length === 0 ? (
            <p className="mt-2 text-sm text-ink/65">No active alert.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <li key={alert.id} className={`rounded-xl border p-3 ${severityClass(alert.severity)}`}>
                  <p className="text-sm font-medium">
                    {alert.type === "wip_limit"
                      ? alert.message
                      : `${alert.taskTitle}: ${alert.fromPriority} -> ${alert.toPriority}`}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {alert.correctiveActions.slice(0, 2).map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => void resolveAlert(alert.id, action.id)}
                        disabled={busy === `alert:${alert.id}`}
                        className="rounded-lg border border-ink/25 bg-white/80 px-2 py-1 text-xs font-semibold text-ink"
                      >
                        {action.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => void resolveAlert(alert.id)}
                      disabled={busy === `alert:${alert.id}`}
                      className="rounded-lg border border-ink/25 bg-white/80 px-2 py-1 text-xs font-semibold text-ink"
                    >
                      Resolve
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-ink/65">Loading assistant state...</p>
      ) : !brief ? (
        <EmptyState title="No brief available" subtitle="Try rebuilding context and generating the brief again." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
            <div className="space-y-6">
            <div className="panel-surface rounded-[28px] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-[2rem] leading-none">Today&apos;s intervention candidates</h3>
                <button
                  type="button"
                  onClick={commitDayPlan}
                  disabled={busy === "commit"}
                  className="primary-button disabled:opacity-60"
                >
                  {busy === "commit" ? "Committing..." : "Commit day plan"}
                </button>
              </div>

              {brief.topOutcomes.length === 0 ? (
                <p className="mt-3 text-sm text-ink/65">No intervention candidates found. Triage backlog and activate key tasks.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {brief.topOutcomes.map((outcome) => (
                    <li key={outcome.id} className="rounded-[22px] border border-ink/10 bg-bone/80 p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(outcome.taskId)}
                          onChange={(event) => {
                            setSelectedTaskIds((current) => {
                              if (event.target.checked) return [...current, outcome.taskId].slice(0, 3);
                              return current.filter((item) => item !== outcome.taskId);
                            });
                          }}
                          className="mt-1 h-4 w-4 rounded border-ink/30"
                        />
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <PriorityBadge priority={outcome.priority} />
                            <span className="mono text-xs text-ink/60">score {outcome.score}</span>
                          </div>
                          <h4 className="font-semibold text-ink">{outcome.title}</h4>
                          <p className="text-sm text-ink/70">{presentBriefOutcome(outcome).reason}</p>
                          <p className="text-xs text-ink/60">{presentBriefOutcome(outcome).goalSignal}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="paper-input mt-4 min-h-20 w-full rounded-2xl px-3 py-2 text-sm"
                placeholder="Optional commitment notes"
              />
              <p className="mt-2 text-xs text-ink/55">Midday intervention check: {brief.middayCheckpoint}</p>
              <p className="mt-1 text-xs text-ink/55">Evening closure prompt: {brief.eveningClosurePrompt}</p>
            </div>

            <div className="panel-muted rounded-[28px] p-5">
              <h3 className="font-display text-[2rem] leading-none">Committed action queue</h3>
              {queue.length === 0 ? (
                <p className="mt-3 text-sm text-ink/65">No queued items yet. Commit the day plan to seed execution.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {queue.map((item) => (
                    <li key={item.id} className="rounded-[22px] border border-ink/10 bg-bone/80 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={item.priority} />
                            <span className="text-xs text-ink/60">{item.goalReference}</span>
                          </div>
                          <h4 className="mt-1 font-semibold text-ink">{item.title}</h4>
                        </div>
                        <select
                          value={item.status}
                          onChange={(event) => void updateQueueStatus(item.id, event.target.value as AssistantQueueStatus)}
                          className="paper-input rounded-xl px-2 py-1 text-xs"
                        >
                          {queueStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="panel-muted rounded-[28px] p-5">
              <h3 className="font-display text-[2rem] leading-none">Risk and drift requiring attention</h3>
              {!context || context.driftAlerts.length === 0 ? (
                <p className="mt-2 text-sm text-ink/65">No drift alert active.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {context.driftAlerts.slice(0, 6).map((alert) => (
                    <li key={alert.id} className={`rounded-xl border p-3 text-sm ${severityClass(alert.severity)}`}>
                      {alert.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="panel-muted rounded-[28px] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Quarterly collateral reminders</h3>
                <span className="text-xs text-ink/60">{collateralReminders.length} visible</span>
              </div>
              {collateralReminders.length === 0 ? (
                <p className="mt-2 text-sm text-ink/65">No Product Deck or Product Factsheet refresh is currently due.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {collateralReminders.map((reminder) => (
                    <li key={reminder.id} className={`rounded-2xl border p-4 ${severityClass(reminder.severity)}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-current/15 bg-white/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]">
                          {collateralAssetLabel(reminder.assetType)}
                        </span>
                        <span className="text-xs opacity-80">{reminder.vertical}</span>
                        <span className="text-xs opacity-70">{reminder.quarterLabel}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold">{dueTimingLabel(reminder)}</p>
                      <p className="mt-1 text-sm opacity-85">Refresh by {reminder.dueDate} · Last refreshed {reminder.lastRefreshedAt}</p>
                      <button
                        type="button"
                        onClick={() => void resolveCollateralReminder(reminder.id)}
                        disabled={busy === `collateral:${reminder.id}`}
                        className="mt-3 rounded-lg border border-current/20 bg-white/70 px-3 py-1 text-xs font-semibold"
                      >
                        {busy === `collateral:${reminder.id}` ? "Resolving..." : "Mark resolved"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="panel-muted rounded-[28px] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Meeting continuity review</h3>
                {context && (
                  <span className="text-xs text-ink/60">
                    Open commitments: {context.stats?.openMeetingCommitments ?? 0}
                  </span>
                )}
              </div>
              {!context || (context.meetingContinuity ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-ink/65">No unresolved meeting commitments are visible yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {(context.meetingContinuity ?? [])
                    .filter((item) => item.status !== "resolved")
                    .slice(0, 4)
                    .map((item) => {
                      const view = presentMeetingContinuityItem(item);
                      return (
                        <li key={item.id} className="rounded-[22px] border border-ink/10 bg-bone/80 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-ink/15 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate">
                              {view.statusLabel}
                            </span>
                            {item.date && <span className="text-xs text-ink/55">{item.date}</span>}
                          </div>
                          <h4 className="mt-2 font-semibold text-ink">{view.heading}</h4>
                          <p className="mt-2 text-sm text-ink/70">{view.summary}</p>
                          {item.blockers.length > 0 && (
                            <p className="mt-2 text-xs text-oxblood">Blocker: {item.blockers[0]}</p>
                          )}
                          {item.openQuestions.length > 0 && (
                            <p className="mt-1 text-xs text-amber">Ambiguity: {item.openQuestions[0]}</p>
                          )}
                          <p className="mt-2 text-xs text-ink/60">Suggested route: {view.nextStepLabel}</p>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>

            <div className="panel-muted rounded-[28px] p-5">
              <h3 className="font-display text-[2rem] leading-none">Outbound updates</h3>
              {!commsEnabled ? (
                <p className="mt-2 text-sm text-ink/65">Comms module is disabled by feature flag.</p>
              ) : (
                <>
                  <input
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    className="mt-3 w-full rounded-xl border border-ink/20 bg-white px-3 py-2 text-sm"
                    placeholder="Destination"
                  />
                  <div className="mt-3 grid gap-2">
                    <button
                      type="button"
                      onClick={() => void createDraft("stakeholder_update")}
                      disabled={busy === "draft"}
                    className="ghost-button rounded-2xl px-3 py-2"
                    >
                      Draft stakeholder update
                    </button>
                    <button
                      type="button"
                      onClick={() => void createDraft("blocked_followup")}
                      disabled={busy === "draft"}
                    className="ghost-button rounded-2xl px-3 py-2"
                    >
                      Draft blocker follow-up
                    </button>
                  </div>

                  {!latestDraft ? (
                    <p className="mt-3 text-sm text-ink/65">No draft yet.</p>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-ink/10 bg-bone/80 p-3">
                      <p className="text-xs text-ink/60">{latestDraft.status.toUpperCase()}</p>
                      <p className="mt-1 text-sm font-semibold text-ink">{latestDraft.subject}</p>
                      <pre className="mt-2 max-h-36 overflow-y-auto whitespace-pre-wrap text-xs text-ink/75">{latestDraft.body}</pre>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => void approveDraft(latestDraft.id)}
                          disabled={latestDraft.status !== "draft" || busy === `approve:${latestDraft.id}`}
                          className="primary-button rounded-xl px-3 py-1 text-xs disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => void sendDraft(latestDraft.id)}
                          disabled={latestDraft.status !== "approved" || busy === `send:${latestDraft.id}`}
                          className="primary-button rounded-xl px-3 py-1 text-xs disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="panel-muted rounded-[28px] p-5">
              <h3 className="font-display text-[2rem] leading-none">Approval workflow</h3>
              {!latestDraft ? (
                <p className="mt-2 text-sm text-ink/65">Create a draft to prepare an approval envelope.</p>
              ) : (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void createApprovalEnvelope(latestDraft.id)}
                      disabled={latestDraft.status !== "approved" || busy === `envelope:create:${latestDraft.id}`}
                      className="ghost-button rounded-2xl px-3 py-2 disabled:opacity-50"
                    >
                      Create approval envelope
                    </button>
                  </div>

                  {approvalEnvelopes.length === 0 ? (
                    <p className="mt-3 text-sm text-ink/65">No approval envelope yet.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="space-y-2">
                        {approvalEnvelopes.map((envelope) => (
                          <button
                            key={envelope.id}
                            type="button"
                            onClick={() => setSelectedEnvelopeId(envelope.id)}
                            className={`w-full rounded-xl border px-3 py-2 text-left ${
                              envelope.id === selectedEnvelopeId
                                ? "border-petrol/20 bg-bone"
                                : "border-ink/10 bg-paper/70"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-ink">{envelope.summary}</span>
                              <span className="text-xs text-ink/60">{envelope.status.toUpperCase()}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {selectedEnvelope && (
                        <div className="rounded-2xl border border-ink/10 bg-bone/80 p-3">
                          <p className="text-xs text-ink/60">{selectedEnvelope.status.toUpperCase()}</p>
                          <p className="mt-1 text-sm font-semibold text-ink">{selectedEnvelope.summary}</p>
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-ink/75">
                            {selectedEnvelope.evidence.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>

                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => void transitionApprovalEnvelope(selectedEnvelope.id, "approve")}
                              disabled={selectedEnvelope.status !== "proposed" || busy === `envelope:approve:${selectedEnvelope.id}`}
                              className="primary-button rounded-xl px-3 py-1 text-xs disabled:opacity-50"
                            >
                              Approve envelope
                            </button>
                            <button
                              type="button"
                              onClick={() => void transitionApprovalEnvelope(selectedEnvelope.id, "execute")}
                              disabled={selectedEnvelope.status !== "approved" || busy === `envelope:execute:${selectedEnvelope.id}`}
                              className="primary-button rounded-xl px-3 py-1 text-xs disabled:opacity-50"
                            >
                              Execute envelope
                            </button>
                          </div>

                          <div className="mt-4 space-y-2 text-xs text-ink/70">
                            <p>
                              <span className="font-semibold text-ink">Status:</span> {selectedEnvelope.status}
                            </p>
                            {selectedEnvelope.executedAt && (
                              <p>
                                <span className="font-semibold text-ink">Executed at:</span> {selectedEnvelope.executedAt}
                              </p>
                            )}
                            {selectedEnvelope.failedAt && (
                              <p>
                                <span className="font-semibold text-ink">Failed at:</span> {selectedEnvelope.failedAt}
                              </p>
                            )}
                            {selectedEnvelope.failureCode && (
                              <p className="font-mono text-[11px] text-oxblood">{selectedEnvelope.failureCode}</p>
                            )}
                            {selectedEnvelope.failureMessage && (
                              <p className="text-sm text-oxblood">{selectedEnvelope.failureMessage}</p>
                            )}
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Audit</p>
                            <ul className="mt-2 space-y-1 text-xs text-ink/70">
                              {selectedEnvelope.audit.map((entry) => (
                                <li key={entry.id}>
                                  {entry.event} — {entry.actor}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
