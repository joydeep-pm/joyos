---
id: T02
parent: S03
milestone: M005
provides:
  - Direct test coverage for the shared intervention presenter seam plus preserved page-level semantic coverage
key_files:
  - web/tests/intervention-presenters.test.ts
  - web/tests/today-page.test.tsx
  - web/tests/assistant-page-alignment.test.tsx
key_decisions:
  - Test the shared helper directly while keeping the page-level alignment tests green
patterns_established:
  - Shared presentation seams need both unit coverage and page-level semantic regression coverage
observability_surfaces:
  - `tests/intervention-presenters.test.ts`
  - `tests/today-page.test.tsx`
  - `tests/assistant-page-alignment.test.tsx`
duration: 35m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Add focused coverage for the shared seam

**Added direct tests for the shared intervention presenter and preserved both aligned page tests.**

## What Happened

A new test file, `web/tests/intervention-presenters.test.ts`, now covers the shared presenter helpers directly for task candidates, brief outcomes, and blocked tasks. After the refactor, both existing page-level tests (`today-page.test.tsx` and `assistant-page-alignment.test.tsx`) were rerun and remained green, proving the new seam preserved the visible semantics on both pages.

## Verification

- `cd web && npm run test -- --run tests/intervention-presenters.test.ts tests/today-page.test.tsx tests/assistant-page-alignment.test.tsx`
- `cd web && npm run typecheck`

## Diagnostics

Future agents should run all three tests together when changing intervention semantics across `/today` and `/assistant`.

## Deviations

None.

## Known Issues

The test coverage proves presentation consistency, not deeper ranking consistency beyond the current page inputs.

## Files Created/Modified

- `web/tests/intervention-presenters.test.ts` — direct coverage for the shared presenter seam
- `web/tests/today-page.test.tsx` — preserved semantic coverage after refactor
- `web/tests/assistant-page-alignment.test.tsx` — preserved semantic coverage after refactor
