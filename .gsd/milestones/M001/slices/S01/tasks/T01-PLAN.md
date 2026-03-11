---
estimated_steps: 3
estimated_files: 4
---

# T01: Create failing readiness contract tests and evaluator seam

**Slice:** S01 — Grooming readiness engine and review rubric
**Milestone:** M001

## Description

Define the S01 readiness boundary in executable tests before implementation so the slice is anchored on a reusable contract instead of incremental condition tweaks inside the existing grooming engine.

## Steps

1. Add `web/tests/control-tower/readiness-evaluator.test.ts` with fixture-driven assertions for verdicts, rubric dimensions, missing inputs, blocker classification, prioritization posture, and recommended next step.
2. Add `web/tests/control-tower/grooming-engine.test.ts` covering grooming summary integration so evaluator output must drive category assignment and aggregate metrics.
3. Extend the exported control-tower type surface only as needed to represent the new derived readiness contract seam, without adding durable review persistence fields.

## Must-Haves

- [ ] Tests describe the full S01 readiness contract in machine-readable terms, including at least one low-readiness and one blocked scenario.
- [ ] The new contract seam stays derived from `FeatureRequest` inputs and does not introduce stored review state that belongs to S02.

## Verification

- `cd web && npm test -- --run web/tests/control-tower/readiness-evaluator.test.ts web/tests/control-tower/grooming-engine.test.ts`
- The command fails initially because the evaluator implementation and wiring do not yet exist, proving the tests are meaningful.

## Observability Impact

- Signals added/changed: Expected readiness dimension names, missing-input codes, verdicts, and next-step outputs become explicit and test-locked.
- How a future agent inspects this: Read the new test files to understand the evaluator contract and rerun the targeted Vitest command.
- Failure state exposed: Contract mismatches will fail with explicit assertion output showing which readiness field or summary behavior regressed.

## Inputs

- `web/lib/control-tower/grooming-engine.ts` — current coarse readiness logic that needs to be superseded by the new contract.
- `web/tests/control-tower/intervention-engine.test.ts` — existing test style for derived control-tower intelligence.

## Expected Output

- `web/tests/control-tower/readiness-evaluator.test.ts` — failing contract tests for readiness evaluation.
- `web/tests/control-tower/grooming-engine.test.ts` — failing tests proving grooming summaries must consume evaluator output.
