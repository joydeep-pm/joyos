# S03: Visible review of unresolved meeting commitments

**Goal:** Add a visible assistant review surface for unresolved meeting commitments so Joydeep can inspect meeting-derived open loops instead of losing them in static notes.
**Demo:** The `/assistant` page shows a dedicated meeting continuity review section powered by `AssistantContext.meetingContinuity`, highlighting open commitments, blockers, ambiguity, and next routing targets.

## Must-Haves

- Use the existing assistant context seam; do not invent a parallel page or state system.
- Add a clear visible section for unresolved meeting commitments on `/assistant`.
- Surface intervention cues: open commitments, blockers, ambiguity, and suggested routing targets.
- Keep empty states and low-noise presentation truthful.
- Verify both rendering and data-driven behavior with tests.

## Proof Level

- This slice proves: operational
- Real runtime required: no
- Human/UAT required: no

## Verification

- `cd web && npm run typecheck`
- `cd web && npm run test -- --run tests/assistant-page-alignment.test.tsx tests/assistant/meeting-continuity-review-ui.test.tsx`
- `rg -n "Meeting continuity review|openMeetingCommitments|routingTargets|ambiguity" web/app/assistant/page.tsx web/tests/assistant-page-alignment.test.tsx web/tests/assistant/meeting-continuity-review-ui.test.tsx`

## Observability / Diagnostics

- Runtime signals: assistant context already carries meeting continuity
- Inspection surfaces: `/assistant` meeting continuity panel and focused UI tests
- Failure visibility: empty or missing continuity data becomes visible in the section state and assertions
- Redaction constraints: use synthetic fixture data only in tests

## Integration Closure

- Upstream surfaces consumed: `AssistantContext.meetingContinuity`, assistant page, intervention presenter seam if useful
- New wiring introduced in this slice: visible review section in `/assistant`
- What remains before the milestone is truly usable end-to-end: milestone complete if the panel is visible, focused, and driven by real context data

## Tasks

- [x] **T01: Design the meeting continuity review presentation** `est:35m`
  - Why: The raw continuity data exists, but it needs a focused intervention-oriented presentation before it becomes useful.
  - Files: `web/app/assistant/page.tsx`, `web/lib/intervention-presenters.ts`
  - Do: Define a concise presentation for unresolved meeting commitments, including priority cues for blockers, ambiguity, and routing targets.
  - Verify: `rg -n "Meeting continuity review|routingTargets|ambiguity" web/app/assistant/page.tsx web/lib/intervention-presenters.ts`
  - Done when: The assistant page has a clear rendering strategy for meeting continuity items.

- [x] **T02: Implement the `/assistant` meeting continuity review section** `est:55m`
  - Why: The milestone needs a visible inspection surface, not just backend signals.
  - Files: `web/app/assistant/page.tsx`, `web/lib/intervention-presenters.ts`
  - Do: Render a dedicated section that shows unresolved meeting commitments, blockers, ambiguous items, and suggested routing targets using existing assistant context data.
  - Verify: `cd web && npm run test -- --run tests/assistant/meeting-continuity-review-ui.test.tsx`
  - Done when: Users can inspect meeting-derived open loops directly on `/assistant`.

- [x] **T03: Align assistant-page tests and milestone verification around the new review surface** `est:35m`
  - Why: The visible review path should be proven by the existing assistant alignment checks plus focused UI coverage.
  - Files: `web/tests/assistant-page-alignment.test.tsx`, `web/tests/assistant/meeting-continuity-review-ui.test.tsx`
  - Do: Update assistant page alignment expectations and add specific UI tests for filled and empty meeting continuity states.
  - Verify: `cd web && npm run typecheck && npm run test -- --run tests/assistant-page-alignment.test.tsx tests/assistant/meeting-continuity-review-ui.test.tsx`
  - Done when: The assistant review surface is covered by stable UI tests and passes slice verification.

## Files Likely Touched

- `web/app/assistant/page.tsx`
- `web/lib/intervention-presenters.ts`
- `web/tests/assistant-page-alignment.test.tsx`
- `web/tests/assistant/meeting-continuity-review-ui.test.tsx`
