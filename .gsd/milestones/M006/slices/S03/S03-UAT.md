# S03: Visible review of unresolved meeting commitments — UAT

**Milestone:** M006
**Written:** 2026-03-14

## UAT Type

- UAT mode: UI contract verification
- Why this mode is sufficient: this slice adds a visible assistant review surface backed by already-tested assistant context derivation.

## Preconditions

- Meeting continuity is present in assistant context.
- The assistant page includes the review panel.

## Smoke Test

Render `/assistant` with meeting continuity data and confirm the page shows a `Meeting continuity review` section.

## Test Cases

### 1. Populated meeting review state

1. Run `cd web && npm run test -- --run tests/assistant/meeting-continuity-review-ui.test.tsx`.
2. **Expected:** The populated-state test proves the assistant page shows the open commitment count, meeting title, blocker cue, ambiguity cue, and suggested route.

### 2. Empty meeting review state

1. Run `cd web && npm run test -- --run tests/assistant/meeting-continuity-review-ui.test.tsx`.
2. **Expected:** The empty-state test proves the panel stays visible and truthful when no unresolved meeting commitments exist.

### 3. Assistant workspace alignment

1. Run `cd web && npm run test -- --run tests/assistant-page-alignment.test.tsx`.
2. **Expected:** The assistant page still matches the intended intervention-workspace shape and includes the meeting review section.

### 4. Type-safe integration

1. Run `cd web && npm run typecheck`.
2. **Expected:** The expanded assistant context shape is accepted by the repo without type errors.

## Edge Cases

### Ambiguous continuity item

1. Inspect the populated-state fixture in `tests/assistant/meeting-continuity-review-ui.test.tsx`.
2. **Expected:** Ambiguous items show both summary and ambiguity cue instead of being hidden.

## Failure Signals

- The assistant page omits the meeting review section entirely.
- Meeting continuity data exists but does not render actionable cues.
- Older page tests fail because assistant context fixtures drift from the real shape.

## Requirements Proved By This UAT

- R001 — proves unresolved meeting commitments are now visible in the assistant intervention workspace.
- R003 — proves meeting-derived blockers and ambiguity can be reviewed later.
- R008 — proves the review surface remains driven by markdown-derived local context.

## Not Proven By This UAT

- No direct mutation actions from the panel are proven.
- No browser/manual walkthrough is required because the UI contract is covered by tests.

## Notes for Tester

M006 is complete when this slice passes because the milestone now has all three required layers: contract, continuity integration, and visible review.
