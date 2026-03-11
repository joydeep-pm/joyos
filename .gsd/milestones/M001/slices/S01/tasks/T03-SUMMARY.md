---
id: T03
parent: S01
milestone: M001
provides:
  - Actionable rubric-driven grooming review surfaces with verdict, dimension, blocker, and follow-up guidance rendered in the real workflow
key_files:
  - web/app/grooming/page.tsx
  - web/tests/control-tower/grooming-engine.test.ts
  - .gsd/DECISIONS.md
key_decisions:
  - Keep the grooming page on browser-safe imports instead of the `@/lib/control-tower` barrel so client rendering does not pull in server-only `fs` dependencies.
patterns_established:
  - Grooming review cards now present the evaluator contract directly: review call, rubric dimensions, weak-signal summary, missing-input guidance, blocker details, and source coverage in one card.
observability_surfaces:
  - /grooming rendered review sections and empty-state messaging
  - web/tests/control-tower/grooming-engine.test.ts
  - /api/control-tower/grooming JSON payload consumed by the page
  - browser assertion pass against http://localhost:3000/grooming
duration: 41m
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T03: Render rubric-driven grooming review surfaces

**Shipped a real grooming review dashboard that renders verdict-aware sections, rubric dimension rationale, missing-input guidance, blocker details, and recommended next steps from the readiness contract.**

## What Happened

Rebuilt `web/app/grooming/page.tsx` from a bucket-only dashboard into an actionable review surface. The page now keeps the top-level readiness totals and export/refresh controls, but the core workflow is organized around verdict-aware review lanes: ready for commitment, needs directed follow-up, and blocked before grooming.

Each rendered request card now exposes the readiness evaluator contract directly. Cards show the review call, prioritization posture, latest signal context, per-dimension rubric outcomes with rationale, weak-signal summaries, missing-input guidance, blocker class, active blockers, and source-coverage counts. Empty states were also rewritten so future agents or directors can tell that a lane is intentionally empty rather than silently broken.

While verifying the page in the browser, the real runtime failed with `Module not found: Can't resolve 'fs'`. Root cause: `app/grooming/page.tsx` was importing from the `@/lib/control-tower` barrel, which re-exported server-only cache and ingestion modules. The page was switched to browser-safe imports from `types` and `grooming-engine`, which fixed the runtime without weakening the shipped feature.

Added a grooming-engine test assertion covering the UI-facing actionable contract: low-readiness entries must preserve missing inputs plus dimension rationale, and blocked entries must preserve blocker class and blocker detail for rendering.

## Verification

Passed commands:

- `cd web && npm run typecheck`
- `cd web && npm test -- --run tests/control-tower/readiness-evaluator.test.ts tests/control-tower/grooming-engine.test.ts tests/control-tower/intervention-engine.test.ts`

Browser/runtime verification:

- Started the real dev server with `cd web && npm run dev`
- Opened `http://localhost:3000/grooming`
- Fixed the initial client-bundle failure caused by the barrel import pulling in `fs`
- Confirmed the shipped page renders the new grooming review surface
- Passed browser assertions for visible grooming review copy and zero new console errors after the fix

## Diagnostics

Future agents can inspect the shipped behavior here:

- `web/app/grooming/page.tsx` — review sections and per-request rubric rendering
- `web/tests/control-tower/grooming-engine.test.ts` — actionable contract coverage for missing inputs, rationale, and blockers
- `http://localhost:3000/grooming` — runtime review surface
- `GET /api/control-tower/grooming` — serialized readiness payload consumed by the page

If the page regresses again with a bundling error, check whether a client component reintroduced imports from the `@/lib/control-tower` barrel or another server-only module.

## Deviations

- None.

## Known Issues

- The current local dataset returns zero grooming items, so browser verification confirmed the real layout and empty-state review language rather than populated request cards. The card rendering path remains covered by typed implementation plus grooming-engine contract tests.

## Files Created/Modified

- `web/app/grooming/page.tsx` — redesigned the grooming page into an actionable rubric-driven review workflow and fixed browser-safe import boundaries
- `web/tests/control-tower/grooming-engine.test.ts` — added assertions for actionable missing-input, rationale, and blocker details preserved for the UI
- `.gsd/DECISIONS.md` — recorded the browser-safe import boundary decision for client pages
- `.gsd/milestones/M001/slices/S01/S01-PLAN.md` — marked T03 complete
