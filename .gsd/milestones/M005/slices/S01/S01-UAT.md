# S01: Daily intervention brief UI alignment — UAT

**Milestone:** M005
**Written:** 2026-03-14

## UAT Type

- UAT mode: mixed
- Why this mode is sufficient: this slice needed both code-level verification and live browser proof on the running app.

## Preconditions

- The web app is running locally.
- The `/today` page has task, status, and goals data available.
- Browser verification targets the actual dev-server port used by Next.js.

## Smoke Test

Open `/today` and confirm the page leads with `Director intervention brief` and `Today's Three` instead of generic execution-priority language.

## Test Cases

### 1. Primary daily brief hierarchy

1. Open `/today` in the running app.
2. Confirm the hero copy references `Director intervention brief`.
3. Confirm the main section heading is `Today's Three`.
4. **Expected:** The page reads as a role-specific daily brief, not a generic task dashboard.

### 2. Intervention support sections

1. On `/today`, inspect the secondary sections.
2. Confirm `Blockers that may need intervention` is visible.
3. Confirm `Operating-goal signal` is visible.
4. **Expected:** The page surfaces both blocker visibility and goal context in intervention-oriented language.

### 3. Role-aware task semantics

1. Inspect the top three cards.
2. Confirm each item has explanatory copy beyond title/priority metadata.
3. **Expected:** The page gives a lightweight explanation of why the item matters now and what kind of operating-goal support it likely provides.

## Edge Cases

### Local port collision

1. If `http://localhost:3000` shows the wrong app, inspect the dev-server output.
2. **Expected:** The correct app URL can be recovered from the Next.js server highlights (in this run it was `http://localhost:3001`).

## Failure Signals

- `/today` still says `Top 3 execution priorities`.
- The intervention or blocker sections are missing.
- The page renders but has no role-aware reasoning copy.
- Browser verification hits the wrong local app due to port collision.

## Requirements Proved By This UAT

- R001 — proves the web app now has a visible daily intervention brief surface.
- R003 — proves blocker visibility is part of the primary daily page in intervention-oriented language.

## Not Proven By This UAT

- No assistant-surface alignment is proven.
- No deeper intervention-ranking engine is proven.

## Notes for Tester

This slice intentionally prioritizes truthful UI alignment over deeper scoring changes. The next slices should preserve the new daily language while extending it into richer assistant/control-tower flows.
