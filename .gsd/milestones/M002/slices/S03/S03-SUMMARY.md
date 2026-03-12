---
id: S03
parent: M002
milestone: M002
provides:
  - End-to-end people drafting loop across persisted PM notes, server-backed 1:1/IDP draft generation, and live browser proof from the `/people` workspace
requires:
  - slice: S01
    provides: Live PM portfolio intelligence and assembled people read path
  - slice: S02
    provides: Persisted people overlay state and server-backed note mutation/refresh flow
affects:
  - M003/S01
key_files:
  - web/app/api/control-tower/people/drafts/route.ts
  - web/app/people/page.tsx
  - web/tests/control-tower/people-draft-route.test.ts
  - web/tests/control-tower/people-page-drafts.test.tsx
key_decisions:
  - Move people draft generation onto a dedicated server route that resolves PM context from the assembled people seam instead of composing draft strings only in the page component
  - Reuse the existing artifact viewer and draft-safe handling patterns so people outputs remain draft-only unless explicitly handed into later approval-governed flows
patterns_established:
  - Draft-capable people UI should request server-authored artifacts from assembled PM state, then render them through the same artifact viewer used elsewhere rather than building drafts ad hoc client-side
  - Live browser proof for people workflows should verify both mutation and draft-generation network paths because visible UI text alone is not enough to localize failures
observability_surfaces:
  - cd web && npm test -- --run tests/control-tower/people-draft-route.test.ts tests/control-tower/people-page-drafts.test.tsx tests/control-tower/people-route.test.ts
  - cd web && npm run typecheck
  - POST /api/control-tower/people/drafts
  - POST /api/control-tower/people/notes
  - GET /api/control-tower/people
  - web/app/people/page.tsx inline draft error state
  - live browser assertions and network logs on `/people`
drill_down_paths:
  - .gsd/milestones/M002/slices/S03/S03-PLAN.md
duration: 1h42m
verification_result: passed
completed_at: 2026-03-12
---

# S03: 1:1 and IDP drafting loop integration

**Shipped the live people drafting loop: a director can save PM notes, generate server-authored 1:1 prep or IDP drafts from assembled PM state, and inspect those drafts in the artifact viewer without falling back to page-local placeholder composition.**

## What Happened

S03 closed the last missing action layer for M002. It began by locking the server-backed draft contract with failing-first tests for a dedicated people draft route and for the `/people` page opening generated drafts in the artifact viewer. Those tests made it explicit that server-side PM resolution, stable missing-PM failure codes, and runtime artifact-viewer wiring were required before the milestone could claim end-to-end completion.

The implementation then added `POST /api/control-tower/people/drafts` as the authoritative draft-generation seam. The route assembles PM state from cached feature requests, persisted review overlays, and persisted people records, then generates either 1:1 prep or IDP draft artifacts grounded in persisted notes and live portfolio evidence. It returns stable failure codes for invalid requests, missing PMs, and generation failures instead of silently degrading back to local page logic.

With the server seam in place, the `/people` page was rewired so its “1:1 Prep” and “Draft IDP” actions call the draft route rather than building strings locally. Inline loading/error state was added, and successful responses now open server-authored artifacts in the existing artifact viewer. Final verification included the live browser flow on `/people`: save PM notes through the mutation route, refresh the assembled people workspace, generate an IDP draft through the new server route, and confirm the artifact viewer displays the server-authored draft content.

## Verification

Passed slice-level checks:

- `cd web && npm test -- --run tests/control-tower/people-draft-route.test.ts tests/control-tower/people-page-drafts.test.tsx tests/control-tower/people-route.test.ts`
- `cd web && npm run typecheck`
- Live browser pass on `http://localhost:3000/people`:
  - saved PM notes through `POST /api/control-tower/people/notes`
  - confirmed refresh through `GET /api/control-tower/people`
  - generated an IDP draft through `POST /api/control-tower/people/drafts`
  - confirmed the artifact viewer displayed server-authored draft content derived from persisted PM notes
  - explicit browser assertions passed for saved-note feedback, persisted note text, route usage, and draft content visibility

## Requirements Advanced

- R201 — Completed the people-management operating loop by turning saved PM notes and live portfolio evidence into real 1:1 prep and IDP drafting behavior.
- R007 — Preserved the draft-only trust boundary by generating people outputs as inspectable artifacts rather than silently formalizing or sending them.
- R008 — Preserved the overlay model by generating people drafts from assembled local-first PM state on top of existing synthesized feature-request context.

## Requirements Validated

- R201 — M002 now proves a real PM people-management operating layer through live workspace intelligence, persisted private notes, and server-backed 1:1/IDP drafting with browser verification.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

The original page still contained local helper functions for building draft strings. S03 replaced those runtime actions with server-backed draft generation rather than merely refining the helpers, because milestone completion required one authoritative drafting seam and live runtime proof.

## Known Limitations

- PM identity is still based on PM owner name strings rather than stable normalized IDs.
- The milestone proves draft generation and artifact inspection, but not broader formal approval or outbound sharing for people-management outputs beyond the existing draft-safe artifact path.

## Follow-ups

- Carry the same approval-envelope and observability discipline into M003 if people-management drafts later need audited sharing or writeback.
- Consider extracting the server-side people draft composition into a dedicated helper if future milestones add more people artifact types.

## Files Created/Modified

- `web/app/api/control-tower/people/drafts/route.ts` — added server-backed people draft generation with stable failure codes.
- `web/app/people/page.tsx` — rewired people draft actions to call the server route and open server-authored artifacts with inline loading/error state.
- `web/tests/control-tower/people-draft-route.test.ts` — locked draft-route contract and missing-PM error behavior.
- `web/tests/control-tower/people-page-drafts.test.tsx` — locked runtime draft-generation and artifact-viewer wiring.

## Forward Intelligence

### What the next slice should know
- The trustworthy runtime sequence is now `POST /api/control-tower/people/notes` → `GET /api/control-tower/people` → `POST /api/control-tower/people/drafts`; if people workflow behavior breaks, validate that chain before debugging presentation details.

### What's fragile
- The PM identity seam is still raw PM name text, so persisted records and generated drafts can drift if source naming changes or multiple aliases appear.

### Authoritative diagnostics
- `web/tests/control-tower/people-draft-route.test.ts`, `web/tests/control-tower/people-page-drafts.test.tsx`, and live browser network logs for `/api/control-tower/people/notes`, `/api/control-tower/people`, and `/api/control-tower/people/drafts` are the fastest trustworthy signals because they prove both the contract and the assembled runtime flow.

### What assumptions changed
- The assumption that people draft generation could stay in the page component was wrong — once persisted notes and live PM evidence mattered, the workflow needed a server-authored draft seam to remain inspectable and consistent.
