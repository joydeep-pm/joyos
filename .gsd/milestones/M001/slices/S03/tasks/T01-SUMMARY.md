---
id: T01
parent: S03
milestone: M001
provides:
  - Failing-first contracts for the review mutation API and approval-gated artifact-to-comms draft handoff
key_files:
  - web/tests/control-tower/review-mutation-route.test.ts
  - web/tests/control-tower/comms-integration.test.ts
  - web/tests/control-tower/artifact-generator.test.ts
key_decisions:
  - Kept the new review-route contract test as an intentionally unresolved import so the missing route fails at suite load until T02 implements it.
patterns_established:
  - API contract tests assert stable error codes and persisted payload fidelity before runtime wiring exists.
observability_surfaces:
  - Vitest failures in review-mutation-route.test.ts and comms-integration.test.ts localize missing route behavior and draft fidelity regressions.
duration: 35m
verification_result: passed
completed_at: 2026-03-11T22:30:42+05:30
blocker_discovered: false
---

# T01: Lock the review-mutation and approval-handoff contracts with failing tests

**Added failing contract coverage for the missing review mutation route and the non-faithful artifact-to-comms handoff, while keeping artifact generation assertions green.**

## What Happened

Added `web/tests/control-tower/review-mutation-route.test.ts` to define the S03 review API contract for create, update-in-place, validation failure, and missing-feature-request diagnostics. The test currently fails at import resolution because `app/api/control-tower/reviews/route.ts` does not exist yet, which is the intended failing-first boundary for T02.

Added `web/tests/control-tower/comms-integration.test.ts` to exercise `/api/assistant/comms/draft` with artifact-authored subject/body/destination values produced by `artifactToCommsDraft`. Those tests currently fail because the existing route ignores submitted artifact content and regenerates a generic assistant draft body/subject instead.

Kept `web/tests/control-tower/artifact-generator.test.ts` focused and green. After probing the current generator output, no extra review-context assertions were needed beyond the existing follow-up and clarification coverage, so the file remains aligned to current behavior without introducing false failures unrelated to the T01 seams.

## Verification

Ran:

- `cd web && npm test -- --run tests/control-tower/review-mutation-route.test.ts tests/control-tower/comms-integration.test.ts tests/control-tower/artifact-generator.test.ts`
- `cd web && npm test -- --run tests/control-tower/review-mutation-route.test.ts tests/control-tower/comms-integration.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/feature-request-assembler.test.ts`

Observed:

- `tests/control-tower/review-mutation-route.test.ts` fails because `@/app/api/control-tower/reviews/route` does not exist yet.
- `tests/control-tower/comms-integration.test.ts` fails because `/api/assistant/comms/draft` regenerates subject/body/sourceDate instead of persisting artifact-authored values.
- `tests/control-tower/artifact-generator.test.ts` passes.
- `tests/control-tower/feature-request-assembler.test.ts` passes.

These failures match the task contract: the new review route is missing and the current comms handoff is not faithful.

## Diagnostics

Re-run the targeted Vitest files:

- `cd web && npm test -- --run tests/control-tower/review-mutation-route.test.ts`
- `cd web && npm test -- --run tests/control-tower/comms-integration.test.ts`

Expected failure signatures:

- review route: unresolved route import until `web/app/api/control-tower/reviews/route.ts` exists
- comms handoff: response/history assertions showing generic regenerated `subject`, `body`, and `sourceDate` instead of artifact-authored values

## Deviations

No material deviations from plan. `artifact-generator.test.ts` was inspected and left effectively unchanged after confirming its existing follow-up and clarification assertions already cover the review context needed for later browser work.

## Known Issues

- `web/app/api/control-tower/reviews/route.ts` does not exist yet.
- `web/app/api/assistant/comms/draft/route.ts` currently accepts artifact-shaped payloads but discards submitted content by calling the generic draft generator.

## Files Created/Modified

- `web/tests/control-tower/review-mutation-route.test.ts` — failing-first contract coverage for the missing review mutation API.
- `web/tests/control-tower/comms-integration.test.ts` — failing fidelity checks for artifact-authored comms draft submission.
- `web/tests/control-tower/artifact-generator.test.ts` — reviewed and retained as the stable review-context contract for generated follow-up/clarification content.
