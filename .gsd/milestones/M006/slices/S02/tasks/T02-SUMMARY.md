---
id: T02
parent: S02
milestone: M006
provides:
  - Rebuildable extraction of meeting continuity items from local meeting/transcript markdown
key_files:
  - web/lib/assistant/context-engine.ts
  - web/tests/assistant/meeting-continuity.test.ts
key_decisions:
  - Meeting continuity should be derived directly from markdown headings and bullets so the output remains rebuildable from canonical notes
patterns_established:
  - `Knowledge/Meetings/` and `Knowledge/Transcripts/` now feed a shared continuity extractor that emits open commitments, blockers, open questions, routing targets, and source type
observability_surfaces:
  - `context.meetingContinuity`
  - `tests/assistant/meeting-continuity.test.ts`
duration: 55m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Implement rebuildable meeting continuity extraction from markdown inputs

**Implemented the first real derivation path from meeting markdown into assistant-facing continuity signals.**

## What Happened

The assistant context engine now scans `Knowledge/Meetings/` and `Knowledge/Transcripts/`, parses key sections such as attendees, decisions, action items, blockers, and open questions, and emits structured `MeetingContinuityItem` objects.

This output remains rebuildable because it is derived directly from markdown rather than stored as a second canonical data source. A focused test file was added to prove the behavior on synthetic meeting-note and transcript inputs.

## Verification

- `cd web && npm run test -- --run tests/assistant/meeting-continuity.test.ts`

## Diagnostics

The best inspection surface is now `context.meetingContinuity`, backed by the dedicated meeting continuity test coverage.

## Deviations

A parsing bug in section extraction was found and fixed during verification when `Open Questions` at end-of-file were not being captured.

## Known Issues

The extractor currently relies on simple heading and bullet conventions, so unusually formatted meeting notes may require normalization in a later slice.

## Files Created/Modified

- `web/lib/assistant/context-engine.ts` — added meeting continuity parsing and derivation
- `web/tests/assistant/meeting-continuity.test.ts` — focused tests for meeting-note and transcript extraction
