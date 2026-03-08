"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { EmptyState, PriorityBadge } from "@/components/ui";
import type { AssistantAlert, OutcomeClosureKpi, TrendPoint, WeeklyReview } from "@/lib/types";

function currentWeekId(): string {
  const date = new Date();
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function severityClass(severity: "high" | "medium" | "low"): string {
  if (severity === "high") return "border-rose-200 bg-rose-50 text-rose-900";
  if (severity === "medium") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-sky-200 bg-sky-50 text-sky-900";
}

export default function ReviewPage() {
  const [week, setWeek] = useState(currentWeekId());
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [alerts, setAlerts] = useState<AssistantAlert[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [kpi, setKpi] = useState<OutcomeClosureKpi | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);

    const [reviewRes, alertsRes, trendsRes, kpiRes] = await Promise.all([
      api.getAssistantReview(week),
      api.getAssistantAlerts(new Date().toISOString().slice(0, 10)),
      api.getAssistantTrends(8, week),
      api.getOutcomeClosureKpi(week)
    ]);

    if (reviewRes.ok && reviewRes.data) {
      setReview(reviewRes.data);
    } else {
      setMessage(reviewRes.error?.message ?? "Unable to load weekly review.");
    }

    if (alertsRes.ok && Array.isArray(alertsRes.data)) {
      setAlerts(alertsRes.data);
    }

    if (trendsRes.ok && Array.isArray(trendsRes.data)) {
      setTrends(trendsRes.data);
    }

    if (kpiRes.ok && kpiRes.data) {
      setKpi(kpiRes.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [week]);

  const rebuild = async () => {
    setBusy("rebuild");
    const response = await api.rebuildAssistantReview(week);
    if (!response.ok) {
      setMessage(response.error?.message ?? "Unable to rebuild weekly review.");
      setBusy(null);
      return;
    }

    setMessage("Weekly review rebuilt.");
    await load();
    setBusy(null);
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

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-ink/10 bg-white/85 p-6 shadow-panel">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Weekly review</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Outcome closure and drift intelligence</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="week"
              value={week}
              onChange={(event) => setWeek(event.target.value)}
              className="rounded-xl border border-ink/20 bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={rebuild}
              disabled={busy === "rebuild"}
              className="rounded-xl border border-ink/20 bg-cloud px-4 py-2 text-sm font-semibold text-ink"
            >
              {busy === "rebuild" ? "Rebuilding..." : "Rebuild"}
            </button>
          </div>
        </div>
        {message && <p className="mt-3 text-sm text-ink/75">{message}</p>}
      </div>

      {loading ? (
        <p className="text-sm text-ink/65">Loading weekly intelligence...</p>
      ) : !review ? (
        <EmptyState title="No weekly review data" subtitle="Rebuild weekly review to generate scorecards." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-ink/10 bg-white/85 p-4 shadow-card">
              <p className="text-xs text-ink/60">Committed</p>
              <p className="mt-1 text-2xl font-semibold">{review.scorecard.committedCount}</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/85 p-4 shadow-card">
              <p className="text-xs text-ink/60">Completed</p>
              <p className="mt-1 text-2xl font-semibold">{review.scorecard.completedCount}</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/85 p-4 shadow-card">
              <p className="text-xs text-ink/60">Rollover</p>
              <p className="mt-1 text-2xl font-semibold">{review.scorecard.rolloverCount}</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/85 p-4 shadow-card">
              <p className="text-xs text-ink/60">Closure rate</p>
              <p className="mt-1 text-2xl font-semibold">{Math.round(review.scorecard.closureRate * 100)}%</p>
              {kpi && (
                <p className="mt-1 text-xs text-ink/65">
                  Target {Math.round(kpi.target * 100)}%: {kpi.metTarget ? "met" : "not met"}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div className="rounded-3xl border border-ink/10 bg-white/85 p-5 shadow-card">
              <h3 className="text-lg font-semibold">Goal-linked outcomes</h3>
              {review.outcomes.length === 0 ? (
                <p className="mt-2 text-sm text-ink/65">No commitments recorded for this week.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {review.outcomes.map((outcome) => (
                    <li key={outcome.taskId} className="rounded-xl border border-ink/10 bg-cloud/60 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={outcome.priority} />
                        <span className="text-xs text-ink/60">{outcome.completed ? "Completed" : "Open"}</span>
                        {outcome.rolledOver && <span className="text-xs text-rose-700">Rolled over</span>}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-ink">{outcome.title}</p>
                      <p className="mt-1 text-xs text-ink/65">{outcome.goalReference}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-ink/10 bg-white/85 p-5 shadow-card">
                <h3 className="text-lg font-semibold">Passive alerts</h3>
                {alerts.length === 0 ? (
                  <p className="mt-2 text-sm text-ink/65">No active alerts.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {alerts.slice(0, 6).map((alert) => (
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
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-3xl border border-ink/10 bg-white/85 p-5 shadow-card">
                <h3 className="text-lg font-semibold">8-week trend snapshot</h3>
                {trends.length === 0 ? (
                  <p className="mt-2 text-sm text-ink/65">No trend points yet.</p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="text-left text-ink/60">
                          <th className="px-2 py-1">Week End</th>
                          <th className="px-2 py-1">Committed</th>
                          <th className="px-2 py-1">Completed</th>
                          <th className="px-2 py-1">Closure</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trends.map((point) => (
                          <tr key={point.date} className="border-t border-ink/10">
                            <td className="px-2 py-1">{point.date}</td>
                            <td className="px-2 py-1">{point.committed}</td>
                            <td className="px-2 py-1">{point.completed}</td>
                            <td className="px-2 py-1">{Math.round(point.closureRate * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
