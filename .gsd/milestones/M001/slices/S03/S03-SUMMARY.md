---
id: S03
parent: M001
milestone: M001
provides:
  - End-to-end pre-grooming operating loop integration across review capture, assembled refresh, review-aware artifact generation, and approval-gated comms draft handoff
requires:
  - slice: S01
    provides: Readiness verdicts, missing-context signals, and grooming-review rubric outputs consumed by the live detail and follow-up flows
  - slice: S02
    provides: Persisted review overlay records and assembled feature-request review state consumed by runtime mutation, refresh, and drafting flows
affects:
  - M003/S01
key_files:
  - web/app/api/control-tower/reviews/route.ts
  - web/components/intervention/FeatureRequestDetail.tsx
  - web/app/intervention/page.tsx
  - web/components/artifacts/ArtifactViewer.tsx
  - web/lib/assistant/comms-engine.ts
  - .gsd/REQUIREMENTS.md
key_decisions:
  - Keep review capture on a dedicated mutation API and always refresh visible state from the assembled intervention read path instead of client-local patching
  - Persist fully authored follow-up drafts verbatim in the comms engine while preserving draft-only approval-gated semantics
  - Remove placeholder intervention follow-up alerts so browser-visible workflow state comes from durable UI and API signals only
patterns_established:
  - Mutation routes return structured ok/data or ok/error envelopes with durable code values for validation, missing-target, and persistence failures
  - Runtime review editing rehydrates from assembled server state before claiming success so timestamps and rendered review content stay authoritative
  - Approval-gated comms submission accepts authored artifact payloads verbatim and exposes deterministic inline success or error state in the artifact viewer
observability_surfaces:
  - POST /api/control-tower/reviews with code values control_tower_review_invalid_request, control_tower_review_feature_request_not_found, and control_tower_review_persistence_failed
  - GET /api/control-tower/intervention refresh after review save
  - POST /api/control-tower/artifacts/generate and POST /api/assistant/comms/draft in the live browser flow
  - GET /api/assistant/comms/history for persisted draft inspection
  - web/tests/control-tower/review-mutation-route.test.ts
  - web/tests/control-tower/comms-integration.test.ts
  - web/tests/control-tower/intervention-page-review-refresh.test.tsx
  - ASSISTANT_CACHE_DIR/control-tower/feature-request-reviews.json
  - ASSISTANT_CACHE_DIR/assistant-comms.json
drill_down_paths:
  - .gsd/milestones/M001/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T03-SUMMARY.md
  - .gsd/milestones/M001/slices/S03/tasks/T04-SUMMARY.md
duration: 3h23m
verification_result: passed
completed_at: 2026-03-12
---

# S03: Pre-grooming operating loop integration

**Shipped the live pre-grooming loop: a director can save a review in intervention detail, see refreshed assembled review state immediately, generate a review-aware follow-up, and submit it into the approval-gated comms draft flow without sending.**

## What Happened

S03 closed the last missing action layer for M001. First, the slice locked the expected contracts with failing-first tests for the missing review mutation API and for artifact-to-comms fidelity. It then implemented `POST /api/control-tower/reviews` so review saves validate payloads, confirm the feature request exists through assembled state, persist one overlay-backed review record per feature request, and return durable `code` values on failure.

With the backend seam in place, the intervention detail modal was upgraded from a read-only review surface into a real editor. Users can now create or edit a review decision in place, see inline loading/success/error state, and trigger a fresh `GET /api/control-tower/intervention` after save so the modal re-renders from assembled server state instead of local optimistic patching. That keeps review timestamps, summary text, rationale, pending decisions, and next actions aligned with the same enriched feature-request contract used elsewhere.

The final loop work fixed the approval-gated handoff. Generated follow-up artifacts now survive submission to `/api/assistant/comms/draft` with their authored subject, body, destination, and source date intact. The artifact viewer surfaces deterministic inline submission success or failure instead of transient alerts, and the resulting comms record remains a draft pending later approval/send actions. During live verification, leftover placeholder alerts in the intervention page were removed because they added noise without creating durable workflow state.

## Verification

Verified the full slice contract and runtime behavior with:

- `cd web && npm test -- --run tests/control-tower/review-mutation-route.test.ts tests/control-tower/comms-integration.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/feature-request-assembler.test.ts`
- `cd web && npm run typecheck`
- Live runtime pass on `http://localhost:3000/intervention` using browser tools:
  - opened a real intervention detail modal
  - saved a review through `POST /api/control-tower/reviews`
  - confirmed follow-up refresh via `GET /api/control-tower/intervention`
  - generated a follow-up through `POST /api/control-tower/artifacts/generate`
  - submitted it for approval through `POST /api/assistant/comms/draft`
  - confirmed the approval-gated handoff via network traces and persisted draft inspection semantics
- Observability checks:
  - verified stable route codes exist for review-save failures in route tests and UI error rendering
  - verified runtime browser network sequence exposes review save, intervention refresh, artifact generation, and comms draft creation explicitly
  - verified comms draft creation remains inspectable through persisted history rather than silently sending

## Requirements Advanced

- R001 — The intervention brief now supports a real next-step loop because a director can move from intervention candidate to saved review and follow-up preparation inside the same workflow.
- R003 — Review-aware follow-up drafting makes blocker and stale-dependency visibility more actionable, even though the broader intervention brief itself was already established earlier.

## Requirements Validated

- R002 — S03 proved the full operating loop stays anchored on one assembled feature-request object across review capture, detail refresh, artifact generation, and comms handoff.
- R007 — S03 proved generated follow-up content lands in a draft-only comms path with approval still required before send.
- R008 — S03 proved the overlay model holds under live mutation: source records remain untouched while review state persists in the local overlay and comms handoff remains a separate approval-gated layer.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

The task plan referenced `web/app/control-tower/page.tsx`, but the actual live intervention runtime in this repo is `web/app/intervention/page.tsx`, so refresh wiring and runtime cleanup landed there. Also, placeholder follow-up alerts were removed during T04 because they interfered with the slice demo without contributing any durable state.

## Known Limitations

Only the current comms draft path is proven approval-gated end-to-end. Broader audited writeback into Jira, Confluence, prioritization, assignment, or other execution systems remains deferred to later milestones.

## Follow-ups

- Extend the same approval-envelope and observability discipline from comms drafts to future writeback-capable actions in M003.
- Consider adding a dedicated browser-visible history view for created comms drafts so future verification does not rely on network traces alone.

## Files Created/Modified

- `web/app/api/control-tower/reviews/route.ts` — added the review mutation API with validation, assembled feature-request existence checks, overlay persistence, and stable failure codes.
- `web/components/intervention/FeatureRequestDetail.tsx` — added live review editing, inline save feedback, and review mutation wiring.
- `web/app/intervention/page.tsx` — refreshed intervention data after review save and removed stale placeholder follow-up alerts.
- `web/components/artifacts/ArtifactViewer.tsx` — surfaced inline comms draft submission state and deterministic success/error feedback.
- `web/lib/assistant/comms-engine.ts` — preserved authored artifact subject/body/destination when creating approval-gated drafts.
- `web/tests/control-tower/review-mutation-route.test.ts` — locked the review mutation contract.
- `web/tests/control-tower/comms-integration.test.ts` — locked faithful artifact-to-comms draft persistence.
- `web/tests/control-tower/intervention-page-review-refresh.test.tsx` — verified review-save refresh through the assembled intervention read path.
- `.gsd/REQUIREMENTS.md` — marked R002, R007, and R008 validated based on S03 proof.

## Forward Intelligence

### What the next slice should know
- The most reliable runtime proof for this workflow is the explicit network sequence `POST /api/control-tower/reviews` → `GET /api/control-tower/intervention` → `POST /api/control-tower/artifacts/generate` → `POST /api/assistant/comms/draft`; if that chain breaks, the visible UI symptoms become secondary.

### What's fragile
- Browser assertions against transient inline success text can be timing-sensitive because the artifact viewer closes quickly after successful submission; use network evidence and persisted draft inspection as the authoritative signal when validating the approval handoff.

### Authoritative diagnostics
- `web/tests/control-tower/review-mutation-route.test.ts` and `web/tests/control-tower/comms-integration.test.ts` — these are the fastest trustworthy contract checks for review-save codes and authored-draft fidelity.
- `GET /api/assistant/comms/history` — this is the trustworthy post-submit inspection surface for confirming a draft stayed in `draft` status with authored content preserved.

### What assumptions changed
- The assumption that the artifact viewer only needed an alert after submission was wrong — durable inline success/error state is necessary for future-agent verification and for debugging approval handoff failures without relying on console output.
