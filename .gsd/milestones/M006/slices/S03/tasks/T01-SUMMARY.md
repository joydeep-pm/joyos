---
id: T01
parent: S03
milestone: M006
provides:
  - A concise presenter seam for rendering unresolved meeting commitments in the assistant workspace
key_files:
  - web/lib/intervention-presenters.ts
  - web/app/assistant/page.tsx
key_decisions:
  - Meeting continuity review should be intervention-first and concise, not a transcript dump
patterns_established:
  - Meeting review items are presented as heading + summary + status + next routing target
observability_surfaces:
  - `presentMeetingContinuityItem`
  - `web/lib/intervention-presenters.ts`
duration: 35m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Design the meeting continuity review presentation

**Defined a compact presentation seam for unresolved meeting commitments.**

## What Happened

A new presenter was added for meeting continuity items so the assistant page can show unresolved meeting commitments in a high-signal, intervention-oriented way. The presentation intentionally avoids dumping raw meeting details and instead focuses on what matters for director review: what still needs attention, whether the item is ambiguous or open, and what durable routing target is suggested next.

## Verification

- `rg -n "presentMeetingContinuityItem|MeetingContinuityReviewView|routingTargets|ambiguity" web/lib/intervention-presenters.ts`

## Diagnostics

Future UI work should use `presentMeetingContinuityItem` rather than formatting meeting continuity items ad hoc.

## Deviations

None.

## Known Issues

This task defines the presentation seam only; the assistant page does not yet render the review panel until T02.

## Files Created/Modified

- `web/lib/intervention-presenters.ts` — added the meeting continuity review presenter
