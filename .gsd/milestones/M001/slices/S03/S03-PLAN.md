# S03: Pre-grooming operating loop integration

**Goal:** Ship the missing live action layer for pre-grooming work so a director can capture or update feature-request review decisions in the intervention detail flow, generate follow-up artifacts from assembled review-aware state, and hand those artifacts into the approval-gated comms path without bypassing the overlay model.
**Demo:** In the running control tower app, open a feature request from the intervention workflow, save a review decision, see the refreshed review state in the same assembled detail experience, generate a follow-up or clarification artifact that uses the persisted review context, and submit it into the comms draft system where it remains approval-gated.

## Must-Haves

- Add a real review-capture mutation path that validates and persists one current review record per feature request via the existing review overlay store rather than mutating cached source records.
- Wire review capture and editing into the live `FeatureRequestDetail` workflow so review presence/absence becomes actionable, not read-only.
- Keep downstream reads on the assembled feature-request contract so refreshed intervention/detail data and artifact generation stay aligned with S01/S02 readiness and review state.
- Preserve approval-gated behavior: generated follow-up outputs may become comms drafts, but submission must still stop at draft creation and remain inspectable for later approve/send steps.
- Expose stable diagnostics for review mutation or follow-up handoff failures so a future agent can localize whether the issue is validation, missing feature-request assembly, or comms draft creation.
- Prove the assembled loop with both code-level verification and a real browser-driven runtime pass through the live app.

## Proof Level

- This slice proves: final-assembly
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `cd web && npm test -- --run tests/control-tower/review-mutation-route.test.ts tests/control-tower/comms-integration.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/feature-request-assembler.test.ts`
- `cd web && npm run typecheck`
- `cd web && npm run dev` then browser verification of: intervention detail opens, review form saves, refreshed review state renders, generated follow-up includes persisted review context, and submission lands in the approval-gated comms draft flow without sending.
- Browser/runtime diagnostic check: verify review-save failures and draft-submission failures expose stable route `code` values or visible inline error state rather than generic silent failure.

## Observability / Diagnostics

- Runtime signals: stable review-mutation response codes for invalid payload, missing feature request, and persistence failure; stable comms-draft response codes for rejected artifact handoff; refreshed assembled review timestamps rendered in the detail UI.
- Inspection surfaces: `POST /api/control-tower/reviews`, `GET /api/control-tower/intervention`, `POST /api/control-tower/artifacts/generate`, `POST /api/assistant/comms/draft`, persisted review overlay file under `ASSISTANT_CACHE_DIR`, and the live intervention/detail browser flow.
- Failure visibility: mutation payload errors return explicit `code` fields, missing assembled feature requests preserve assembler diagnostics, and the UI surfaces submit/save failure state instead of only relying on console output.
- Redaction constraints: do not log secrets or raw credentials; review text and artifact content may be user-authored business context, so diagnostics should use codes, ids, and bounded error messages instead of dumping full content.

## Integration Closure

- Upstream surfaces consumed: `web/lib/control-tower/reviews.ts`, `web/lib/control-tower/feature-request-assembler.ts`, `web/app/api/control-tower/intervention/route.ts`, `web/app/api/control-tower/artifacts/generate/route.ts`, `web/components/intervention/FeatureRequestDetail.tsx`, `web/components/artifacts/ArtifactViewer.tsx`, and `web/lib/control-tower/artifacts/comms-integration.ts`.
- New wiring introduced in this slice: a review mutation API on top of the persisted overlay store, live review editor state inside the intervention detail modal, refresh wiring back onto assembled feature-request reads, and a faithful artifact-to-comms draft handoff that keeps generated content inside the approval gate.
- What remains before the milestone is truly usable end-to-end: nothing inside M001 scope once browser/UAT confirms the live operating loop language is useful; broader audited writeback beyond comms approval remains deferred to later milestones.

## Tasks

- [x] **T01: Lock the review-mutation and approval-handoff contracts with failing tests** `est:50m`
  - Why: S03 needs executable slice-stop conditions before implementation so review capture, comms handoff fidelity, and diagnostics are proven rather than assumed.
  - Files: `web/tests/control-tower/review-mutation-route.test.ts`, `web/tests/control-tower/comms-integration.test.ts`, `web/tests/control-tower/artifact-generator.test.ts`
  - Do: Add failing tests for a new review mutation route covering create, update, validation failure, and missing feature-request diagnostics; add comms integration tests that prove artifact submission preserves generated subject/body/destination instead of regenerating a generic draft; extend artifact-generation assertions where needed so generated follow-up content clearly reflects persisted review context used in the browser demo.
  - Verify: `cd web && npm test -- --run tests/control-tower/review-mutation-route.test.ts tests/control-tower/comms-integration.test.ts tests/control-tower/artifact-generator.test.ts`
  - Done when: The new tests exist, fail for the current missing behavior, and describe the exact API and handoff contract S03 must satisfy.
- [x] **T02: Implement review mutation API and assembled refresh path** `est:1h10m`
  - Why: The live loop cannot exist until the app can persist review decisions through the overlay model and return refreshed assembled state with stable diagnostics.
  - Files: `web/app/api/control-tower/reviews/route.ts`, `web/lib/control-tower/reviews.ts`, `web/lib/control-tower/types.ts`, `web/tests/control-tower/review-store.test.ts`, `web/tests/control-tower/review-mutation-route.test.ts`
  - Do: Add a server route for create/update review capture that validates required fields, confirms the target feature request exists through assembled/cached lookup, persists through the review overlay store, and returns explicit `code` values plus the saved record; add any small type/store helpers needed to support route-level validation and predictable save semantics without breaking the one-review-per-feature-request contract.
  - Verify: `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/review-mutation-route.test.ts tests/control-tower/feature-request-assembler.test.ts && npm run typecheck`
  - Done when: Review saves are possible through a typed API, invalid or missing-target requests fail with inspectable diagnostics, and all review/store/assembler tests pass.
- [x] **T03: Wire live review editing into the intervention detail workflow** `est:1h20m`
  - Why: S03 must deliver real user-facing progress in the control tower UI, not just backend persistence.
  - Files: `web/components/intervention/FeatureRequestDetail.tsx`, `web/app/control-tower/page.tsx`, `web/lib/control-tower/types.ts`, `web/app/api/control-tower/intervention/route.ts`
  - Do: Add a real review form inside the detail modal for create/edit flows, initialize it from explicit review presence/absence, submit to the new review API, surface save/loading/error states, and refresh the assembled intervention/detail data so persisted review status, rationale, next actions, and timestamps re-render immediately without bypassing the existing intervention read path.
  - Verify: `cd web && npm run typecheck` plus browser verification that saving a review updates the visible detail state after refresh.
  - Done when: A user can create and edit the current review record from the live detail workflow and see the refreshed assembled review state in the same runtime session.
- [x] **T04: Preserve generated follow-up content through approval-gated comms submission and prove the loop in browser** `est:1h10m`
  - Why: The slice is only complete when review-aware drafting and approval-gated handoff work together in the live app.
  - Files: `web/components/artifacts/ArtifactViewer.tsx`, `web/app/api/assistant/comms/draft/route.ts`, `web/lib/control-tower/artifacts/comms-integration.ts`, `web/lib/assistant/comms-engine.ts`, `web/tests/control-tower/comms-integration.test.ts`
  - Do: Fix the artifact submission path so comms draft creation faithfully persists the submitted artifact subject/body/destination while still requiring later approval to send; surface success/failure state clearly enough for browser verification; then run the live app and verify the full pre-grooming loop from intervention detail through draft creation using browser assertions and runtime diagnostics.
  - Verify: `cd web && npm test -- --run tests/control-tower/comms-integration.test.ts tests/control-tower/artifact-generator.test.ts && npm run typecheck`, then `cd web && npm run dev` with browser verification of save review → generate follow-up → submit for approval → confirm draft created and not sent.
  - Done when: Generated follow-up content survives comms draft submission, approval remains mandatory, and the real browser flow proves the end-to-end slice demo.

## Files Likely Touched

- `web/app/api/control-tower/reviews/route.ts`
- `web/components/intervention/FeatureRequestDetail.tsx`
- `web/components/artifacts/ArtifactViewer.tsx`
- `web/app/api/assistant/comms/draft/route.ts`
- `web/lib/control-tower/reviews.ts`
- `web/lib/control-tower/types.ts`
- `web/lib/control-tower/artifacts/comms-integration.ts`
- `web/lib/assistant/comms-engine.ts`
- `web/tests/control-tower/review-mutation-route.test.ts`
- `web/tests/control-tower/comms-integration.test.ts`
- `web/tests/control-tower/artifact-generator.test.ts`
- `web/tests/control-tower/review-store.test.ts`
