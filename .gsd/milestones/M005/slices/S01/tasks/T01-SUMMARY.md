---
id: T01
parent: S01
milestone: M005
provides:
  - An intervention-first Today page hierarchy aligned to the Director-of-Products operating model
key_files:
  - web/app/today/page.tsx
key_decisions:
  - Use truthful language and lightweight reasoning copy on the current data model before adding deeper API changes
patterns_established:
  - The Today page should frame the day as a Director Intervention Brief plus Today’s Three, not a generic top-task list
observability_surfaces:
  - /today UI headings and card copy
  - focused Today page test coverage
duration: 45m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Rework Today page hierarchy around intervention-first language and cards

**Reworked `/today` into a Director Intervention Brief with Today’s Three and intervention-oriented blocker framing.**

## What Happened

The Today page no longer presents itself as a generic “Top 3 execution priorities” dashboard. It now leads with a Director Intervention Brief, renames the main list to Today’s Three, and introduces role-specific explanatory copy about intervention, blocker removal, and high-leverage focus.

The main cards now include lightweight reasoning text for why each item matters and what kind of operating-goal support it likely provides, while the blocked section is reframed around interventions rather than passive status display. The sidebar language was also adjusted so goal context and quick capture match the Director-of-Products operating model.

## Verification

- `cd web && npm run typecheck`
- Added a focused test at `web/tests/today-page.test.tsx`
- `cd web && npm run test -- --run tests/today-page.test.tsx`

## Diagnostics

Future agents should inspect `web/app/today/page.tsx` and `web/tests/today-page.test.tsx` first when checking daily-surface alignment.

## Deviations

None.

## Known Issues

This task intentionally uses lightweight reasoning copy derived from existing task fields; it does not yet introduce deeper intervention-ranking logic or richer API shaping.

## Files Created/Modified

- `web/app/today/page.tsx` — intervention-first Today page hierarchy and role-aware copy
- `web/tests/today-page.test.tsx` — focused test covering the new Today page semantics
