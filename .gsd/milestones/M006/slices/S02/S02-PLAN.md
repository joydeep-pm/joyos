# S02: Meeting continuity integration

**Goal:** Connect meeting-derived outputs to the broader operating graph through a small, inspectable local-first continuity layer so unresolved meeting commitments can survive beyond the note itself.
**Demo:** Given meeting markdown inputs, the repo can derive structured continuity signals that identify open meeting commitments, linked artifacts, and suggested routing targets for tasks, people notes, feature requests, or learnings.

## Must-Haves

- Define a minimal structured model for meeting-derived continuity signals.
- Build a local-first derivation path from meeting markdown into inspectable structured output.
- Keep markdown canonical; derived continuity state must be rebuildable.
- Connect continuity signals into an existing assistant/app seam so they are part of the operating graph rather than isolated docs.
- Verify that unresolved meeting commitments can be inspected consistently.

## Proof Level

- This slice proves: integration
- Real runtime required: yes, but local-only
- Human/UAT required: no

## Verification

- `cd web && npm run typecheck`
- `cd web && npm run test -- --run tests/assistant/meeting-continuity*.test.ts tests/assistant/context-engine*.test.ts`
- `rg -n "meeting continuity|meeting commitment|open meeting|linkedArtifacts|meeting-derived" web/lib web/tests .gsd/milestones/M006/slices/S02`

## Observability / Diagnostics

- Runtime signals: rebuildable derived meeting continuity output
- Inspection surfaces: continuity index/cache file, assistant context output, focused tests
- Failure visibility: missing links, bad parsing, or dropped commitments visible in continuity output and tests
- Redaction constraints: synthetic examples only; no real meeting content

## Integration Closure

- Upstream surfaces consumed: `Knowledge/Meetings/`, `Knowledge/Transcripts/`, meeting-followup contract, assistant context engine
- New wiring introduced in this slice: derived meeting continuity signals and assistant-facing integration
- What remains before the milestone is truly usable end-to-end: a visible review surface for unresolved meeting commitments in S03

## Tasks

- [x] **T01: Define the meeting continuity data model and derivation rules** `est:45m`
  - Why: S01 defined the contract, but the repo still lacks a structured object for unresolved meeting commitments that can be inspected later.
  - Files: `web/lib/types.ts`, `web/lib/assistant/context-engine.ts`, `docs/runbooks/meeting-followup-runbook.md`
  - Do: Add types and derivation rules for meeting-derived commitments, linked artifacts, ambiguity flags, and routing targets.
  - Verify: `rg -n "MeetingContinuity|meeting commitment|routingTargets|ambiguity" web/lib/types.ts web/lib/assistant/context-engine.ts docs/runbooks/meeting-followup-runbook.md`
  - Done when: The repo has a clear, minimal model for rebuildable meeting continuity signals.

- [x] **T02: Implement rebuildable meeting continuity extraction from markdown inputs** `est:55m`
  - Why: The continuity model needs a concrete local-first derivation path from meeting markdown files, not just types.
  - Files: `web/lib/assistant/context-engine.ts`, `web/lib/assistant/storage.ts`, `examples/example_files/meeting-note-example.md`
  - Do: Parse meeting-related markdown into derived continuity signals, including unresolved commitments and linked artifact hints, and make the output rebuildable.
  - Verify: `cd web && npm run test -- --run tests/assistant/meeting-continuity*.test.ts`
  - Done when: Given representative meeting markdown, the system produces inspectable continuity data.

- [x] **T03: Thread meeting continuity into assistant context and diagnostics** `est:40m`
  - Why: The meeting-derived signals only matter if they join the broader operating graph and can be inspected downstream.
  - Files: `web/lib/types.ts`, `web/lib/assistant/context-engine.ts`, `web/tests/assistant/context-engine*.test.ts`
  - Do: Expose the continuity signals through the assistant context surface and add focused tests for unresolved meeting commitments.
  - Verify: `cd web && npm run test -- --run tests/assistant/context-engine*.test.ts tests/assistant/meeting-continuity*.test.ts`
  - Done when: Assistant context can carry meeting-derived continuity signals in a stable, testable way.

## Files Likely Touched

- `web/lib/types.ts`
- `web/lib/assistant/context-engine.ts`
- `docs/runbooks/meeting-followup-runbook.md`
- `web/tests/assistant/meeting-continuity.test.ts`
- `web/tests/assistant/context-engine.test.ts`
