---
estimated_steps: 3
estimated_files: 4
---

# T01: Lock review overlay and assembly contracts with failing tests

**Slice:** S02 — Decision tracking in feature request workflows
**Milestone:** M001

## Description

Define S02's executable boundary before implementation by adding failing tests for review persistence, enriched feature-request assembly, intervention review exposure, artifact review context, and the failure-path diagnostics that make review-state problems inspectable.

## Steps

1. Add a dedicated `review-store` test suite that defines the persisted review record shape, upsert/update semantics, and feature-request-scoped retrieval expectations for the private overlay store.
2. Add a `feature-request-assembler` test suite that defines the enriched assembled shape, including attached readiness evaluation, persisted review metadata, and explicit diagnostics for review records that reference missing feature requests.
3. Extend intervention and artifact generator tests so they assert that assembled review state appears in downstream brief/detail data and drafting context rather than being recomputed or cast from raw cache data.

## Must-Haves

- [ ] New tests name and assert the exact S02 contracts for review persistence, enriched assembly, and downstream review-aware consumption.
- [ ] At least one test covers the diagnostic failure path for orphaned persisted review metadata so assembly failures are visible and stable.

## Verification

- `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts`
- The new suites fail because the review overlay and shared assembler do not exist yet, not because of unrelated regressions.

## Observability Impact

- Signals added/changed: Test-defined expectations for stable review diagnostics and persisted timestamps.
- How a future agent inspects this: Run the new control-tower test suites to see whether review persistence, assembly, or downstream wiring regressed.
- Failure state exposed: Orphaned review-record diagnostics and missing review-aware artifact/intervention fields become explicit test failures.

## Inputs

- `web/tests/control-tower/artifact-generator.test.ts` — existing downstream drafting contract to extend with review context.
- `web/tests/control-tower/intervention-engine.test.ts` — existing intervention contract and grouping behavior that S02 must preserve while adding review visibility.
- S02 research summary — requires a private review overlay plus server-side assembly instead of raw cache mutation or client-only state.

## Expected Output

- `web/tests/control-tower/review-store.test.ts` — failing review persistence contract tests for the new overlay store.
- `web/tests/control-tower/feature-request-assembler.test.ts` — failing assembly and diagnostics contract tests for enriched feature requests.
- `web/tests/control-tower/artifact-generator.test.ts` — updated assertions requiring review-aware drafting context.
- `web/tests/control-tower/intervention-engine.test.ts` — updated assertions requiring downstream review visibility without breaking existing intervention behavior.
