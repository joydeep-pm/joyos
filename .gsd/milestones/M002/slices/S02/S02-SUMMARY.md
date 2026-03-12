---
id: S02
parent: M002
milestone: M002
provides:
  - Durable private PM workflow state persisted locally and assembled into the live people workspace with server-backed mutation and refresh behavior
requires:
  - slice: S01
    provides: Live PM portfolio intelligence, assembled people read path, and `/people` runtime wiring on top of synthesized feature-request data
affects:
  - S03
key_files:
  - web/lib/control-tower/people-store.ts
  - web/lib/control-tower/people-assembler.ts
  - web/app/api/control-tower/people/route.ts
  - web/app/api/control-tower/people/notes/route.ts
  - web/app/people/page.tsx
  - web/tests/control-tower/people-store.test.ts
  - web/tests/control-tower/people-mutation-route.test.ts
  - web/tests/control-tower/people-page-notes.test.tsx
key_decisions:
  - Persist private PM coaching and 1:1 metadata in a dedicated local overlay keyed by PM name instead of embedding it in client state or source-system data
  - Refresh the people workspace from the assembled read path after note saves so persisted timestamps and visible people state remain authoritative
patterns_established:
  - PM detail/workflow UI should mutate private people state through a dedicated server route and then rehydrate from the assembled people read path instead of patching local UI state optimistically
  - People-management overlays should expose explicit `{ present, record }` state just like review overlays so missing history is distinguishable from persisted workflow state
observability_surfaces:
  - cd web && npm test -- --run tests/control-tower/people-store.test.ts tests/control-tower/people-mutation-route.test.ts tests/control-tower/people-assembler.test.ts
  - cd web && npm test -- --run tests/control-tower/people-mutation-route.test.ts tests/control-tower/people-route.test.ts tests/control-tower/people-page-notes.test.tsx
  - cd web && npm run typecheck
  - GET /api/control-tower/people
  - POST /api/control-tower/people/notes
  - ASSISTANT_CACHE_DIR/control-tower/people-records.json
  - web/app/people/page.tsx inline save/error state
drill_down_paths:
  - .gsd/milestones/M002/slices/S02/S02-PLAN.md
duration: 2h05m
verification_result: passed
completed_at: 2026-03-12
---

# S02: Durable people workflow state and review surfaces

**Shipped durable private PM workflow state with a local overlay, server-backed note mutation, and a refreshed people workspace that now reads persisted 1:1/coaching data from the assembled PM contract instead of inferring missing history forever.**

## What Happened

S02 began by locking the persistence and mutation boundary with failing-first tests. Those tests defined a new private people overlay store, mutation failure codes, and the expected assembled PM detail shape carrying explicit persisted-state presence or absence. That made the slice’s missing pieces concrete before any implementation started.

The implementation then introduced `web/lib/control-tower/people-store.ts` as the durable local overlay for PM workflow state. The store persists one private people record per PM with timestamps, coaching focus, private notes, and 1:1 dates under the control-tower cache boundary, mirroring the local-first overlay pattern established in M001. `people-types.ts` and `people-assembler.ts` were extended so each PM summary now carries a `peopleRecord` overlay alongside one-on-one status and evidence-driven portfolio context.

With persistence in place, the runtime was rewired to use it. `GET /api/control-tower/people` now reads both persisted people state and persisted reviews before assembling PM portfolios, while `POST /api/control-tower/people/notes` validates payloads, confirms the PM exists in the assembled workspace, persists the overlay record, and returns stable failure codes for invalid requests, missing PMs, and persistence failures. Finally, the `/people` page gained a private people-state panel with editable 1:1 dates, coaching focus, private notes, and updater identity. Saves now go through the mutation route and then re-read the assembled people workspace so the visible state, timestamps, and 1:1 status remain server-authored.

## Verification

Passed slice-level checks:

- `cd web && npm test -- --run tests/control-tower/people-store.test.ts tests/control-tower/people-mutation-route.test.ts tests/control-tower/people-assembler.test.ts`
- `cd web && npm test -- --run tests/control-tower/people-mutation-route.test.ts tests/control-tower/people-route.test.ts tests/control-tower/people-page-notes.test.tsx`
- `cd web && npm run typecheck`

Observability and diagnostic inspection confirmed:

- `people-store.ts` persists stable private PM workflow records under `ASSISTANT_CACHE_DIR/control-tower/people-records.json`.
- `GET /api/control-tower/people` assembles PM summaries with explicit `peopleRecord` overlay state.
- `POST /api/control-tower/people/notes` returns stable route codes for invalid payloads, unknown PM targets, and persistence failures.
- `web/app/people/page.tsx` refreshes from the assembled read path after save and renders inline success/error messages instead of mutating only client-local state.

## Requirements Advanced

- R201 — Added the durable operating layer for PM management by persisting private coaching/1:1 state and surfacing it directly in the live people workspace.
- R007 — Preserved approval-safe behavior by keeping saved people notes private and local rather than auto-sharing or formalizing them.
- R008 — Preserved the overlay model by storing PM workflow state locally and assembling it on top of synthesized portfolio context instead of mutating source systems.

## Requirements Validated

- none

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

The slice plan framed this primarily as “review surfaces,” but the concrete runtime need was a dedicated private people-state panel inside `/people` rather than a separate PM detail route. The work stayed within scope, but the UI landed as inline per-PM editing instead of a standalone detail page.

## Known Limitations

- PM identity is still keyed by `pmOwner` text, so normalization remains thin and name drift can still fragment records.
- Saved people notes do not yet feed a dedicated server-side drafting flow; draft generation still happens locally in the page component.
- Formal approval-aware sharing of people outputs is still deferred to S03 and later milestones.

## Follow-ups

- Build S03 around server-backed people draft generation so persisted notes and evidence materially shape 1:1 prep and IDP outputs beyond local page composition.
- Consider introducing stable PM IDs once the underlying data model supports them, so persisted people records are not vulnerable to name changes.

## Files Created/Modified

- `web/lib/control-tower/people-store.ts` — added the persisted local people overlay store.
- `web/lib/control-tower/people-types.ts` — added `PeopleRecord` and overlay types for assembled PM state.
- `web/lib/control-tower/people-assembler.ts` — extended PM assembly with durable people-record overlay state and derived one-on-one status.
- `web/app/api/control-tower/people/route.ts` — now assembles PM portfolios with persisted people state.
- `web/app/api/control-tower/people/notes/route.ts` — added server-backed mutation for private people notes and 1:1 metadata.
- `web/app/people/page.tsx` — added inline private-state editing, mutation wiring, refreshed assembled reads, and success/error feedback.
- `web/tests/control-tower/people-store.test.ts` — locked private people overlay persistence behavior.
- `web/tests/control-tower/people-mutation-route.test.ts` — locked mutation contract and stable error codes.
- `web/tests/control-tower/people-page-notes.test.tsx` — locked runtime refresh behavior after saving PM notes.

## Forward Intelligence

### What the next slice should know
- The reliable runtime sequence is now `POST /api/control-tower/people/notes` → `GET /api/control-tower/people`; S03 should build draft generation on top of that refreshed assembled state instead of reading form state directly.

### What's fragile
- PM record identity is still based on raw PM name strings — that is the weakest seam in the people workflow and the main source of future duplication risk until normalized IDs exist.

### Authoritative diagnostics
- `web/tests/control-tower/people-mutation-route.test.ts`, `web/tests/control-tower/people-page-notes.test.tsx`, and `ASSISTANT_CACHE_DIR/control-tower/people-records.json` are the fastest trustworthy signals for whether private people state is actually persisted and reloaded correctly.

### What assumptions changed
- The initial assumption that missing 1:1 history could stay just a warning was too weak — the live people workspace needed a real persisted note path before the milestone could become operationally useful.
