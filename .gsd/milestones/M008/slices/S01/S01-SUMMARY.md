---
id: S01
parent: M008
milestone: M008
provides:
  - Primary navigation that foregrounds Today and Assistant while renaming the legacy intervention entry to Control Tower
requires:
  - slice: none
    provides: none
affects:
  - S02
  - S03
key_files:
  - web/components/nav.tsx
  - web/tests/nav-route-coherence.test.tsx
key_decisions:
  - Keep /intervention reachable but relabel it as Control Tower so it no longer competes as the default daily surface
patterns_established:
  - Navigation IA changes should be proven with a small targeted route-coherence test instead of inferred from manual inspection
observability_surfaces:
  - web/tests/nav-route-coherence.test.tsx
drill_down_paths:
  - web/components/nav.tsx
  - web/tests/nav-route-coherence.test.tsx
duration: 15m
verification_result: passed
completed_at: 2026-03-15
---

# S01: Promote Today and Assistant in primary navigation

**Primary navigation now foregrounds Today and Assistant and de-emphasizes the legacy intervention route as Control Tower.**

## What Happened

The primary nav already matched the intended director workflow: `Today` and `Assistant` are first-class nav items, while the legacy `/intervention` route remains available as `Control Tower` instead of competing as the main entry point.

Rather than changing working code, this slice was closed by verifying the existing navigation contract and recording it in GSD artifacts.

## Verification

- `cd web && npm run test -- --run tests/nav-route-coherence.test.tsx`

## Limitations

- This slice only proves primary-nav positioning, not full browser-route discovery across all surfaces.

## Follow-up

- Record the `/today` landing behavior under S02 and then decide whether M008 still needs any additional browser-only proof beyond the existing route-coherence test.
