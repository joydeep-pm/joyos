---
id: T01
parent: S01
milestone: M001
provides:
  - Failing readiness contract tests and exported seam types for S01 evaluator integration
key_files:
  - web/tests/control-tower/readiness-evaluator.test.ts
  - web/tests/control-tower/grooming-engine.test.ts
  - web/lib/control-tower/types.ts
  - web/lib/control-tower/index.ts
key_decisions:
  - Lock the S01 readiness boundary with fixture-driven tests before adding evaluator implementation.
patterns_established:
  - Derived readiness evaluation hangs off FeatureRequest inputs and is surfaced through machine-readable verdict, dimension, blocker, and next-step fields.
observability_surfaces:
  - Targeted Vitest contract tests for readiness verdicts, missing-input codes, blocker classes, grouped summary diagnostics, and next-step outputs
duration: 25m
verification_result: passed
completed_at: 2026-03-11
blocker_discovered: false
---

# T01: Create failing readiness contract tests and evaluator seam

**Added failing readiness evaluator and grooming-summary contract tests plus the minimal exported type seam they require.**

## What Happened

Created `web/tests/control-tower/readiness-evaluator.test.ts` to define the S01 contract around verdicts, rubric dimensions, missing-input codes, blocker classification, prioritization posture, and recommended next step. The test suite includes both a low-readiness scenario and a blocked scenario.

Created `web/tests/control-tower/grooming-engine.test.ts` to force grooming summaries to consume evaluator output instead of coarse in-place bucket logic. These tests assert category assignment, aggregate metrics, grouped breakdowns, and preservation of evaluator diagnostics.

Extended `web/lib/control-tower/types.ts` with derived readiness contract types only. No durable review persistence fields were added. Exported the existing grooming engine surface from `web/lib/control-tower/index.ts` so downstream code can consume the seam consistently.

## Verification

Ran:

- `cd web && npm test -- --run tests/control-tower/readiness-evaluator.test.ts tests/control-tower/grooming-engine.test.ts`
- `cd web && npm test -- --run tests/control-tower/readiness-evaluator.test.ts tests/control-tower/grooming-engine.test.ts tests/control-tower/intervention-engine.test.ts`

Result:

- The new readiness evaluator suite fails at import resolution because `web/lib/control-tower/readiness-evaluator.ts` does not exist yet.
- The new grooming engine suite fails because current `grooming-engine.ts` does not provide `lowReadiness` and `evaluations` outputs.
- Existing `tests/control-tower/intervention-engine.test.ts` still passes.

This is the intended T01 outcome: the tests are meaningful and currently failing on the missing evaluator implementation and missing grooming-summary wiring.

Slice-level status after T01:

- `web/tests/control-tower/readiness-evaluator.test.ts` — created, failing as expected
- `web/tests/control-tower/grooming-engine.test.ts` — created, failing as expected
- `cd web && npm test -- --run web/tests/control-tower/readiness-evaluator.test.ts web/tests/control-tower/grooming-engine.test.ts web/tests/control-tower/intervention-engine.test.ts` — fails as expected for missing S01 implementation
- `cd web && npm run typecheck` — not run in T01 because the task’s required proof is failing contract tests, not passing implementation verification

## Diagnostics

Future agents can inspect the intended S01 readiness contract directly in:

- `web/tests/control-tower/readiness-evaluator.test.ts`
- `web/tests/control-tower/grooming-engine.test.ts`

To reproduce the current gap, rerun:

- `cd web && npm test -- --run tests/control-tower/readiness-evaluator.test.ts tests/control-tower/grooming-engine.test.ts`

Current failure surfaces are explicit:

- missing module import for `@/lib/control-tower/readiness-evaluator`
- missing `lowReadiness` and `evaluations` fields on grooming summaries

## Deviations

None.

## Known Issues

- `web/lib/control-tower/readiness-evaluator.ts` is not implemented yet.
- `web/lib/control-tower/grooming-engine.ts` still uses coarse readiness buckets and does not expose evaluator-driven diagnostics.

## Files Created/Modified

- `web/tests/control-tower/readiness-evaluator.test.ts` — new failing contract tests for readiness verdicts, rubric dimensions, missing inputs, blocker classes, prioritization posture, and next-step output
- `web/tests/control-tower/grooming-engine.test.ts` — new failing integration tests forcing grooming summaries to consume evaluator output and expose grouped diagnostics
- `web/lib/control-tower/types.ts` — added derived readiness contract types without introducing persisted review state
- `web/lib/control-tower/index.ts` — exported grooming engine surface through the control-tower index
