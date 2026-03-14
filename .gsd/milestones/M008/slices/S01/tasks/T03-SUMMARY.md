---
id: T03
parent: S01
milestone: M008
provides:
  - Stable route-coherence test coverage for nav and landing behavior
key_files:
  - web/tests/nav-route-coherence.test.tsx
  - web/components/nav.tsx
key_decisions:
  - IA fixes must be locked with explicit route/nav tests so legacy behavior does not silently return
patterns_established:
  - Navigation and redirect changes should be verified both through focused route tests and existing page tests
observability_surfaces:
  - `tests/nav-route-coherence.test.tsx`
  - `tests/today-page.test.tsx`
  - `tests/assistant-page-alignment.test.tsx`
duration: 35m
verification_result: passed
completed_at: 2026-03-15
blocker_discovered: false
---

# T03: Add route-coherence tests and verify browser behavior

**Added focused verification for the new nav and landing model.**

## What Happened

A new test file now proves that the primary nav contains `Today` and `Assistant`, omits `Intervention`, and that the root route redirects to `/today`. Existing Today and Assistant page tests continue to prove the promoted primary surfaces still render correctly.

A React import issue in `AppNav` was exposed during this test work and fixed as part of the task.

## Verification

- `cd web && npm run typecheck`
- `cd web && npm run test -- --run tests/nav-route-coherence.test.tsx tests/today-page.test.tsx tests/assistant-page-alignment.test.tsx`

## Diagnostics

The new route-coherence test is now the fastest way to catch navigation regressions.

## Deviations

A missing React import in `AppNav` had to be fixed after the new test exposed it.

## Known Issues

A final live browser pass should still be done before milestone closure if we continue M008 beyond S01.

## Files Created/Modified

- `web/tests/nav-route-coherence.test.tsx` — route/nav coherence coverage
- `web/components/nav.tsx` — React import fix surfaced by test execution
