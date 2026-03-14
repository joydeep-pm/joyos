# M006: Meeting intelligence and follow-up orchestration — Summary

## Outcome

M006 made meetings a first-class execution input for the Director-of-Products Personal OS. The repo now has:
- a durable meeting-to-artifact contract
- a rebuildable continuity layer derived from meeting markdown
- a visible assistant-side review surface for unresolved meeting commitments

This means meetings no longer have to remain static notes. They can now be interpreted as durable follow-up inputs that survive into the operating graph and can be reviewed later.

## What Shipped

### S01 — Meeting-to-artifact markdown contract
- explicit workflow for turning one meeting into tasks, blockers, feature-request updates, people-note updates, learnings, and leadership inputs
- dedicated runbook
- synthetic input/output examples
- Granola integration docs aligned to the same contract

### S02 — Meeting continuity integration
- `MeetingContinuityItem` data model
- rebuildable extraction from `Knowledge/Meetings/` and `Knowledge/Transcripts/`
- assistant-context integration via `meetingContinuity`
- `openMeetingCommitments` stats surface
- focused extractor and context-integration tests

### S03 — Visible review of unresolved meeting commitments
- `/assistant` meeting continuity review panel
- concise presenter seam for meeting-derived review items
- focused UI tests for populated and empty states
- updated assistant page alignment coverage

## Verification

- `cd web && npm run typecheck`
- `cd web && npm run test -- --run tests/assistant/meeting-continuity.test.ts tests/assistant/context-engine-meeting-integration.test.ts`
- `cd web && npm run test -- --run tests/assistant-page-alignment.test.tsx tests/assistant/meeting-continuity-review-ui.test.tsx`

## Key Decisions

- Kept markdown canonical and treated meeting continuity as rebuildable derived state.
- Reused `AssistantContext` instead of creating a new meeting-state subsystem.
- Reused `/assistant` as the visible review surface instead of adding a new route.
- Kept the meeting review UI concise and intervention-first rather than note-browser oriented.

## Limitations

- Parsing still depends on reasonably consistent heading structure in meeting markdown.
- Routing targets are inferred heuristically.
- The visible review surface is read-only.

## Recommended Next Moves

- Add lightweight actions from the meeting review panel: create task draft, open feature-request note, or jump to linked artifacts.
- Consider surfacing the single highest-risk meeting-derived open loop on `/today`.
- Consider stronger explicit linking conventions between meetings and durable target notes.
