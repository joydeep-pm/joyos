---
estimated_steps: 3
estimated_files: 3
---

# T01: Lock the review-mutation and approval-handoff contracts with failing tests

**Slice:** S03 — Pre-grooming operating loop integration
**Milestone:** M001

## Description

Define the slice boundary in executable form before implementation. This task creates failing tests for the two missing integration seams: a real review-mutation API that preserves the overlay model and a comms handoff path that keeps generated artifact content intact while remaining approval-gated.

## Steps

1. Add `web/tests/control-tower/review-mutation-route.test.ts` with assertions for successful create, update-in-place behavior, validation failure, and missing-feature-request failure codes from the new review API.
2. Add `web/tests/control-tower/comms-integration.test.ts` with assertions that artifact submission to `/api/assistant/comms/draft` persists the submitted subject/body/destination instead of discarding them and regenerating generic content.
3. Extend `web/tests/control-tower/artifact-generator.test.ts` only where needed so the follow-up and clarification artifacts used in the runtime loop have explicit review-context assertions that the later browser flow can rely on.

## Must-Haves

- [ ] Review mutation tests define stable response codes, one-review-per-feature-request update semantics, and explicit missing-target diagnostics.
- [ ] Comms handoff tests prove approval-gated draft creation preserves artifact-authored content rather than silently replacing it.

## Verification

- `cd web && npm test -- --run tests/control-tower/review-mutation-route.test.ts tests/control-tower/comms-integration.test.ts tests/control-tower/artifact-generator.test.ts`
- The new tests fail against the current code for the missing review route and non-faithful comms draft handoff.

## Observability Impact

- Signals added/changed: Stable expected route `code` values and draft-handoff fidelity checks become explicit test contracts.
- How a future agent inspects this: Run the named Vitest files to see whether failures come from review validation, missing feature-request lookup, or comms draft persistence.
- Failure state exposed: Missing API route behavior and generic draft-regeneration bugs become localized to specific failing assertions instead of being discovered only in browser testing.

## Inputs

- `web/tests/control-tower/review-store.test.ts` — existing overlay persistence semantics and single-record-per-feature-request behavior.
- `web/tests/control-tower/feature-request-assembler.test.ts` and S02 summary — existing assembled diagnostics contract that S03 must preserve.

## Expected Output

- `web/tests/control-tower/review-mutation-route.test.ts` — failing contract coverage for the new review mutation API.
- `web/tests/control-tower/comms-integration.test.ts` — failing contract coverage for faithful artifact-to-comms draft submission.
- `web/tests/control-tower/artifact-generator.test.ts` — strengthened review-aware drafting assertions for the live loop.
