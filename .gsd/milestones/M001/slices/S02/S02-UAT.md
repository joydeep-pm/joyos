# S02: Decision tracking in feature request workflows — UAT

**Milestone:** M001
**Written:** 2026-03-11

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S02's proof target is integration, not live runtime capture. The slice is validated by review-store, assembler, intervention, and artifact-generation contract/integration tests plus typecheck, while live end-to-end workflow exercise is intentionally deferred to S03.

## Preconditions

- The `web/` workspace dependencies are installed.
- The control-tower test fixtures are available.
- No live Jira/Confluence writeback is required.
- Verification is run from the repository root with access to the `web/` app.

## Smoke Test

Run `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts` and confirm all four suites pass with no failures.

## Test Cases

### 1. Persist and retrieve review overlay state

1. Run `cd web && npm test -- --run tests/control-tower/review-store.test.ts`
2. Confirm the suite passes for create, upsert, patch-update, and feature-request-scoped retrieval behavior.
3. **Expected:** Review records persist independently of raw cache data, preserve timestamps, and can be read back by feature-request ID.

### 2. Assemble feature requests with review diagnostics

1. Run `cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts`
2. Run `cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts -t "returns structured review diagnostics when a persisted review targets a missing feature request"`
3. **Expected:** The assembler returns enriched feature requests with readiness + review state and emits the stable orphaned-review diagnostic code `review_feature_request_missing` when persisted review state targets a missing feature request.

### 3. Verify downstream intervention and artifact consumers use the assembled contract

1. Run `cd web && npm test -- --run tests/control-tower/intervention-engine.test.ts tests/control-tower/artifact-generator.test.ts`
2. Run `cd web && npm run typecheck`
3. **Expected:** Intervention consumers expose explicit review presence/absence, artifact generation uses review-aware drafting context, and the TypeScript contract passes without raw-cache cast regressions.

## Edge Cases

### Persisted review points at a missing feature request

1. Run `cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts -t "returns structured review diagnostics when a persisted review targets a missing feature request"`
2. **Expected:** The assembler does not silently succeed; it surfaces a structured diagnostic with code `review_feature_request_missing` that future routes can expose.

## Failure Signals

- Any failure in `review-store.test.ts` suggests persisted review state is no longer durable, isolated, or feature-request scoped.
- Any failure in `feature-request-assembler.test.ts` suggests the shared enriched contract drifted or orphaned-review diagnostics disappeared.
- Any failure in `artifact-generator.test.ts` or `intervention-engine.test.ts` suggests downstream consumers regressed to raw cache assumptions or lost explicit review visibility.
- Any `npm run typecheck` failure suggests route/UI/runtime types no longer agree on the assembled review-aware contract.

## Requirements Proved By This UAT

- R004 — Structured artifact drafting from context now includes review-aware drafting inputs and generated output through the assembled feature-request contract.
- R006 — Explicit decision tracking for director review is durable, assembled into feature requests, visible to downstream consumers, and diagnosable when review state is orphaned.

## Not Proven By This UAT

- R001 — This UAT does not prove the live daily intervention brief in a running browser session.
- R002 — This UAT does not prove every top-level UI workspace consumes the enriched contract end-to-end.
- R003 — This UAT does not prove human usefulness of the combined blocker/review presentation in live runtime.
- S03 scope — This UAT does not prove live review capture/editing, end-to-end pre-grooming operating-loop execution, or approval-aware follow-up execution paths.

## Notes for Tester

This slice intentionally stops short of a browser-driven or human-experience UAT pass. Treat the test suites and route contracts as authoritative proof for S02, and use S03 to validate the complete live operating loop once review capture is wired into the app.
