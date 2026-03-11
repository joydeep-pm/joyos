---
id: M001
provides:
  - Director-grade decision and review operating loop across grooming readiness, durable review capture, assembled feature-request state, and approval-gated follow-up drafting
key_decisions:
  - Keep M001 anchored on the feature-request-centric overlay model by deriving readiness, persisting review decisions in a local overlay, and routing runtime consumers through one assembled feature-request seam
patterns_established:
  - Review and follow-up workflows now rehydrate from assembled server state so readiness, persisted review metadata, intervention analysis, and approval-gated draft handoff stay on one authoritative contract
observability_surfaces:
  - cd web && npm test -- --run tests/control-tower/readiness-evaluator.test.ts tests/control-tower/grooming-engine.test.ts tests/control-tower/intervention-engine.test.ts
  - cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts
  - cd web && npm test -- --run tests/control-tower/review-mutation-route.test.ts tests/control-tower/comms-integration.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/feature-request-assembler.test.ts
  - cd web && npm run typecheck
  - GET /api/control-tower/grooming
  - GET /api/control-tower/intervention
  - POST /api/control-tower/reviews
  - POST /api/control-tower/artifacts/generate
  - POST /api/assistant/comms/draft
  - GET /api/assistant/comms/history
  - ASSISTANT_CACHE_DIR/control-tower/feature-request-reviews.json
  - ASSISTANT_CACHE_DIR/assistant-comms.json
requirement_outcomes:
  - id: R005
    from_status: active
    to_status: validated
    proof: S01 shipped and verified the readiness evaluator, grooming-engine wiring, API serialization, and grooming UI contract through targeted tests and typecheck.
  - id: R004
    from_status: active
    to_status: validated
    proof: S02 verified review-aware artifact generation by routing drafting through the shared assembler and extending artifact context with persisted review decisions, pending decisions, and next actions.
  - id: R006
    from_status: active
    to_status: validated
    proof: S02 proved durable review persistence, assembled review visibility, downstream intervention wiring, and stable orphaned-review diagnostics through review-store, assembler, artifact, and intervention tests.
  - id: R002
    from_status: active
    to_status: validated
    proof: S03 verified the live operating loop keeps review capture, assembled intervention refresh, artifact generation, and comms draft handoff on the same enriched feature-request contract, including a real browser pass.
  - id: R007
    from_status: active
    to_status: validated
    proof: S03 proved generated follow-ups persist into the approval-gated comms draft path without sending, with browser-visible network evidence and comms integration tests.
  - id: R008
    from_status: active
    to_status: validated
    proof: Across S01-S03 the milestone preserved the overlay model by deriving readiness, persisting reviews in the local overlay store, and keeping comms handoff separate from source systems, with live mutation and tests confirming no source-record ownership shift.
duration: 8h04m
verification_result: passed
completed_at: 2026-03-12
---

# M001: Decision and review operating system

**Shipped a director-grade decision and review operating loop that turns the existing control tower into a real pre-grooming workflow with readiness verdicts, durable review decisions, refreshed intervention state, and approval-gated follow-up drafting.**

## What Happened

M001 built the missing operational layer on top of the existing Product Control Tower without breaking the feature-request-centric overlay model. S01 established the machine-readable grooming readiness contract: each feature request can now be evaluated for readiness verdict, rubric dimensions, missing inputs, blocker class, prioritization posture, and recommended next step, and that output is preserved through the grooming engine, API, and grooming UI rather than recomputed ad hoc.

S02 added durability and cross-surface assembly. Director review decisions now persist in a dedicated local overlay keyed to feature requests, and server-side consumers assemble cached feature requests with readiness output, persisted review state, and intervention analysis before rendering details or drafting artifacts. That gave the milestone one stable enriched feature-request contract instead of scattered route-specific patching, and it exposed structured diagnostics when reviews point at missing requests or when downstream generation fails.

S03 completed the live operating loop. The intervention detail flow now supports creating and editing reviews through a dedicated mutation API, then rehydrates visible state from the assembled intervention read path so timestamps, rationale, pending decisions, and next actions remain authoritative. Generated review-aware follow-ups can then be handed into the approval-gated comms draft flow without sending. The milestone finished with a real browser pass through review save, intervention refresh, artifact generation, and draft creation, which proved the slices work together in the assembled app rather than only in isolated tests.

## Cross-Slice Verification

Success criteria and milestone definition of done were verified against shipped evidence, not assumed completion.

- **Success criterion: Joydeep can review any in-flight feature request and see a clear readiness verdict, missing inputs, blockers, and recommended next step before grooming.**
  - Verified by S01 contract and integration evidence:
    - `cd web && npm test -- --run tests/control-tower/readiness-evaluator.test.ts tests/control-tower/grooming-engine.test.ts tests/control-tower/intervention-engine.test.ts`
    - `cd web && npm run typecheck`
    - `evaluateReadiness()` emits verdict, dimension status, missing-input codes, blocker class, prioritization posture, and recommended next step.
    - `GET /api/control-tower/grooming` serializes the richer readiness payload and `web/app/grooming/page.tsx` renders explicit low-readiness and blocked explanations.

- **Success criterion: Joydeep can record review decisions and use them to drive follow-up actions, drafting, and intervention visibility without leaving the control tower workflow.**
  - Verified by S02 and S03 evidence:
    - `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts`
    - `cd web && npm test -- --run tests/control-tower/review-mutation-route.test.ts tests/control-tower/comms-integration.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/feature-request-assembler.test.ts`
    - `FeatureRequestDetail.tsx` renders persisted review presence/absence, rationale, pending decisions, next actions, and timestamps.
    - S03 live browser verification exercised `POST /api/control-tower/reviews` → `GET /api/control-tower/intervention` → `POST /api/control-tower/artifacts/generate` → `POST /api/assistant/comms/draft` from the intervention workflow.

- **Success criterion: The system can support a realistic pre-grooming operating loop using real synthesized feature-request context, not mock-only planning artifacts.**
  - Verified by S03 live runtime proof:
    - real browser pass on `http://localhost:3000/intervention`
    - saved a review through the live mutation route
    - confirmed refresh through the assembled intervention API
    - generated a review-aware follow-up artifact
    - submitted it into the approval-gated comms draft path without sending
    - confirmed approval-gated handoff behavior through network traces and persisted draft inspection semantics.

- **Definition of done: all slices ship substantive working code for review and decision workflows.**
  - Verified: roadmap marks S01, S02, and S03 complete, and each slice summary documents shipped code, tests, and outcomes.

- **Definition of done: readiness logic, decision tracking, and UI surfaces are actually wired into the existing feature-request model.**
  - Verified by the S01 readiness evaluator contract, S02 review-overlay plus assembler seam, and S03 live review edit/refresh flow all operating on the enriched feature-request object.

- **Definition of done: the real browser entrypoint exists and is exercised against the assembled app.**
  - Verified by the S03 browser pass through the live intervention entrypoint and the explicit runtime network sequence across review save, refresh, artifact generation, and comms draft creation.

- **Definition of done: success criteria are re-checked against live behavior, not just test fixtures.**
  - Verified for the end-to-end operating loop by S03 browser execution. S01/S02 still relied primarily on contract coverage for their slice-specific proofs, but M001 as a milestone rechecked the assembled workflow live before completion.

- **Definition of done: final integrated acceptance scenarios pass.**
  - Verified by the assembled live pre-grooming workflow in S03 and by the targeted test suites plus typecheck across S01-S03.

No milestone success criterion was left unmet.

## Requirement Changes

- R005: active → validated — S01 proved the derived readiness evaluator, grouped grooming summary wiring, API serialization, and grooming UI contract through targeted tests and typecheck.
- R004: active → validated — S02 proved review-aware artifact drafting by routing generation through the shared assembler and extending template context with persisted review decisions, pending decisions, and next actions.
- R006: active → validated — S02 proved durable review persistence, explicit assembled review presence/absence, downstream intervention visibility, and orphaned-review diagnostics.
- R002: active → validated — S03 proved the live review capture → assembled refresh → artifact generation → approval-gated comms draft loop stays anchored on one enriched feature-request contract.
- R007: active → validated — S03 proved outward communication remains draft-only and approval-gated, with authored follow-up content preserved intact through comms draft creation.
- R008: active → validated — M001 preserved the overlay model end to end: readiness stayed derived, review decisions persisted locally, and comms handoff remained separate from systems of record.

## Forward Intelligence

### What the next milestone should know
- The stable operating seam is now the assembled feature-request contract; future workflow state should build on `assembleFeatureRequests(...)` and the existing review/comms approval patterns instead of reading raw cache objects directly.

### What's fragile
- Browser verification still depends on a realistic local synthesized dataset and some transient UI states, so future runtime proofs should prefer the explicit network sequence and persisted history surfaces when validating end-to-end flows.

### Authoritative diagnostics
- `web/tests/control-tower/feature-request-assembler.test.ts`, `web/tests/control-tower/review-mutation-route.test.ts`, `web/tests/control-tower/comms-integration.test.ts`, and the runtime sequence `POST /api/control-tower/reviews` → `GET /api/control-tower/intervention` → `POST /api/control-tower/artifacts/generate` → `POST /api/assistant/comms/draft` are the fastest trustworthy signals because they validate the shared contract and the live operating loop directly.

### What assumptions changed
- The initial assumption that review readiness, persistence, and follow-up drafting could be added as light local patches was wrong; the milestone needed explicit derived-evaluator, assembler, and mutation seams to keep UI, APIs, tests, and approval-gated handoff from drifting.

## Files Created/Modified

- `.gsd/milestones/M001/M001-SUMMARY.md` — added the milestone completion record with cross-slice verification, requirement transitions, and forward intelligence.
- `.gsd/PROJECT.md` — confirmed M001 completion and the project’s current operating state.
- `.gsd/STATE.md` — updated the quick-glance state to reflect milestone completion and the next planning target.
