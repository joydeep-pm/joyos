# S02: Decision tracking in feature request workflows

**Goal:** Persist director review outcomes, pending decisions, rationale, and next actions as a private overlay on feature requests, then expose that review state across intervention detail, intervention brief data, and artifact drafting inputs without breaking the systems-of-record boundary.
**Demo:** A real feature request can carry a durable review record that survives reloads, shows decision state and next actions in the intervention workflow, and materially changes generated drafting context through the shared assembled feature-request shape.

## Must-Haves

- Persist review records locally by feature-request ID using a dedicated overlay store that captures review status, decision rationale, pending decisions, next actions, timestamps, and provenance without mutating Jira/Confluence-backed cache data. 
- Assemble a stable enriched feature-request shape server-side that composes cached feature requests, S01 readiness evaluations, intervention analysis, and persisted review metadata for API and artifact consumers.
- Replace unsafe raw-cache casting in artifact generation and intervention APIs with the shared assembler so downstream flows consume the same enriched contract.
- Show durable review outcomes, pending decisions, and recommended next actions in the intervention detail experience so a director can inspect the operating state in the live workflow.
- Expose review persistence and assembly failures through stable API error payloads and test-covered inspection surfaces so a future agent can localize missing review state quickly.

## Proof Level

- This slice proves: integration
- Real runtime required: no
- Human/UAT required: no

## Verification

- `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts`
- `cd web && npm run typecheck`
- `cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts -t "returns structured review diagnostics when a persisted review targets a missing feature request"`

## Observability / Diagnostics

- Runtime signals: structured review API responses include review metadata timestamps/status plus stable `code` fields for invalid payloads, missing records, and assembly mismatches.
- Inspection surfaces: review-store tests, assembler tests, `GET /api/control-tower/intervention`, `POST /api/control-tower/artifacts/generate`, and the intervention detail UI state rendered from the assembled feature request.
- Failure visibility: persisted review overlay exposes `lastReviewedAt`, `updatedAt`, and explicit review presence/absence; assembly/API failures surface stable error codes and missing-feature diagnostics instead of silent casts.
- Redaction constraints: review overlay stores only private orchestration metadata; no secrets, Jira credentials, or raw external payloads are logged or persisted beyond feature-request IDs and director-entered review text.

## Integration Closure

- Upstream surfaces consumed: `web/lib/control-tower/cache.ts`, `web/lib/control-tower/readiness-evaluator.ts`, `web/lib/control-tower/grooming-engine.ts`, `web/lib/control-tower/intervention-engine.ts`, `web/lib/control-tower/notes.ts`, `web/lib/control-tower/artifacts/generator.ts`.
- New wiring introduced in this slice: a review overlay store plus shared feature-request assembler feeding intervention APIs/detail rendering and artifact generation with one enriched server-side contract.
- What remains before the milestone is truly usable end-to-end: S03 still needs to connect persisted review decisions into the full pre-grooming operating loop, including live review capture flows and approval-aware follow-up execution paths.

## Tasks

- [x] **T01: Lock review overlay and assembly contracts with failing tests** `est:45m`
  - Why: S02 needs an explicit persistence and composition boundary before implementation so review state, diagnostics, and downstream consumers cannot drift.
  - Files: `web/tests/control-tower/review-store.test.ts`, `web/tests/control-tower/feature-request-assembler.test.ts`, `web/tests/control-tower/artifact-generator.test.ts`, `web/tests/control-tower/intervention-engine.test.ts`
  - Do: Add failing contract tests for the local review store, enriched feature-request assembler, intervention brief review exposure, artifact context enrichment, and a diagnostic failure path when persisted review metadata references a missing feature request.
  - Verify: `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts`
  - Done when: The new tests describe the S02 contract clearly and fail only because the review overlay + assembler wiring does not exist yet.
- [x] **T02: Implement persisted review store and shared enriched feature-request assembler** `est:1h15m`
  - Why: Durable decision tracking requires a private store plus a single server-side seam that merges review metadata with readiness and intervention intelligence.
  - Files: `web/lib/control-tower/types.ts`, `web/lib/control-tower/reviews.ts`, `web/lib/control-tower/feature-request-assembler.ts`, `web/lib/control-tower/intervention-engine.ts`, `web/lib/control-tower/index.ts`
  - Do: Add typed review-record models, implement JSON-backed read/write/upsert helpers patterned after notes, build an assembler that attaches readiness and review overlays to cached requests, extend intervention types/functions to consume the enriched review shape, and expose stable assembly diagnostics for orphaned review records.
  - Verify: `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/intervention-engine.test.ts`
  - Done when: Review metadata persists independently of the raw cache, enriched feature requests are assembled from one module, intervention analysis accepts that shape without unsafe casts, and the diagnostics test passes.
- [x] **T03: Wire enriched review state into intervention APIs, detail UI, and artifact drafting** `est:1h15m`
  - Why: The slice is only real if the persisted decisions visibly affect the live workflow and drafting outputs instead of remaining an internal server abstraction.
  - Files: `web/app/api/control-tower/intervention/route.ts`, `web/app/api/control-tower/artifacts/generate/route.ts`, `web/components/intervention/FeatureRequestDetail.tsx`, `web/lib/control-tower/artifacts/types.ts`, `web/lib/control-tower/artifacts/generator.ts`
  - Do: Replace raw cache access/casts with the shared assembler in intervention and artifact routes, extend artifact template context with review fields, render a review decision section in feature-request detail, and surface stable API errors for invalid review-aware artifact generation requests.
  - Verify: `cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts && npm run typecheck`
  - Done when: Intervention detail renders persisted review outcomes and next actions from the enriched contract, artifact generation consumes review-aware context without casting cached requests, and all named slice verification passes.

## Files Likely Touched

- `web/lib/control-tower/types.ts`
- `web/lib/control-tower/reviews.ts`
- `web/lib/control-tower/feature-request-assembler.ts`
- `web/lib/control-tower/intervention-engine.ts`
- `web/app/api/control-tower/intervention/route.ts`
- `web/app/api/control-tower/artifacts/generate/route.ts`
- `web/lib/control-tower/artifacts/types.ts`
- `web/lib/control-tower/artifacts/generator.ts`
- `web/components/intervention/FeatureRequestDetail.tsx`
- `web/tests/control-tower/review-store.test.ts`
- `web/tests/control-tower/feature-request-assembler.test.ts`
- `web/tests/control-tower/artifact-generator.test.ts`
- `web/tests/control-tower/intervention-engine.test.ts`
