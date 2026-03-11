---
estimated_steps: 3
estimated_files: 5
---

# T02: Implement review mutation API and assembled refresh path

**Slice:** S03 — Pre-grooming operating loop integration
**Milestone:** M001

## Description

Build the missing server-side action seam for review capture. The API must validate payloads, preserve the private overlay model, confirm the target feature request exists, and return stable diagnostics that keep future debugging anchored on ids and codes instead of generic exceptions.

## Steps

1. Add `web/app/api/control-tower/reviews/route.ts` to accept create/update review submissions, validate required fields, and reject malformed payloads with stable `code` values.
2. Reuse the cached feature-request source plus review overlay store to confirm the target feature request exists before persisting, then upsert the review record without mutating source cache records.
3. Update supporting store/types/tests so the route returns the saved review record and consistent failure payloads for validation, missing-target, and persistence problems.

## Must-Haves

- [ ] Review persistence stays overlay-only and preserves the existing one-record-per-feature-request semantics from S02.
- [ ] Route failures expose stable, inspectable diagnostics for invalid requests and missing feature requests.

## Verification

- `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/review-mutation-route.test.ts tests/control-tower/feature-request-assembler.test.ts`
- `cd web && npm run typecheck`

## Observability Impact

- Signals added/changed: New review-mutation route response codes and saved-record payloads become durable runtime inspection surfaces.
- How a future agent inspects this: Hit `POST /api/control-tower/reviews` directly or run the targeted test files to distinguish validation, lookup, and persistence failures.
- Failure state exposed: Invalid payloads, missing feature-request targets, and unexpected save failures are surfaced as structured API responses rather than opaque 500s.

## Inputs

- `web/lib/control-tower/reviews.ts` — existing persisted overlay store and timestamp semantics.
- `web/lib/control-tower/feature-request-assembler.ts` — authoritative assembled-state seam and orphaned-review diagnostic model to preserve.

## Expected Output

- `web/app/api/control-tower/reviews/route.ts` — typed review mutation API with stable success/failure payloads.
- `web/lib/control-tower/reviews.ts` and `web/lib/control-tower/types.ts` — any small supporting helpers/types needed for route-safe validation and return values.
- `web/tests/control-tower/review-mutation-route.test.ts` — passing route contract coverage.
