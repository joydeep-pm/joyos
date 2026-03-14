# S03: Shared intervention presentation seam — UAT

**Milestone:** M005
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed
- Why this mode is sufficient: this slice introduced a shared presentation refactor that needed direct tests and live browser checks on both affected pages.

## Preconditions

- The Product Control Tower app is running locally on port 3001.
- `/today` and `/assistant` both render current app data.

## Smoke Test

Open both `/today` and `/assistant` and confirm the intervention-first headings still appear after the shared presenter refactor.

## Test Cases

### 1. Shared presenter contract

1. Run `cd web && npm run test -- --run tests/intervention-presenters.test.ts`.
2. **Expected:** The shared presenter semantics for task candidates, brief outcomes, and blockers all pass.

### 2. Today-page continuity

1. Open `/today` in the running app.
2. Confirm `Director intervention brief`, `Today's Three`, and `Operating-goal signal` remain visible.
3. **Expected:** The Today page still reads the same after the shared-seam refactor.

### 3. Assistant-page continuity

1. Open `/assistant` in the running app.
2. Confirm `Director intervention workspace`, `Today's intervention candidates`, and `Risk and drift requiring attention` remain visible.
3. **Expected:** The Assistant page still reads the same after the shared-seam refactor.

## Edge Cases

### Shared-seam drift

1. Change a presenter string in one place.
2. **Expected:** Either the direct presenter test or one of the page-level semantic tests should fail if the semantics drift unexpectedly.

## Failure Signals

- `/today` and `/assistant` start using different language again.
- The presenter tests pass but one of the pages regresses visibly.
- The page-level alignment tests fail after edits to the shared seam.

## Requirements Proved By This UAT

- R001 — proves the two daily surfaces now share a stable intervention-presentation seam.
- R003 — proves blocker/intervention semantics remain visible after the cross-surface refactor.

## Not Proven By This UAT

- No deeper shared ranking engine is proven.
- No additional app surfaces beyond `/today` and `/assistant` are aligned in this slice.

## Notes for Tester

This slice closes the current web-app alignment milestone at the presentation/semantic layer. Future work should only continue if you want deeper shared logic or another surface aligned.
