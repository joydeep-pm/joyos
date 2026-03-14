---
id: T02
parent: S01
milestone: M008
provides:
  - A home redirect aligned to the intended daily starting surface
key_files:
  - web/app/page.tsx
key_decisions:
  - `/today` is the correct landing route for the current director operating model
patterns_established:
  - Home route should lead to the shortest path to daily action, not a legacy specialist surface
observability_surfaces:
  - root redirect behavior
  - `web/app/page.tsx`
duration: 20m
verification_result: passed
completed_at: 2026-03-15
blocker_discovered: false
---

# T02: Redirect home to Today and preserve legacy Intervention as secondary

**Changed the app landing route so users start on Today instead of the older Intervention screen.**

## What Happened

The root app route now redirects to `/today`. This aligns first-open behavior with the current daily operating model and reduces the chance that users land on the legacy intervention brief by default.

## Verification

- Direct read of `web/app/page.tsx`
- Redirect expectation covered in `tests/nav-route-coherence.test.tsx`

## Diagnostics

Route coherence is now visible both in code and through the focused nav/redirect test.

## Deviations

None.

## Known Issues

This task changes the default landing route only; it does not yet decide the long-term fate of `/intervention`.

## Files Created/Modified

- `web/app/page.tsx` — root redirect changed from `/intervention` to `/today`
