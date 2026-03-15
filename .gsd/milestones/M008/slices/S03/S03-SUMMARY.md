---
id: S03
parent: M008
milestone: M008
provides:
  - Operational proof that Today and Assistant are discoverable from primary navigation and that Control Tower preserves legacy intervention access without remaining the default surface
requires:
  - slice: S01
    provides: Primary nav foregrounds Today and Assistant
  - slice: S02
    provides: Home route lands on Today
affects:
  - none
key_files:
  - web/tests/nav-route-coherence.test.tsx
  - web/components/nav.tsx
  - web/app/page.tsx
  - .gsd/milestones/M008/slices/S03/S03-UAT.md
key_decisions:
  - Treat S03 as a verification-only slice because the shipped nav and landing behavior already matched the milestone contract
patterns_established:
  - If the code already satisfies the slice contract, close the slice with targeted automated proof plus one browser pass instead of inventing redundant implementation work
observability_surfaces:
  - web/tests/nav-route-coherence.test.tsx
  - browser verification on http://localhost:3004
drill_down_paths:
  - web/tests/nav-route-coherence.test.tsx
  - .gsd/milestones/M008/slices/S03/S03-UAT.md
duration: 20m
verification_result: passed
completed_at: 2026-03-15
---

# S03: Verify coherent discovery across nav and routes

**Verified that the app lands on Today, exposes Today and Assistant in primary nav, and keeps the legacy intervention surface reachable as Control Tower.**

## What Happened

S03 closed M008 through verification rather than new implementation. The shipped nav and landing behavior already matched the intended director operating model, so the slice focused on proving that behavior explicitly.

Targeted automated proof confirmed that primary nav exposes `Today`, `Assistant`, and `Control Tower`, and that the home route redirects to `/today`. A live browser pass against the local app on port 3004 then confirmed the real user flow: landing on Today, navigating to Assistant, and reaching the legacy intervention surface through Control Tower.

## Verification

- `cd web && npm run test -- --run tests/nav-route-coherence.test.tsx`
- Browser verification on `http://localhost:3004`:
  - `/` landed on `/today`
  - nav showed `Today`, `Assistant`, and `Control Tower`
  - `Assistant` navigated to `/assistant`
  - `Control Tower` navigated to `/intervention`

## Limitations

- This slice proves route coherence and discoverability only; it does not redesign the legacy intervention page.

## Follow-up

- none
