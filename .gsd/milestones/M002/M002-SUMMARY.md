---
id: M002
provides:
  - Live people-management operating loop across PM attention intelligence, persisted private coaching state, and server-backed 1:1/IDP draft generation
key_decisions:
  - Build people-management workflows on the same local-first overlay and assembled-state patterns proven in M001 rather than introducing a separate system of record or page-local workflow state
patterns_established:
  - People workflows now use an assembled PM read seam plus dedicated mutation and draft routes so private notes, attention state, and draft artifacts stay authoritative and inspectable across runtime surfaces
observability_surfaces:
  - cd web && npm test -- --run tests/control-tower/people-assembler.test.ts tests/control-tower/people-engine.test.ts tests/control-tower/people-route.test.ts
  - cd web && npm test -- --run tests/control-tower/people-store.test.ts tests/control-tower/people-mutation-route.test.ts tests/control-tower/people-assembler.test.ts
  - cd web && npm test -- --run tests/control-tower/people-draft-route.test.ts tests/control-tower/people-page-drafts.test.tsx tests/control-tower/people-route.test.ts
  - cd web && npm run typecheck
  - GET /api/control-tower/people
  - POST /api/control-tower/people/notes
  - POST /api/control-tower/people/drafts
  - ASSISTANT_CACHE_DIR/control-tower/people-records.json
  - live browser assertions and network logs on /people
requirement_outcomes:
  - id: R201
    from_status: deferred
    to_status: validated
    proof: M002 proved the live people workspace, persisted private PM state, and server-backed 1:1/IDP drafting loop through targeted tests, typecheck, and a real browser pass on /people.
duration: 4h67m
verification_result: passed
completed_at: 2026-03-12
---

# M002: People management intelligence

**Shipped a real people-management operating layer that turns the placeholder `/people` area into a live PM workspace with attention intelligence, durable private coaching state, and server-backed 1:1 and IDP drafting.**

## What Happened

M002 extended the Product Control Tower beyond feature-request review into Joydeep’s recurring PM management loop without breaking the local-first overlay model. S01 retired the biggest early risk by proving the app could derive useful PM attention signals from live synthesized feature-request context rather than mock PM profiles. It added a server-side PM portfolio assembler, a people read route, and a rewritten `/people` page that now renders PM attention, evidence counts, portfolio context, and explicit diagnostics for weak or missing signals.

S02 then made the people workflow durable. A dedicated people overlay store now persists private PM state such as 1:1 dates, coaching focus, and director notes, and that state is assembled back into PM summaries through the same read seam that drives the page. A dedicated mutation route handles note saves with stable failure codes, and the `/people` page refreshes from the assembled server path after each save instead of relying on optimistic client-local state.

S03 completed the operating loop by moving draft generation onto a dedicated server seam. 1:1 prep and IDP draft actions now resolve assembled PM state from persisted notes plus live portfolio evidence, return server-authored artifacts, and open those drafts in the artifact viewer. The milestone finished with a real browser pass on `/people` that saved PM notes, refreshed the live workspace, generated a server-authored IDP draft, and confirmed the artifact viewer showed content grounded in persisted notes and assembled PM context.

## Cross-Slice Verification

Success criteria and milestone definition of done were verified against executed evidence, not assumed completion.

- **Success criterion: Joydeep can open the people workspace and immediately see which PMs need attention, why they need it, and what evidence supports that assessment.**
  - Verified by S01 contract and runtime wiring evidence:
    - `cd web && npm test -- --run tests/control-tower/people-assembler.test.ts tests/control-tower/people-engine.test.ts tests/control-tower/people-route.test.ts`
    - `cd web && npm run typecheck`
    - `GET /api/control-tower/people` returns assembled PM summaries, evidence counts, one-on-one status, and diagnostics.
    - `web/app/people/page.tsx` renders live PM panels from the assembled payload instead of mock profiles.

- **Success criterion: Joydeep can inspect a PM’s live portfolio context and generate useful 1:1 prep plus feedback/IDP drafts from that context without relying on mock profiles or placeholder-only content.**
  - Verified by S02 and S03 evidence:
    - `cd web && npm test -- --run tests/control-tower/people-store.test.ts tests/control-tower/people-mutation-route.test.ts tests/control-tower/people-assembler.test.ts`
    - `cd web && npm test -- --run tests/control-tower/people-draft-route.test.ts tests/control-tower/people-page-drafts.test.tsx tests/control-tower/people-route.test.ts`
    - the `/people` page now shows persisted private PM state next to live portfolio evidence and uses `POST /api/control-tower/people/drafts` for server-authored drafts.
    - live browser proof confirmed PM note save, workspace refresh, draft generation, and artifact viewer content visibility.

- **Success criterion: The system keeps people-management notes and draft outputs private or approval-gated, and does not silently create formal performance records.**
  - Verified across S02 and S03:
    - people notes persist only in `ASSISTANT_CACHE_DIR/control-tower/people-records.json`
    - note saves occur through a local overlay mutation route, not an external system
    - generated outputs remain artifacts viewed in the draft-safe artifact path
    - browser and route verification showed no silent formal record creation or auto-send behavior

- **Definition of done: all slices ship substantive working code for PM intelligence and people-management workflows.**
  - Verified: S01, S02, and S03 are complete and each has a shipped summary describing code, tests, and proof.

- **Definition of done: PM evidence, draft state, and UI surfaces are wired into live assembled data rather than mock profiles.**
  - Verified by the server-side people assembler, persisted people overlay, people mutation and draft routes, and the live `/people` page using those surfaces end to end.

- **Definition of done: the real browser entrypoint exists and is exercised against the assembled people workflow.**
  - Verified by the live browser pass on `/people` covering note save, assembled refresh, server-backed draft generation, and artifact viewer inspection.

- **Definition of done: success criteria are re-checked against live behavior, not just fixtures or placeholder content.**
  - Verified by the final browser pass and explicit browser assertions against note-save feedback, persisted note content, route usage, and draft content visibility.

- **Definition of done: final integrated acceptance scenarios pass with approval boundaries intact.**
  - Verified by targeted tests, typecheck, and the live `/people` runtime sequence operating on private local notes and draft-safe artifact output only.

No milestone success criterion was left unmet.

## Requirement Changes

- R201: deferred → validated — M002 proved the live people workspace, persisted private PM state, and server-backed 1:1/IDP drafting loop through tests, typecheck, and a real browser pass on `/people`.

## Forward Intelligence

### What the next milestone should know
- The people-management workflow now has the same durable shape as the control-tower review loop: assembled reads, dedicated mutation routes, explicit diagnostics, and server-authored drafts. M003 should reuse those patterns when it adds approval-governed envelopes or audited sharing.

### What's fragile
- PM identity is still keyed by raw `pmOwner` strings from feature-request data, so naming drift remains the main source of duplication or fragmented people records.

### Authoritative diagnostics
- `web/tests/control-tower/people-route.test.ts`, `web/tests/control-tower/people-mutation-route.test.ts`, `web/tests/control-tower/people-draft-route.test.ts`, `web/tests/control-tower/people-page-drafts.test.tsx`, and the live `/people` network sequence `POST /api/control-tower/people/notes` → `GET /api/control-tower/people` → `POST /api/control-tower/people/drafts` are the fastest trustworthy signals because they cover both contract integrity and real runtime assembly.

### What assumptions changed
- The initial assumption that the people area could be upgraded with light page-level enhancements was wrong — useful PM management workflows required the same explicit server seams, persisted overlays, and observability discipline that M001 established for review workflows.

## Files Created/Modified

- `.gsd/milestones/M002/M002-SUMMARY.md` — added the milestone completion record with cross-slice verification and requirement transition evidence.
- `.gsd/REQUIREMENTS.md` — moved R201 from deferred to validated with milestone proof.
- `.gsd/PROJECT.md` — needs milestone-current-state update for the shipped people-management operating layer.
- `.gsd/STATE.md` — needs advancement to the next planning target after M002 completion.
