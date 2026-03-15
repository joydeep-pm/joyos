---
id: S02
parent: M008
milestone: M008
provides:
  - Home route landing behavior that starts users in Today and keeps /intervention secondary
requires:
  - slice: S01
    provides: Primary nav foregrounds Today and Assistant
affects:
  - S03
key_files:
  - web/app/page.tsx
  - web/tests/nav-route-coherence.test.tsx
key_decisions:
  - Today is the default landing route for the daily operating model
patterns_established:
  - Root-route IA changes should be validated through explicit redirect assertions
observability_surfaces:
  - web/tests/nav-route-coherence.test.tsx
drill_down_paths:
  - web/app/page.tsx
  - web/tests/nav-route-coherence.test.tsx
duration: 10m
verification_result: passed
completed_at: 2026-03-15
---

# S02: Make Today the landing route and de-emphasize legacy Intervention

**The home route already redirects to Today, so the app now opens on the intended daily starting surface.**

## What Happened

The root route already redirected to `/today`, which matches the M008 recommendation that Today become the default daily landing surface. `/intervention` remains available as a secondary route and is no longer the home behavior.

This slice was closed by verifying the existing redirect contract and documenting it in GSD artifacts instead of making redundant code changes.

## Verification

- `cd web && npm run test -- --run tests/nav-route-coherence.test.tsx`

## Limitations

- This slice does not add browser-run evidence yet; it proves route behavior at the test level.

## Follow-up

- Decide whether S03 should add browser/UAT proof only, or whether the existing route-coherence test is sufficient to close the milestone.
