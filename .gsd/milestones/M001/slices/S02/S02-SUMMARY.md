---
id: S02
parent: M001
milestone: M001
provides:
  - Durable feature-request review overlays plus a shared assembled feature-request contract carrying readiness, intervention, and review state into runtime APIs, detail UI, and artifact generation
requires:
  - slice: S01
    provides: Stable readiness evaluations, rubric outputs, and downstream review dimension contracts consumed by the review-aware assembler
affects:
  - S03
key_files:
  - web/lib/control-tower/reviews.ts
  - web/lib/control-tower/feature-request-assembler.ts
  - web/app/api/control-tower/intervention/route.ts
  - web/app/api/control-tower/artifacts/generate/route.ts
  - web/components/intervention/FeatureRequestDetail.tsx
  - .gsd/REQUIREMENTS.md
key_decisions:
  - Persist director review metadata in a dedicated local overlay and assemble it server-side with cached feature requests instead of mutating systems-of-record cache data
  - Require review-aware intervention and artifact routes to return stable failure codes plus assembler diagnostics when lookup or generation fails
patterns_established:
  - Server consumers that need feature-request workflow state should assemble cached feature requests with readiness and persisted review overlays before downstream analysis or drafting
  - Detail UI should render persisted review decisions as first-class workflow state with explicit presence/absence rather than inferring from missing fields
observability_surfaces:
  - cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts
  - cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts -t "returns structured review diagnostics when a persisted review targets a missing feature request"
  - cd web && npm run typecheck
  - GET /api/control-tower/intervention
  - POST /api/control-tower/artifacts/generate
  - web/components/intervention/FeatureRequestDetail.tsx
  - web/lib/control-tower/reviews.ts
  - web/lib/control-tower/feature-request-assembler.ts
drill_down_paths:
  - .gsd/milestones/M001/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T03-SUMMARY.md
duration: 3h10m
verification_result: passed
completed_at: 2026-03-11
---

# S02: Decision tracking in feature request workflows

**Shipped durable review persistence and a shared review-aware feature-request assembly seam that now drives intervention APIs, detail inspection, and artifact drafting context.**

## What Happened

S02 started by locking the slice boundary with failing tests for a private review overlay, a shared feature-request assembler, downstream intervention visibility, review-aware artifact drafting, and orphaned-review diagnostics. That contract made the persistence shape, no-review fallback shape, and review-aware downstream expectations explicit before implementation.

The implementation then introduced a JSON-backed review store in `web/lib/control-tower/reviews.ts` and new typed review/assembler contracts in `web/lib/control-tower/types.ts`. Review records now persist outside Jira/Confluence-backed cache data, keyed by feature-request ID with timestamps, rationale, pending decisions, next actions, provenance, and stable IDs. The shared assembler in `web/lib/control-tower/feature-request-assembler.ts` composes cached feature requests with S01 readiness evaluations, persisted reviews, and intervention analysis, and emits stable orphaned-review diagnostics with code `review_feature_request_missing` when review records reference missing feature requests.

From there, runtime consumers were rewired onto the same enriched contract. `GET /api/control-tower/intervention` now assembles review-aware feature requests and returns diagnostics alongside the grouped brief. `POST /api/control-tower/artifacts/generate` no longer relies on raw-cache casting; it uses the assembler-backed lookup and returns stable failure codes for invalid request payloads, empty cache state, missing feature requests, and unexpected generation failures. The artifact generator and its template context were extended so review decisions, reviewer identity, pending decisions, next actions, and readiness data materially change drafting inputs and generated output.

The live detail workflow was also upgraded. `web/components/intervention/FeatureRequestDetail.tsx` now renders a first-class Review Decision section showing explicit presence/absence, review status, summary, rationale, pending decisions, next actions, reviewer identity, and timestamps. That gives the intervention workflow a durable operating-state layer instead of forcing the user to infer review status from notes or missing fields.

Finally, the slice completion work updated the requirements contract to reflect what this slice actually proved: review-aware structured artifact drafting is now validated, and explicit feature-request-level decision tracking is also validated.

## Verification

Ran and passed:

- `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts`
- `cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts -t "returns structured review diagnostics when a persisted review targets a missing feature request"`
- `cd web && npm run typecheck`

Observability surfaces were also checked in code:

- `GET /api/control-tower/intervention` returns `diagnostics` with the brief instead of silently dropping assembly issues.
- `POST /api/control-tower/artifacts/generate` returns stable `code` fields for invalid requests, empty cache state, missing feature requests, and generation failures.
- `FeatureRequestDetail` renders explicit review presence/absence and timestamps instead of hiding missing review state.
- The review store and assembler preserve `createdAt`, `updatedAt`, and `lastReviewedAt`, providing inspectable persisted state and orphaned-review diagnostics.

## Requirements Advanced

- R001 — The intervention brief now carries assembled review-aware feature-request state and diagnostics, making daily intervention output more operational.
- R002 — The feature-request workspace now includes durable private review metadata assembled alongside execution and documentation context.
- R003 — Intervention/detail surfaces now expose review outcomes and next actions alongside blocker/risk state, improving execution visibility.

## Requirements Validated

- R004 — S02 proved structured artifact drafting can consume persisted review decisions, pending decisions, and next actions through the shared assembler-backed context.
- R006 — S02 proved feature-request-level decision tracking with durable persistence, visible runtime surfaces, and stable diagnostics for missing/orphaned review state.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Updated the review-store contract tests to isolate persisted fixtures under `ASSISTANT_CACHE_DIR` so deterministic test runs do not inherit ambient local cache state.

## Known Limitations

- S02 proves runtime assembly and review visibility, but it does not yet provide the live review capture workflow that creates or edits review records from the UI.
- The intervention route summary string is still assembled locally in the route and remains simpler than the helper-generated narrative available in `intervention-engine.ts`.
- Full end-to-end pre-grooming operating-loop proof, approval-aware follow-through execution, and live runtime/UAT validation remain for S03.

## Follow-ups

- Build the live review capture/editing workflow so directors can create and update persisted review records from the intervention experience.
- Fold the richer assembled review state into the end-to-end pre-grooming operating loop and approval-aware follow-up flow in S03.
- Consider consolidating intervention summary generation so the route and engine share one summary helper contract.

## Files Created/Modified

- `web/lib/control-tower/types.ts` — added typed review-record, review-overlay, enriched feature-request, and assembler-diagnostic contracts.
- `web/lib/control-tower/reviews.ts` — implemented the persisted JSON-backed review overlay store.
- `web/lib/control-tower/feature-request-assembler.ts` — added the shared review-aware assembly seam plus orphaned-review diagnostics.
- `web/lib/control-tower/intervention-engine.ts` — updated intervention analysis to consume enriched review-aware feature requests.
- `web/app/api/control-tower/intervention/route.ts` — rewired intervention brief generation through the shared assembler and exposed diagnostics/stable failure code.
- `web/app/api/control-tower/artifacts/generate/route.ts` — replaced raw-cache casts with assembler-backed lookup and stable error payloads.
- `web/lib/control-tower/artifacts/types.ts` — extended artifact template context with review-aware fields.
- `web/lib/control-tower/artifacts/generator.ts` — wired review and readiness metadata into generated artifact context and content.
- `web/components/intervention/FeatureRequestDetail.tsx` — rendered a durable Review Decision section in the live detail modal.
- `web/tests/control-tower/review-store.test.ts` — locked the persisted review-store contract and isolated fixtures from ambient cache state.
- `web/tests/control-tower/feature-request-assembler.test.ts` — locked the assembled review-aware feature-request contract and orphaned-review diagnostic path.
- `web/tests/control-tower/artifact-generator.test.ts` — locked review-aware drafting context and generated output.
- `web/tests/control-tower/intervention-engine.test.ts` — locked downstream intervention visibility for explicit review presence/absence.
- `.gsd/REQUIREMENTS.md` — marked R004 and R006 validated based on executed slice proof.

## Forward Intelligence

### What the next slice should know
- The stable server-side seam is now `assembleFeatureRequests(...)`; use it instead of reading cached feature requests directly whenever workflow state depends on readiness, intervention, or persisted review metadata.
- Orphaned review state is already a first-class diagnostic path with code `review_feature_request_missing`; preserve that diagnostic contract if S03 adds mutation or workflow capture APIs.
- The runtime UI can display review state now, but there is no editor yet. S03 should treat review capture as the missing user action layer rather than reworking persistence.

### What's fragile
- `GET /api/control-tower/intervention` summary composition is still duplicated in-route — if summary semantics change, the route and engine can drift.
- Review-aware runtime proof is contract/test-backed, not browser-exercised in this slice — S03 should verify the full loop in the live app before claiming end-to-end completion.

### Authoritative diagnostics
- `web/tests/control-tower/feature-request-assembler.test.ts` — best source of truth for assembled review state and orphaned-review diagnostics.
- `POST /api/control-tower/artifacts/generate` failure payloads — best runtime signal for review-aware lookup/generation failures because they expose stable `code` values plus diagnostics.
- `web/lib/control-tower/reviews.ts` and persisted timestamps — best inspection seam for confirming whether review state was actually stored versus only inferred downstream.

### What assumptions changed
- Assumption: review-aware artifact and intervention flows could keep using raw cached feature requests with light patching — Actually, they needed one shared assembler seam to keep runtime, tests, diagnostics, and drafting context from drifting.
- Assumption: absence of review state could be treated implicitly — Actually, downstream consumers needed an explicit `{ present: false, record: null }` shape to avoid ambiguity and support clear UI/rendering behavior.
