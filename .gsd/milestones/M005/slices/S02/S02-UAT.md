# S02: Assistant continuity alignment — UAT

**Milestone:** M005
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed
- Why this mode is sufficient: this slice required both focused test coverage and live browser verification on the assistant surface.

## Preconditions

- The Product Control Tower app is running locally on the active dev-server port.
- The assistant APIs return enough data for the main page to render.

## Smoke Test

Open `/assistant` and confirm the page leads with `Director intervention workspace` and `Daily intervention brief and action queue`.

## Test Cases

### 1. Assistant hero continuity

1. Open `/assistant` in the running app.
2. Confirm the hero references `Director intervention workspace`.
3. Confirm the main heading is `Daily intervention brief and action queue`.
4. **Expected:** The page reads like a deeper continuation of the daily intervention model from `/today`.

### 2. Supporting section continuity

1. Inspect the visible section headings on `/assistant`.
2. Confirm these are present:
   - `Weekly operating signal`
   - `Intervention alerts`
   - `Today's intervention candidates`
   - `Committed action queue`
   - `Risk and drift requiring attention`
3. **Expected:** The assistant page uses role-consistent, intervention-first terminology across the visible hierarchy.

### 3. Semantic regression test

1. Run `cd web && npm run test -- --run tests/assistant-page-alignment.test.tsx`.
2. **Expected:** The focused assistant alignment test passes.

## Edge Cases

### Reuse of existing dev server

1. If the app is already running from prior slices, reuse the same local dev process.
2. **Expected:** Assistant verification still works as long as the correct port is used.

## Failure Signals

- `/assistant` still uses generic assistant/execution-only terminology.
- The aligned section headings are missing.
- The focused assistant-page test fails.
- Browser verification shows a mismatched or stale local app.

## Requirements Proved By This UAT

- R001 — proves the intervention-first daily model now reaches the assistant surface.
- R003 — proves alerts/risk sections are framed as intervention support, not disconnected assistant metadata.

## Not Proven By This UAT

- No deeper shared ranking or assistant-engine logic is proven.
- No additional app surfaces beyond `/assistant` are aligned in this slice.

## Notes for Tester

This slice prioritizes continuity of meaning and hierarchy. The next slice should probably focus on either shared logic between `/today` and `/assistant` or another aligned UI surface, rather than just more copy changes.
