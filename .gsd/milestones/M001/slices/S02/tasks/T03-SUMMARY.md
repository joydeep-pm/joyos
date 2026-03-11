---
id: T03
parent: S02
milestone: M001
provides:
  - Review-aware intervention and artifact routes backed by the shared assembler, plus visible persisted review state in feature request detail and richer drafting context.
key_files:
  - web/app/api/control-tower/intervention/route.ts
  - web/app/api/control-tower/artifacts/generate/route.ts
  - web/components/intervention/FeatureRequestDetail.tsx
  - web/lib/control-tower/artifacts/types.ts
  - web/lib/control-tower/artifacts/generator.ts
  - web/tests/control-tower/artifact-generator.test.ts
key_decisions:
  - Return stable API error codes and assembler diagnostics from review-aware routes instead of relying on raw-cache casts.
patterns_established:
  - Server routes that need feature-request workflow state should assemble cached requests with persisted reviews before generating briefs or artifacts.
  - Detail UI should render persisted review decisions as first-class workflow state, including rationale, pending decisions, next actions, and timestamps.
observability_surfaces:
  - GET /api/control-tower/intervention success payload diagnostics
  - POST /api/control-tower/artifacts/generate stable code/error/details payloads
  - FeatureRequestDetail review decision section
  - cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts
  - cd web && npm run typecheck
duration: 1h
verification_result: passed
completed_at: 2026-03-11
blocker_discovered: false
---

# T03: Wire enriched review state into intervention APIs, detail UI, and artifact drafting

**Rewired intervention and artifact flows through the shared assembler, exposed stable review-aware API diagnostics, and rendered persisted review decisions directly in the intervention detail modal.**

## What Happened

I replaced raw feature-request cache consumption in both live server routes with assembler-backed lookup using persisted review records from the review overlay. The intervention route now returns assembled review-aware feature requests plus diagnostics, while the artifact generation route returns stable failure codes for invalid requests, empty cache state, missing feature requests, and unexpected generation failures.

I extended artifact template context to carry explicit review presence, rationale, reviewer, pending decisions, and next actions. The generator now uses that context across PRDs, user stories, follow-ups, clarification requests, and status updates so drafting output materially reflects director review state instead of only the base feature-request cache.

I upgraded `FeatureRequestDetail` to show a durable review decision section with visible status, summary, rationale, pending decisions, next actions, reviewer identity, and review timestamps. The quick artifact actions continue to work through the live API route and now surface route-provided errors cleanly.

I also expanded artifact generator coverage to lock the richer review-aware drafting behavior in tests.

## Verification

- Passed: `cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts`
- Passed: `cd web && npm run typecheck`

## Diagnostics

- Inspect assembled intervention payloads via `GET /api/control-tower/intervention`; response now includes `diagnostics` alongside the review-aware brief.
- Inspect artifact generation failures via `POST /api/control-tower/artifacts/generate`; failure payloads now include stable `code` values such as `artifact_generation_invalid_request`, `artifact_generation_cache_empty`, `artifact_generation_feature_request_not_found`, and `artifact_generation_failed`.
- Inspect user-visible review wiring in `web/components/intervention/FeatureRequestDetail.tsx`, especially the `Review Decision` section.
- Inspect drafting behavior through `web/tests/control-tower/artifact-generator.test.ts`.

## Deviations

- None.

## Known Issues

- The intervention route summary string is assembled locally in the route and remains simpler than the helper-generated summary in `intervention-engine.ts`, but the review-aware payload contract and counts are correct.

## Files Created/Modified

- `web/app/api/control-tower/intervention/route.ts` — rewired intervention brief generation through the shared assembler and exposed diagnostics/stable failure code.
- `web/app/api/control-tower/artifacts/generate/route.ts` — replaced raw-cache cast lookup with assembler-backed lookup and stable review-aware error payloads.
- `web/lib/control-tower/artifacts/types.ts` — extended template context with explicit review presence, rationale, reviewer, and action fields.
- `web/lib/control-tower/artifacts/generator.ts` — consumed richer review context across generated artifact types.
- `web/components/intervention/FeatureRequestDetail.tsx` — rendered durable review decision state in the live detail modal.
- `web/tests/control-tower/artifact-generator.test.ts` — added assertions for richer review-aware drafting output.
- `.gsd/DECISIONS.md` — appended the stable review-aware API failure contract decision.
