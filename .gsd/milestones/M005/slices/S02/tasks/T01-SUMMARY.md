---
id: T01
parent: S02
milestone: M005
provides:
  - Assistant-page intervention-first framing aligned to the Director-of-Products daily model
key_files:
  - web/app/assistant/page.tsx
key_decisions:
  - Preserve the assistant page’s capabilities while changing its semantic hierarchy to match `/today`
patterns_established:
  - Richer assistant surfaces should extend the intervention model, not introduce a second planning vocabulary
observability_surfaces:
  - `/assistant` headings and visible section labels
  - `web/app/assistant/page.tsx`
duration: 45m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Rework assistant page headings and daily-brief framing

**Aligned the assistant page’s top-level framing to the intervention-first Director-of-Products model.**

## What Happened

The top hero and key sections on `/assistant` were renamed and reworded so the page now reads as a continuation of the daily intervention model introduced on `/today`. The page now leads with `Director intervention workspace` and `Daily intervention brief and action queue`, while the supporting sections were updated to `Weekly operating signal`, `Intervention alerts`, `Today's intervention candidates`, `Committed action queue`, and `Risk and drift requiring attention`.

These changes preserve the assistant page’s existing capabilities and data flows, but remove the semantic disconnect between the richer assistant surface and the now-aligned Today page.

## Verification

- `cd web && npm run typecheck`
- Visual inspection of updated `web/app/assistant/page.tsx`

## Diagnostics

Future agents should inspect the top render sections of `web/app/assistant/page.tsx` first when changing assistant-surface hierarchy or terminology.

## Deviations

None.

## Known Issues

This task intentionally changes headings and supporting copy only; it does not yet deepen the assistant ranking or context logic.

## Files Created/Modified

- `web/app/assistant/page.tsx` — intervention-first assistant headings and supporting copy
