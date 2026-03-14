---
id: T01
parent: S03
milestone: M005
provides:
  - Shared intervention presentation helpers consumed by both `/today` and `/assistant`
key_files:
  - web/lib/intervention-presenters.ts
  - web/app/today/page.tsx
  - web/app/assistant/page.tsx
key_decisions:
  - Introduce a lightweight shared presenter seam instead of inventing a new backend contract for the first cross-surface consistency step
patterns_established:
  - Shared daily-surface semantics should live in a small presentation helper when current data is already sufficient
observability_surfaces:
  - `web/lib/intervention-presenters.ts`
  - visible reasoning strings on Today and Assistant pages
duration: 45m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Extract shared intervention-candidate presentation helpers

**Extracted a shared intervention presentation seam and wired both daily surfaces to it.**

## What Happened

A new module, `web/lib/intervention-presenters.ts`, now owns the lightweight presentation logic for intervention candidates. It exposes helpers for task-based candidates, assistant brief outcomes, and blocked tasks. `/today` and `/assistant` were both refactored to consume this shared seam where they previously relied on page-local semantic strings.

This reduces drift between the two aligned daily surfaces while staying grounded in the existing data contracts.

## Verification

- `cd web && npm run typecheck`
- Diff review across `web/lib/intervention-presenters.ts`, `web/app/today/page.tsx`, and `web/app/assistant/page.tsx`

## Diagnostics

Future agents should read `web/lib/intervention-presenters.ts` first when changing intervention semantics across daily surfaces.

## Deviations

None.

## Known Issues

The shared seam is still presentation-level logic; it is not a unified intervention-ranking engine.

## Files Created/Modified

- `web/lib/intervention-presenters.ts` — shared intervention presentation helpers
- `web/app/today/page.tsx` — updated to consume the shared seam
- `web/app/assistant/page.tsx` — updated to consume the shared seam for candidate semantics
