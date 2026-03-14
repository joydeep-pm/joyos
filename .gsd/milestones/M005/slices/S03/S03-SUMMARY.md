---
id: S03
parent: M005
milestone: M005
provides:
  - A shared intervention presentation seam that keeps `/today` and `/assistant` semantically aligned
requires:
  - slice: S01
    provides: aligned Today page intervention hierarchy
  - slice: S02
    provides: aligned Assistant page intervention hierarchy
affects:
  - none
key_files:
  - web/lib/intervention-presenters.ts
  - web/app/today/page.tsx
  - web/app/assistant/page.tsx
  - web/tests/intervention-presenters.test.ts
key_decisions:
  - Use a small shared presentation seam to reduce cross-surface drift before introducing any heavier ranking or backend work
patterns_established:
  - When two daily surfaces share semantics, the presentation layer should be centralized and covered directly by tests
observability_surfaces:
  - `web/lib/intervention-presenters.ts`
  - `tests/intervention-presenters.test.ts`
  - browser assertions on `/today` and `/assistant`
  - .gsd/milestones/M005/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M005/slices/S03/tasks/T02-SUMMARY.md
  - .gsd/milestones/M005/slices/S03/tasks/T03-SUMMARY.md
drill_down_paths:
  - .gsd/milestones/M005/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M005/slices/S03/tasks/T02-SUMMARY.md
  - .gsd/milestones/M005/slices/S03/tasks/T03-SUMMARY.md
duration: 2h
verification_result: passed
completed_at: 2026-03-14
---

# S03: Shared intervention presentation seam

**Reduced drift between `/today` and `/assistant` by extracting a shared intervention presenter seam, adding direct tests, and browser-checking both aligned daily surfaces.**

## What Happened

S01 and S02 aligned the Today and Assistant surfaces conceptually, but their semantics still lived in separate page-local logic. This slice fixed that by extracting a shared presentation seam into `web/lib/intervention-presenters.ts`.

The new helper module centralizes lightweight presentation semantics for task-based intervention candidates, assistant brief outcomes, and blocked tasks. `/today` now uses it for top-candidate reasoning and blocker messaging, while `/assistant` uses it for intervention-candidate reasoning and goal-signal display. This keeps both daily surfaces consistent without inventing a new backend contract or pretending the app has a deeper shared ranking engine than it really does.

The shared seam was then covered directly with unit tests, and both page-level semantic tests remained green after the refactor. Finally, both `/today` and `/assistant` were browser-verified live on the running app to prove there was no visible semantic regression.

## Verification

- `cd web && npm run typecheck`
- `cd web && npm run test -- --run tests/intervention-presenters.test.ts tests/today-page.test.tsx tests/assistant-page-alignment.test.tsx`
- Live browser verification on:
  - `http://localhost:3001/today`
  - `http://localhost:3001/assistant`
- Browser assertions passed across both aligned daily surfaces

## Requirements Advanced

- R001 — advanced daily-surface consistency by sharing intervention semantics across the two main daily pages.
- R003 — advanced blocker/intervention continuity by centralizing how daily surfaces describe why attention is needed.

## Requirements Validated

- R001 — validated across both `/today` and `/assistant` because they now share a presentation seam and still pass live browser checks.

## New Requirements Surfaced

- If the app later needs deeper intervention consistency, the next seam should likely be a shared ranking/context layer rather than more presentation logic.

## Requirements Invalidated or Re-scoped

- none.

## Deviations

The slice stopped at a shared presentation seam rather than introducing a shared backend/intervention engine. This was intentional to keep the change truthful, small, and verifiable.

## Known Limitations

- Ranking and candidate selection are still not fully unified between `/today` and `/assistant`.
- The shared seam governs semantics, not the underlying selection engine.
- Other app surfaces are still outside this alignment pass.

## Follow-ups

- Close M005 or start a new milestone/slice if you want deeper ranking/context unification or alignment of additional surfaces.
- If ranking divergence becomes visible, consider a shared intervention-candidate selector next.

## Files Created/Modified

- `web/lib/intervention-presenters.ts` — shared intervention presentation helpers
- `web/app/today/page.tsx` — refactored to consume the shared seam
- `web/app/assistant/page.tsx` — refactored to consume the shared seam
- `web/tests/intervention-presenters.test.ts` — direct coverage for the shared seam
- `web/tests/today-page.test.tsx` — preserved daily-surface semantic coverage
- `web/tests/assistant-page-alignment.test.tsx` — preserved assistant-surface semantic coverage

## Forward Intelligence

### What the next slice should know
- The daily surfaces are now aligned at the vocabulary/presentation layer. The next meaningful improvement would come from unifying selection/ranking or expanding alignment to another surface.

### What's fragile
- If future work edits page copy directly instead of going through the shared presenter seam, drift will return quickly.

### Authoritative diagnostics
- `tests/intervention-presenters.test.ts` plus the two page-level alignment tests are now the most authoritative diagnostic set for daily-surface consistency.

### What assumptions changed
- Original assumption: deeper consistency might require new backend contracts first.
- What actually happened: a useful and truthful shared consistency step was possible entirely at the presentation layer.
