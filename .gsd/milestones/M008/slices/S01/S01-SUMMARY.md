---
id: S01
parent: M008
milestone: M008
provides:
  - A coherent primary nav and landing route aligned to the new director workflow surfaces
requires:
  - slice: none
    provides: none
affects:
  - S02
  - S03
key_files:
  - web/components/nav.tsx
  - web/app/page.tsx
  - web/tests/nav-route-coherence.test.tsx
key_decisions:
  - Promote Today and Assistant as the primary entrypoints while keeping legacy Intervention available but secondary
patterns_established:
  - Route/IA changes should be verified with focused nav/redirect tests, not only visual inspection
observability_surfaces:
  - top nav UI
  - `/` redirect behavior
  - `tests/nav-route-coherence.test.tsx`
  - `tests/today-page.test.tsx`
  - `tests/assistant-page-alignment.test.tsx`
drill_down_paths:
  - .gsd/milestones/M008/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M008/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M008/slices/S01/tasks/T03-SUMMARY.md
duration: 1.5h
verification_result: passed
completed_at: 2026-03-15
---

# S01: Promote Today and Assistant in primary navigation

**Made the current director workflow discoverable by fixing the top nav and default landing route.**

## What Happened

The primary navigation now foregrounds `Today` and `Assistant`, followed by `Grooming`, `People`, and `Settings`. The legacy `Intervention` page was removed from primary nav so it no longer competes as the main workflow entrypoint.

The root route was also changed to redirect to `/today`, ensuring that the app opens on the intended daily starting surface.

Focused route-coherence tests were added to prove the nav model and landing behavior, and a React import issue in the nav component was fixed as part of that test work.

## Verification

- `cd web && npm run typecheck`
- `cd web && npm run test -- --run tests/nav-route-coherence.test.tsx tests/today-page.test.tsx tests/assistant-page-alignment.test.tsx`

## Requirements Advanced

- R001 — improved daily intervention quality by making the right surfaces discoverable first.
- R008 — improved route clarity and inspectability by aligning nav and home behavior with the actual operating model.

## Requirements Validated

- Users can now discover Today and Assistant through primary navigation without knowing hidden routes.

## New Requirements Surfaced

- S02 should decide how the legacy `/intervention` route should remain reachable: hidden-only, linked secondarily, or explicitly labeled as legacy/control-tower view.

## Requirements Invalidated or Re-scoped

- none.

## Deviations

A missing React import in `AppNav` was discovered during testing and fixed.

## Known Limitations

- `/intervention` still exists and can still be visited directly.
- No secondary discoverability pattern for legacy Intervention exists yet.

## Follow-ups

- Decide whether `/intervention` should become a secondary utility link, a renamed specialist page, or an eventual redirect.
- Browser-verify final route discovery if S02/S03 continue immediately.

## Files Created/Modified

- `web/components/nav.tsx` — new primary nav model
- `web/app/page.tsx` — root redirect to `/today`
- `web/tests/nav-route-coherence.test.tsx` — focused nav/redirect coverage

## Forward Intelligence

### What the next slice should know
- The biggest source of confusion is already reduced; users now land in the right place and see the right primary links.

### What's fragile
- Direct bookmarks to `/intervention` will still bypass the new IA until the route is de-emphasized further.

### Authoritative diagnostics
- `tests/nav-route-coherence.test.tsx` is the fastest check for whether the IA stayed coherent.

### What assumptions changed
- Original assumption: nav cleanup would be a purely cosmetic change.
- What actually happened: it corrected the core route-discovery failure that caused users to miss the new workflow entirely.
