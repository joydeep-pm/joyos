---
id: T01
parent: S02
milestone: M006
provides:
  - A minimal structured meeting continuity model and matching derivation language in the runbook
key_files:
  - web/lib/types.ts
  - docs/runbooks/meeting-followup-runbook.md
key_decisions:
  - Meeting-derived continuity should be represented as rebuildable local signals rather than a second canonical store
patterns_established:
  - Meetings expose open commitments, blockers, ambiguity flags, routing targets, and linked artifacts through one shared type shape
observability_surfaces:
  - `web/lib/types.ts`
  - `docs/runbooks/meeting-followup-runbook.md`
duration: 45m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Define the meeting continuity data model and derivation rules

**Added the minimal structured model needed for meeting-derived continuity signals.**

## What Happened

The repo now has a concrete meeting continuity shape in `web/lib/types.ts`. It captures the core things the system needs to preserve from meetings after the note itself: open commitments, blockers, open questions, routing targets, linked artifacts, ambiguity flags, and a lightweight status.

The meeting follow-up runbook was updated to use the same operational language, so the markdown-side workflow and the app-side derived state now describe the same concepts.

## Verification

- `rg -n "MeetingContinuity|meetingContinuity|openMeetingCommitments|routingTargets|ambiguityFlags" web/lib/types.ts docs/runbooks/meeting-followup-runbook.md`

## Diagnostics

Future agents should use the new `MeetingContinuityItem` type as the source of truth for any derived meeting-follow-up signals in the app layer.

## Deviations

None.

## Known Issues

This task defines the model only; it does not yet derive continuity items from meeting markdown.

## Files Created/Modified

- `web/lib/types.ts` — added meeting continuity types and assistant context field
- `docs/runbooks/meeting-followup-runbook.md` — aligned runbook language with the new continuity model
