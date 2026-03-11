---
id: T02
parent: S03
milestone: M001
provides:
  - Review mutation API that validates payloads, confirms assembled feature-request existence, and upserts overlay-only review records with stable diagnostics
key_files:
  - web/app/api/control-tower/reviews/route.ts
  - web/tests/control-tower/review-mutation-route.test.ts
key_decisions:
  - Review mutations confirm targets against assembled feature-request state before persisting so missing-target failures carry assembler diagnostics instead of raw store errors
patterns_established:
  - Mutation routes return structured ok/data or ok/error envelopes with durable code values and persisted-record payloads for agent inspection
observability_surfaces:
  - POST /api/control-tower/reviews responses with code values control_tower_review_invalid_request, control_tower_review_feature_request_not_found, and control_tower_review_persistence_failed
  - web/tests/control-tower/review-mutation-route.test.ts
  - web/tests/control-tower/review-store.test.ts
duration: 35m
verification_result: passed
completed_at: 2026-03-11T22:53:00+05:30
blocker_discovered: false
---

# T02: Implement review mutation API and assembled refresh path

**Added the review mutation route, kept review persistence overlay-only, and locked the API contract with passing store/route/assembler checks.**

## What Happened

Implemented `web/app/api/control-tower/reviews/route.ts` as the missing server-side review mutation seam. The route now parses POST payloads, validates required fields, checks the requested feature request against assembled cached state plus review overlay diagnostics, and upserts the review through the existing overlay store without mutating source cache records.

The route returns durable envelopes for both success and failure cases:
- success returns `{ ok: true, data: { review, created } }`
- validation failures return `control_tower_review_invalid_request`
- missing assembled targets return `control_tower_review_feature_request_not_found`
- persistence failures return `control_tower_review_persistence_failed`

Updated the route contract test to import the real implementation now that the route exists, while preserving the expected create, update-in-place, validation, and missing-target behaviors.

## Verification

- Passed: `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/review-mutation-route.test.ts tests/control-tower/feature-request-assembler.test.ts`
- Passed: `cd web && npm run typecheck`
- Slice-level partial pass: the T02-owned review mutation/store/assembler checks are green.
- Slice-level remaining work: `tests/control-tower/comms-integration.test.ts`, browser runtime verification, and the end-to-end handoff flow remain for later tasks in S03.

## Diagnostics

A future agent can inspect this work by:
- hitting `POST /api/control-tower/reviews` with valid/invalid payloads
- checking returned `error.code` values for validation, missing-target, or persistence failures
- running `cd web && npm test -- --run tests/control-tower/review-mutation-route.test.ts tests/control-tower/review-store.test.ts`
- inspecting the persisted overlay file under `ASSISTANT_CACHE_DIR/control-tower/feature-request-reviews.json`

## Deviations

- Adjusted `web/tests/control-tower/review-mutation-route.test.ts` to stop mocking the route module itself now that the real route exists; the contract assertions stayed the same.

## Known Issues

- `web/app/api/assistant/comms/draft/route.ts` has in-progress local changes for the later comms-handoff task and was not part of T02 verification.
- Slice-wide comms integration tests are still failing until the T04 handoff path is completed.

## Files Created/Modified

- `web/app/api/control-tower/reviews/route.ts` — new typed review mutation API with stable success/error envelopes and assembled-target lookup
- `web/tests/control-tower/review-mutation-route.test.ts` — route contract coverage now exercises the real implementation instead of an unresolved placeholder
