---
id: T02
parent: S01
milestone: M001
provides:
  - Reusable readiness evaluator outputs wired into grooming summaries, route payloads, and the grooming UI contract
key_files:
  - web/lib/control-tower/readiness-evaluator.ts
  - web/lib/control-tower/grooming-engine.ts
  - web/app/grooming/page.tsx
  - web/app/api/control-tower/grooming/route.ts
key_decisions:
  - Keep readiness as a derived overlay on FeatureRequest inputs and drive grouped grooming views from evaluator verdicts plus serialized diagnostics.
patterns_established:
  - Grouped grooming summaries preserve a per-request evaluation list so downstream UI and future review-tracking work can inspect verdicts, dimensions, missing inputs, blocker class, and next step without recomputing ad hoc rules.
observability_surfaces:
  - /api/control-tower/grooming JSON payload
  - web/tests/control-tower/readiness-evaluator.test.ts
  - web/tests/control-tower/grooming-engine.test.ts
  - web/app/grooming/page.tsx low-readiness and blocked diagnostics
duration: 25m
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T02: Implement the readiness evaluator and integrate grooming summary logic

**Added the readiness evaluator, moved grooming categorization onto evaluator verdicts, and surfaced explicit readiness diagnostics through the route and grooming page contract.**

## What Happened

Created `web/lib/control-tower/readiness-evaluator.ts` to derive readiness verdict, rubric dimensions, missing-input codes, blocker class, prioritization posture, and recommended next step from existing `FeatureRequest` signals. The evaluator reuses lifecycle stages from `stage-config.ts` and existing blocker/risk metadata rather than inventing a separate source of truth.

Reworked `web/lib/control-tower/grooming-engine.ts` so readiness grouping is driven by evaluator results. The engine now keeps both category arrays (`ready`, `lowReadiness`, `blocked`, `notReady`) and a durable `evaluations` list pairing each feature request with its serialized readiness model. Markdown/CSV exports were updated to include recommended actions and missing-input context.

Exported the evaluator through `web/lib/control-tower/index.ts`, kept the grooming API route returning the richer summary payload, and updated `web/app/grooming/page.tsx` to consume the new contract shape. The page now renders low-readiness and blocked reasoning using recommended next steps, missing-input codes, and blocker class instead of the previous hardcoded “needs clarity” bucket.

## Verification

- Passed: `cd web && npm test -- --run tests/control-tower/readiness-evaluator.test.ts tests/control-tower/grooming-engine.test.ts tests/control-tower/intervention-engine.test.ts`
- Passed: `cd web && npm run typecheck`
- Confirmed the targeted readiness contract now returns machine-readable verdicts and grouped evaluation diagnostics required by the slice plan.

## Diagnostics

Future agents can inspect the shipped readiness model in these places:

- `GET /api/control-tower/grooming` — serialized summary with `readiness.evaluations[*].readiness`
- `web/tests/control-tower/readiness-evaluator.test.ts` — expected verdict/dimension/missing-input contract
- `web/tests/control-tower/grooming-engine.test.ts` — grouped summary and observability assertions
- `web/app/grooming/page.tsx` — rendered low-readiness and blocked explanations based on the API contract

## Deviations

- Updated `web/app/grooming/page.tsx` during T02 because the new readiness shape broke typecheck immediately; this is also useful carry-forward work for T03, but the main purpose here was to keep the integrated contract coherent and passing verification.

## Known Issues

- None.

## Files Created/Modified

- `web/lib/control-tower/readiness-evaluator.ts` — new derived readiness evaluator with rubric dimensions, missing inputs, blocker classification, posture, and next-step logic
- `web/lib/control-tower/grooming-engine.ts` — evaluator-driven grouping, serialized evaluation entries, and richer export outputs
- `web/lib/control-tower/index.ts` — exported the readiness evaluator for downstream consumers
- `web/app/api/control-tower/grooming/route.ts` — preserved route serialization of the richer readiness summary payload
- `web/app/grooming/page.tsx` — updated dashboard rendering to consume `lowReadiness` and evaluator diagnostics
- `.gsd/milestones/M001/slices/S01/S01-PLAN.md` — marked T02 complete
