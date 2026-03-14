---
id: T01
parent: S01
milestone: M008
provides:
  - A primary nav model that foregrounds Today and Assistant instead of the legacy Intervention route
key_files:
  - web/components/nav.tsx
key_decisions:
  - Today and Assistant are the primary daily workflow surfaces and should occupy the highest-visibility nav slots
patterns_established:
  - Legacy specialist routes can remain available without occupying primary navigation
observability_surfaces:
  - top navigation UI
  - `web/components/nav.tsx`
duration: 30m
verification_result: passed
completed_at: 2026-03-15
blocker_discovered: false
---

# T01: Update the primary nav model to foreground Today and Assistant

**Reworked the top navigation to match the current director operating model.**

## What Happened

The primary navigation was updated so users now see `Today` and `Assistant` first, followed by the supporting workflow surfaces `Grooming`, `People`, and `Settings`. The legacy `Intervention` route was removed from the primary nav so it stops competing as the main entrypoint.

## Verification

- `rg -n "Today|Assistant|Intervention" web/components/nav.tsx`

## Diagnostics

The top nav now reflects the intended route hierarchy directly, making discovery failures immediately visible in the UI.

## Deviations

None.

## Known Issues

`/intervention` still exists as a route by design; this task only de-emphasized it from primary nav.

## Files Created/Modified

- `web/components/nav.tsx` — primary nav updated to foreground Today and Assistant
