---
id: S01
parent: M005
milestone: M005
provides:
  - A live intervention-first Today page aligned to the Director-of-Products markdown operating model
requires:
  - slice: none
    provides: none
affects:
  - S02
  - S03
key_files:
  - web/app/today/page.tsx
  - web/tests/today-page.test.tsx
  - web/components/ui.tsx
key_decisions:
  - Start web-app alignment at `/today`, the clearest daily surface, before changing richer assistant flows
patterns_established:
  - Daily UI alignment should pair truthful role-specific copy with focused semantic tests and browser proof
observability_surfaces:
  - `/today` in the running app
  - `tests/today-page.test.tsx`
  - .gsd/milestones/M005/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M005/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M005/slices/S01/tasks/T03-SUMMARY.md
drill_down_paths:
  - .gsd/milestones/M005/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M005/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M005/slices/S01/tasks/T03-SUMMARY.md
duration: 2h
verification_result: passed
completed_at: 2026-03-14
---

# S01: Daily intervention brief UI alignment

**Turned `/today` into a live Director Intervention Brief with Today’s Three, role-aware reasoning copy, blocker visibility, and browser-verified alignment to the markdown operating model.**

## What Happened

This slice took the first and most visible daily web surface and aligned it to the Director-of-Products operating model already established on the markdown side. The `/today` page no longer presents itself as a generic execution-priority dashboard. It now leads with a Director Intervention Brief, renames the main list to Today’s Three, and adds explanatory copy focused on intervention, blocker removal, and high-leverage daily decisions.

Top items now carry lightweight reasoning text about why they matter and what type of operating-goal support they likely provide based on current task data. The blocked section was also reframed from passive status display into a section explicitly about possible intervention. The goal sidebar language was tightened so it reads as operating-goal context instead of generic goal metadata.

A focused test was added to lock those semantics in place, and the live browser verification proved the resulting page structure on the running app. During that proof, a port collision with another local app surfaced; the correct Next.js app URL was recovered from the dev-server output and the final assertions passed there.

## Verification

- `cd web && npm run typecheck`
- `cd web && npm run test -- --run tests/today-page.test.tsx`
- Live browser verification on `http://localhost:3001/today`
- Browser assertions passed for:
  - `Director intervention brief`
  - `Today's Three`
  - `Blockers that may need intervention`
  - `Operating-goal signal`

## Requirements Advanced

- R001 — advanced the daily intervention brief from markdown/docs intent into the actual web UI.
- R003 — advanced blocker visibility by reframing blocked items around intervention decisions on the primary daily page.

## Requirements Validated

- R001 — validated at live UI level because `/today` now visibly behaves like the intended intervention-first daily surface.

## New Requirements Surfaced

- The assistant and richer control-tower surfaces should adopt the same intervention framing and Today’s Three hierarchy so the app feels like one coherent system.

## Requirements Invalidated or Re-scoped

- none.

## Deviations

The slice used lightweight reasoning heuristics on current task/category data rather than introducing a new intervention-ranking API. This was intentional to keep the first app-alignment slice truthful and low-risk.

## Known Limitations

- The reasoning text is heuristic rather than being driven by a dedicated intervention engine.
- `/assistant` and other richer app surfaces are still not aligned to the new daily operating model.
- There is an unrelated 404 network warning for a missing resource in the browser session.

## Follow-ups

- Align `/assistant` to the same intervention-first model and terminology.
- Decide whether the next slice should connect assistant/context surfaces to Today’s Three or deepen the ranking logic behind the Today page.

## Files Created/Modified

- `web/app/today/page.tsx` — intervention-first daily brief UI
- `web/tests/today-page.test.tsx` — semantic coverage for the aligned Today page
- `web/components/ui.tsx` — shared JSX runtime fix surfaced by the test path

## Forward Intelligence

### What the next slice should know
- `/today` is now the clearest exemplar of the new role-specific UI language. Future app alignment work should borrow its information hierarchy instead of inventing a second model.

### What's fragile
- The role-aware reasoning copy is easy to drift if future changes reintroduce generic labels like “Top 3 execution priorities.”

### Authoritative diagnostics
- `tests/today-page.test.tsx` and live browser assertions on `/today` are the fastest way to check whether the daily operating model still holds.

### What assumptions changed
- Original assumption: the daily page might need new APIs before becoming useful.
- What actually happened: a meaningful first alignment step was possible by reshaping the current page with truthful heuristics and existing data.
