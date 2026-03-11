---
id: T01
parent: S02
milestone: M001
provides:
  - Failing contract tests for the private review overlay, enriched feature-request assembly, and downstream review-aware consumers
key_files:
  - web/tests/control-tower/review-store.test.ts
  - web/tests/control-tower/feature-request-assembler.test.ts
  - web/tests/control-tower/artifact-generator.test.ts
  - web/tests/control-tower/intervention-engine.test.ts
key_decisions:
  - Lock S02 on a dedicated reviews module and shared assembler module before runtime wiring exists
patterns_established:
  - Downstream artifact and intervention tests must consume assembled review state instead of raw cached feature requests
observability_surfaces:
  - Vitest contract failures for review persistence, orphaned review diagnostics, and review-aware downstream data
duration: 35m
verification_result: passed
completed_at: 2026-03-11T18:48:00Z
blocker_discovered: false
---

# T01: Lock review overlay and assembly contracts with failing tests

**Added failing control-tower tests that define the S02 review-store, assembler, and downstream review-context contracts.**

## What Happened

Created `web/tests/control-tower/review-store.test.ts` to define the private persisted review record shape, upsert semantics, patch-update behavior, and feature-request-scoped retrieval expectations for the upcoming review overlay.

Created `web/tests/control-tower/feature-request-assembler.test.ts` to define the shared assembled feature-request contract: readiness evaluation, persisted review metadata, intervention fields, and a stable orphaned-review diagnostic with code `review_feature_request_missing`.

Extended `web/tests/control-tower/artifact-generator.test.ts` so artifact drafting now requires review-aware template context and generated content sections instead of relying only on raw intervention data.

Extended `web/tests/control-tower/intervention-engine.test.ts` so downstream intervention analysis and brief generation now require explicit assembled review visibility, including the no-review shape `{ present: false, record: null }`.

The targeted verification intentionally fails only because the planned `@/lib/control-tower/reviews` and `@/lib/control-tower/feature-request-assembler` modules do not exist yet and because current artifact/intervention implementations do not expose the new review-aware fields.

## Verification

Ran:

- `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts`

Observed expected failing-contract state:

- `review-store.test.ts` fails on unresolved import for `@/lib/control-tower/reviews`
- `feature-request-assembler.test.ts` fails on unresolved import for `@/lib/control-tower/feature-request-assembler`
- updated artifact/intervention suites fail on missing review-aware fields in the current implementation
- no unrelated suite regressions were introduced in the targeted run

Slice-level verification status after T01:

- `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts` — expected fail, matching T01 contract goal
- `cd web && npm run typecheck` — not run in T01
- `cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts -t "returns structured review diagnostics when a persisted review targets a missing feature request"` — not run in T01 because assembler module does not exist yet

## Diagnostics

Use the targeted Vitest command above to inspect the current S02 boundary:

- unresolved imports identify the exact modules T02 must implement (`reviews`, `feature-request-assembler`)
- assertion failures in artifact/intervention tests identify the exact downstream review fields and content surfaces that must be wired in T02/T03
- the assembler suite locks the orphaned-review diagnostic payload shape and stable error code for later implementation

## Deviations

none

## Known Issues

- `@/lib/control-tower/reviews` does not exist yet
- `@/lib/control-tower/feature-request-assembler` does not exist yet
- current artifact generator context does not expose readiness/review fields
- current intervention engine does not attach review state to analyzed feature requests or briefs

## Files Created/Modified

- `web/tests/control-tower/review-store.test.ts` — new failing contract tests for persisted review overlay storage and retrieval
- `web/tests/control-tower/feature-request-assembler.test.ts` — new failing contract tests for enriched assembly and orphaned-review diagnostics
- `web/tests/control-tower/artifact-generator.test.ts` — extended drafting tests to require review-aware context and generated content
- `web/tests/control-tower/intervention-engine.test.ts` — extended intervention tests to require explicit downstream review visibility
