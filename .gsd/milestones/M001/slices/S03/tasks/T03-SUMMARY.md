---
id: T03
parent: S03
milestone: M001
provides:
  - Live create/edit review controls in the intervention detail modal with server refresh after save
key_files:
  - web/components/intervention/FeatureRequestDetail.tsx
  - web/app/intervention/page.tsx
  - web/tests/control-tower/intervention-page-review-refresh.test.tsx
key_decisions:
  - Refresh the modal from the assembled intervention API after review save instead of patching the selected feature request locally so rendered review timestamps stay server-authored
patterns_established:
  - Client review mutations surface inline loading/success/error state and then rehydrate from the existing assembled read path before claiming success
observability_surfaces:
  - Inline modal save states in `web/components/intervention/FeatureRequestDetail.tsx`
  - `GET /api/control-tower/intervention` refresh after `POST /api/control-tower/reviews`
  - `web/tests/control-tower/intervention-page-review-refresh.test.tsx`
  - Browser network log showing `POST /api/control-tower/reviews` followed by `GET /api/control-tower/intervention`
duration: 58m
verification_result: passed
completed_at: 2026-03-12T01:05:00+05:30
blocker_discovered: false
---

# T03: Wire live review editing into the intervention detail workflow

**Turned the intervention detail review section into a real editor that saves through the review API, shows inline save state, and rehydrates the modal from assembled intervention data immediately after save.**

## What Happened

Updated `web/components/intervention/FeatureRequestDetail.tsx` to own editable local state for review status, summary, rationale, pending decisions, next actions, and reviewer identity. The form initializes from the explicit review presence/absence contract and resets whenever the selected feature request refreshes.

Added review submission wiring to `POST /api/control-tower/reviews` with visible in-context loading, success, and error messaging. Save failures now stay inside the modal instead of relying on alerts or console output, and route error codes are preserved in the rendered error message when available.

Updated `web/app/intervention/page.tsx` so a successful save triggers a fresh `GET /api/control-tower/intervention`, then replaces the selected feature request with the refreshed assembled record from the latest brief payload. That keeps the review badges, persisted timestamps, and rendered review content aligned with server state rather than optimistic client patching.

Added `web/tests/control-tower/intervention-page-review-refresh.test.tsx` to lock the parent refresh behavior: the page loads initial review-absent state, submits a review, refetches the intervention brief, and re-renders the refreshed review record inside the same detail workflow.

While exercising the UI test path, I also fixed several client components that still depended on an implicit global `React` in the test/runtime transform path by adding explicit React imports to the touched intervention/artifact components.

## Verification

- Passed: `cd web && npm run typecheck`
- Passed: `cd web && npm test -- --run tests/control-tower/intervention-page-review-refresh.test.tsx tests/control-tower/review-mutation-route.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/feature-request-assembler.test.ts`
- Browser verified on the running app at `http://localhost:3001/intervention`:
  - opened a real intervention detail modal
  - entered review fields and saved through `POST /api/control-tower/reviews`
  - confirmed a follow-up `GET /api/control-tower/intervention` refresh occurred
  - confirmed the refreshed review content rendered in the same modal, including updated review timestamps and persisted summary/reviewer values
- Slice-level partial status:
  - green: `review-mutation-route`, `artifact-generator`, `feature-request-assembler`, `typecheck`, live review-save browser flow
  - still failing by design outside T03 scope: `tests/control-tower/comms-integration.test.ts` (T04 handoff work remains)

## Diagnostics

A future agent can inspect this work by:
- opening `/intervention`, saving a review, and checking the inline modal status message
- confirming the browser network sequence shows `POST /api/control-tower/reviews` followed by `GET /api/control-tower/intervention`
- comparing the rendered modal review block with `GET /api/control-tower/intervention` payload contents
- running `cd web && npm test -- --run tests/control-tower/intervention-page-review-refresh.test.tsx`

## Deviations

- The task plan named `web/app/control-tower/page.tsx`, but the live intervention surface in this repo is `web/app/intervention/page.tsx`; refresh wiring was implemented there.
- Added explicit `React` imports to a few client components encountered during test execution because the current transform path still requires them in this codebase.

## Known Issues

- `tests/control-tower/comms-integration.test.ts` still fails until T04 completes the artifact-to-comms approval-gated handoff fidelity work.
- Browser console still shows unrelated missing static asset 404 noise during dev reloads; it did not block the verified intervention review flow.

## Files Created/Modified

- `web/components/intervention/FeatureRequestDetail.tsx` — added editable review form state, inline save feedback, and review mutation submission wiring
- `web/app/intervention/page.tsx` — refreshes assembled intervention data after save and rebinds the selected modal record to the refreshed server result
- `web/tests/control-tower/intervention-page-review-refresh.test.tsx` — verifies review save triggers intervention refresh and re-renders persisted review state
- `web/components/intervention/PmOwnerGroup.tsx` — added explicit React import for client test/runtime compatibility
- `web/components/intervention/FeatureRequestCard.tsx` — added explicit React import for client test/runtime compatibility
- `web/components/intervention/RiskBadge.tsx` — added explicit React import for client test/runtime compatibility
- `web/components/intervention/InterventionReasonBadge.tsx` — added explicit React import for client test/runtime compatibility
- `web/components/intervention/NotesSection.tsx` — added explicit React import for client test/runtime compatibility
- `web/components/artifacts/ArtifactViewer.tsx` — added explicit React import for client test/runtime compatibility
