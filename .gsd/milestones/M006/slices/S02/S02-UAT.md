# S02: Meeting continuity integration — UAT

**Milestone:** M006
**Written:** 2026-03-14

## UAT Type

- UAT mode: local integration verification
- Why this mode is sufficient: this slice proves derived continuity signals and assistant-context integration rather than a final user-facing review surface.

## Preconditions

- Meeting continuity types and extraction are implemented.
- The focused assistant tests exist.

## Smoke Test

Run the assistant-context rebuild against a workspace containing at least one meeting note and confirm the context output now includes `meetingContinuity`.

## Test Cases

### 1. Meeting-note extraction

1. Run `cd web && npm run test -- --run tests/assistant/meeting-continuity.test.ts`.
2. **Expected:** The test proves open commitments, blockers, open questions, ambiguity, and routing targets are derived from a synthetic meeting note.

### 2. Assistant-context integration

1. Run `cd web && npm run test -- --run tests/assistant/context-engine-meeting-integration.test.ts`.
2. **Expected:** The test proves meeting continuity appears inside `AssistantContext` and contributes to `openMeetingCommitments` stats.

### 3. Type-safe repo integration

1. Run `cd web && npm run typecheck`.
2. **Expected:** Existing assistant/UI fixtures accept the expanded context shape without type errors.

## Edge Cases

### Transcript input

1. Read `tests/assistant/meeting-continuity.test.ts`.
2. **Expected:** Transcript files under `Knowledge/Transcripts/` are classified as `sourceType: "transcript"`.

### Ambiguous meeting data

1. Read the meeting continuity expectations in `tests/assistant/meeting-continuity.test.ts`.
2. **Expected:** Open questions and ambiguous wording keep the item visible as ambiguous instead of resolved.

## Failure Signals

- Assistant context does not include `meetingContinuity`.
- Open meeting commitments are silently dropped from the derived output.
- Typecheck fails because shared fixtures or consumers were not updated.

## Requirements Proved By This UAT

- R001 — proves meeting-derived commitments can now reach an assistant-visible operating surface.
- R003 — proves meeting blockers can survive beyond the note as inspectable derived state.
- R008 — proves the integration remains markdown-first and rebuildable.

## Not Proven By This UAT

- No visible end-user review screen is proven yet.
- No writeback or official-system integration is proven.

## Notes for Tester

This slice intentionally stops at assistant-context integration. S03 should make these continuity items visible in a concrete review flow.
