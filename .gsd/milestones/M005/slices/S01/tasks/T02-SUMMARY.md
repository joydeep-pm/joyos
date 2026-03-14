---
id: T02
parent: S01
milestone: M005
provides:
  - Passing focused semantic coverage for the intervention-first Today page plus shared JSX runtime fixes
key_files:
  - web/tests/today-page.test.tsx
  - web/app/today/page.tsx
  - web/components/ui.tsx
key_decisions:
  - Lock the Today page semantics with a focused test before broadening the daily-surface alignment work
patterns_established:
  - New UI alignment slices should add narrow semantic coverage tied to role-specific headings and sections
observability_surfaces:
  - `tests/today-page.test.tsx`
  - Vitest failure output for missing semantic sections or JSX runtime issues
duration: 30m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Add role-aware reasoning text for top items and blockers

**Added focused semantic test coverage for the Today page and fixed JSX runtime issues exposed by the test path.**

## What Happened

A new focused test file, `web/tests/today-page.test.tsx`, now verifies that the Today page renders the intervention-first daily brief with Today’s Three, the blocker section, and the operating-goal signal. While stabilizing this path, two JSX runtime issues surfaced under Vitest because `React` was not imported in `web/app/today/page.tsx` and `web/components/ui.tsx`. Those imports were added so the semantic test path is now stable.

## Verification

- `cd web && npm run test -- --run tests/today-page.test.tsx`
- `cd web && npm run typecheck`

## Diagnostics

Future agents should run `tests/today-page.test.tsx` first when changing the Today page hierarchy. It now catches both missing role-specific UI semantics and JSX runtime regressions in the shared badge components used by the page.

## Deviations

None.

## Known Issues

The reasoning copy is still heuristic and based on current task fields; it is not yet a dedicated intervention-ranking engine.

## Files Created/Modified

- `web/tests/today-page.test.tsx` — focused semantic coverage for the Today page
- `web/app/today/page.tsx` — React import fix and role-aware page semantics
- `web/components/ui.tsx` — React import fix for shared badge rendering in tests
