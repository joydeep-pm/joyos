---
id: T02
parent: S02
milestone: M001
provides:
  - JSON-backed persisted review storage plus a shared assembled feature-request contract carrying readiness, review metadata, intervention state, and orphaned-review diagnostics
key_files:
  - web/lib/control-tower/reviews.ts
  - web/lib/control-tower/feature-request-assembler.ts
  - web/lib/control-tower/intervention-engine.ts
  - web/lib/control-tower/types.ts
  - web/lib/control-tower/artifacts/generator.ts
key_decisions:
  - Resolve review-store paths from ASSISTANT_CACHE_DIR at call time so persisted-review tests stay isolated without changing the production overlay shape
patterns_established:
  - Server-side consumers should assemble cached feature requests with readiness and persisted review overlays before downstream intervention or artifact logic consumes them
observability_surfaces:
  - review-store helpers, assembler diagnostics with code review_feature_request_missing, and review-aware intervention/artifact test coverage
duration: 1h20m
verification_result: passed
completed_at: 2026-03-11T18:54:00Z
blocker_discovered: false
---

# T02: Implement persisted review store and shared enriched feature-request assembler

**Added a persisted feature-request review overlay and a shared server-side assembler that carries readiness and review state into intervention and artifact consumers.**

## What Happened

Extended `web/lib/control-tower/types.ts` with explicit review-record, review-overlay, enriched feature-request, and assembler-diagnostic contracts so raw cached requests stay distinct from private persisted review metadata.

Implemented `web/lib/control-tower/reviews.ts` as a JSON-backed review store with read, write, upsert, patch-update, and feature-request lookup helpers. The store keeps timestamps, rationale, pending decisions, next actions, provenance, and stable IDs outside the raw feature-request cache.

Built `web/lib/control-tower/feature-request-assembler.ts` to merge cached feature requests with readiness evaluations and persisted reviews, then run the intervention engine over that enriched shape. The assembler emits explicit orphaned-review diagnostics with stable code `review_feature_request_missing` when review records target missing feature requests.

Updated `web/lib/control-tower/intervention-engine.ts` so intervention analysis now operates on enriched feature requests and always exposes explicit review state downstream, while still accepting legacy raw feature-request inputs through a safe fallback enrichment path.

Updated artifact template typing and `web/lib/control-tower/artifacts/generator.ts` so review-aware and readiness-aware fields are available in drafting context and the existing downstream artifact contract tests pass on top of the assembled feature-request shape.

Adjusted `web/tests/control-tower/review-store.test.ts` to isolate persisted review fixtures in a dedicated test cache directory so local `.cache` state cannot pollute deterministic contract runs.

## Verification

Ran:

- `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/intervention-engine.test.ts`
- `cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts -t "returns structured review diagnostics when a persisted review targets a missing feature request"`
- `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts`
- `cd web && npm run typecheck`

Results:

- targeted T02 verification passed
- orphaned-review diagnostic test passed with the stable error payload
- slice-level named control-tower suites passed
- typecheck passed

## Diagnostics

Future agents can inspect persisted review state through:

- `web/lib/control-tower/reviews.ts` helpers (`readReviewStore`, `getReviewsForFeatureRequest`, `upsertFeatureRequestReview`, `updateFeatureRequestReview`)
- `web/lib/control-tower/feature-request-assembler.ts` output, especially `diagnostics` entries with code `review_feature_request_missing`
- review-aware intervention and artifact contract tests in `web/tests/control-tower/`

The review store preserves `createdAt`, `updatedAt`, and `lastReviewedAt` per review record, and downstream consumers now expose explicit review presence/absence instead of silently assuming no review exists.

## Deviations

- Updated the review-store contract test to use an isolated cache root via `ASSISTANT_CACHE_DIR` so persisted local files do not leak into deterministic test runs.

## Known Issues

- T03 still needs to replace raw cache access in runtime routes and UI surfaces with the shared assembler so the live intervention and artifact flows consume the same enriched contract at runtime.

## Files Created/Modified

- `web/lib/control-tower/types.ts` — added typed review-record, review-overlay, enriched request, and assembler diagnostic contracts
- `web/lib/control-tower/reviews.ts` — implemented the persisted JSON-backed review overlay store and cache-path helpers
- `web/lib/control-tower/feature-request-assembler.ts` — added the shared enrichment/diagnostics seam for cached feature requests plus reviews
- `web/lib/control-tower/intervention-engine.ts` — updated intervention analysis to operate on enriched review-aware feature requests while preserving safe fallback input handling
- `web/lib/control-tower/index.ts` — exported the new assembler and review-store modules
- `web/lib/control-tower/artifacts/types.ts` — extended template context with readiness and review fields
- `web/lib/control-tower/artifacts/generator.ts` — wired readiness and review metadata into downstream drafting context and content
- `web/tests/control-tower/review-store.test.ts` — isolated review-store persistence tests from ambient local cache state
