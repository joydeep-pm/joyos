import { friendlyDate } from "@/lib/format";
import type { BriefOutcome, MeetingContinuityItem, TaskDocument } from "@/lib/types";

export interface InterventionCandidateView {
  reason: string;
  goalSignal: string;
  dueLabel?: string;
}

export interface MeetingContinuityReviewView {
  heading: string;
  summary: string;
  statusLabel: string;
  nextStepLabel: string;
}

export function presentTaskInterventionCandidate(task: TaskDocument): InterventionCandidateView {
  const reason =
    task.frontmatter.priority === "P0"
      ? "Director attention required now."
      : task.frontmatter.status === "s"
        ? "Already in motion - finishing it will reduce drift."
        : task.frontmatter.due_date
          ? `Time-sensitive work due ${friendlyDate(task.frontmatter.due_date)}.`
          : "High-leverage work that should not drift further.";

  const goalSignal =
    task.frontmatter.category === "writing"
      ? "Likely supports Documentation or leadership readiness."
      : task.frontmatter.category === "technical"
        ? "Likely supports Stability through execution or blocker removal."
        : task.frontmatter.category === "outreach"
          ? "Likely supports New Business or stakeholder follow-through."
          : task.frontmatter.category === "people"
            ? "Likely supports Team Leadership and coaching continuity."
            : task.frontmatter.category === "research"
              ? "Likely improves decision quality before committing more work."
              : "Keep this tied to one of the operating goals before it grows.";

  return {
    reason,
    goalSignal,
    dueLabel: `Due: ${friendlyDate(task.frontmatter.due_date)}`
  };
}

export function presentBriefOutcome(outcome: BriefOutcome): InterventionCandidateView {
  return {
    reason: outcome.whyNow,
    goalSignal: outcome.goalReference,
    dueLabel: undefined
  };
}

export function presentBlockedTask(task: TaskDocument): InterventionCandidateView {
  return {
    reason:
      task.frontmatter.priority === "P0"
        ? "Critical blocker - likely needs escalation or ownership clarification."
        : "Blocked work - decide whether to escalate, clarify, or deprioritize.",
    goalSignal: "",
    dueLabel: undefined
  };
}

export function presentMeetingContinuityItem(item: MeetingContinuityItem): MeetingContinuityReviewView {
  const blockerCount = item.blockers.length;
  const commitmentCount = item.openCommitments.length;
  const ambiguityCount = item.openQuestions.length;
  const firstRoutingTarget = item.routingTargets[0]?.label ?? "Review routing target";

  const summary =
    blockerCount > 0
      ? `${blockerCount} blocker${blockerCount === 1 ? "" : "s"} still need attention.`
      : ambiguityCount > 0
        ? `${ambiguityCount} open question${ambiguityCount === 1 ? " remains" : "s remain"} before this is fully actionable.`
        : `${commitmentCount} open commitment${commitmentCount === 1 ? "" : "s"} still need follow-through.`;

  const statusLabel =
    item.status === "ambiguous"
      ? "Ambiguous follow-up"
      : item.status === "resolved"
        ? "Resolved"
        : "Open follow-up";

  const nextStepLabel = firstRoutingTarget;

  return {
    heading: item.title,
    summary,
    statusLabel,
    nextStepLabel
  };
}
