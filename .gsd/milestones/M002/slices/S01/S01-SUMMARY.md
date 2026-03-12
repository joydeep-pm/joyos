---
id: S01
parent: M002
milestone: M002
provides:
  - Live PM portfolio intelligence and people workspace read path built on assembled feature-request data instead of mock PM profiles
requires:
  - slice: M001/S03
    provides: Enriched feature-request assembly, persisted review overlays, and approval-safe draft handling patterns reused by the people workspace
affects:
  - S02
  - S03
key_files:
  - web/lib/control-tower/people-assembler.ts
  - web/app/api/control-tower/people/route.ts
  - web/app/people/page.tsx
  - web/tests/control-tower/people-assembler.test.ts
  - web/tests/control-tower/people-engine.test.ts
  - web/tests/control-tower/people-route.test.ts
key_decisions:
  - Build M002 on a server-side PM portfolio assembler that consumes M001’s enriched feature-request seam instead of extending the mock `/people` page in place
  - Make missing 1:1 history and missing PM ownership explicit diagnostics rather than silently fabricating complete people records
patterns_established:
  - PM-facing runtime UI should fetch one assembled people payload containing PM summaries, portfolio evidence, and diagnostics rather than recomputing from raw feature requests client-side
  - Early people-management slices should prefer low-confidence diagnostics over fake completeness when the repo lacks persisted PM history
observability_surfaces:
  - cd web && npm test -- --run tests/control-tower/people-assembler.test.ts tests/control-tower/people-engine.test.ts tests/control-tower/people-route.test.ts
  - cd web && npm run typecheck
  - GET /api/control-tower/people
  - web/app/people/page.tsx diagnostic and empty-state rendering
  - web/lib/control-tower/people-assembler.ts
  - web/tests/control-tower/people-route.test.ts
drill_down_paths:
  - .gsd/milestones/M002/slices/S01/S01-PLAN.md
duration: 1h20m
verification_result: passed
completed_at: 2026-03-12
---

# S01: Live PM portfolio intelligence and attention model

**Shipped a live people workspace foundation that replaces mock PM profiles with assembled PM portfolio summaries, explicit attention signals, evidence counts, and diagnostics derived from real synthesized feature-request state.**

## What Happened

S01 started by locking the slice boundary with failing-first tests for three things: the reusable PM evidence/attention engine, a server-side PM portfolio assembler, and a runtime people read route. Those tests defined the expected PM summary contract, the missing-owner and missing-1:1-history diagnostics, and the route payload shape before implementation.

The implementation then added `web/lib/control-tower/people-assembler.ts` as the new seam for PM intelligence. Instead of reading raw feature requests directly in the UI, the assembler now consumes the M001 enriched feature-request contract, groups requests by `pmOwner`, carries forward review and intervention context, derives evidence counts from `people-engine.ts`, and emits explicit diagnostics when a feature request has no PM owner or when no persisted 1:1 history exists yet.

With that server seam in place, `GET /api/control-tower/people` was added as the runtime integration boundary. The route reads cached feature requests plus persisted reviews, assembles PM portfolios, returns summary totals, and surfaces diagnostics rather than hiding weak-signal conditions. Finally, the `/people` page was rewritten to fetch that live payload, remove mock PM profile state, render attention-aware PM panels and portfolio context, and generate 1:1 prep and IDP drafts from the assembled PM data instead of hard-coded placeholders.

## Verification

Passed slice-level checks:

- `cd web && npm test -- --run tests/control-tower/people-assembler.test.ts tests/control-tower/people-engine.test.ts tests/control-tower/people-route.test.ts`
- `cd web && npm run typecheck`

Observability and diagnostic inspection confirmed:

- `assemblePmPortfolios(...)` returns typed PM summaries with attention level, one-on-one status, evidence summary, live portfolio entries, and stable diagnostics.
- `GET /api/control-tower/people` serializes assembled PM portfolio data plus diagnostics and explicit empty-state messaging.
- `web/app/people/page.tsx` no longer depends on hard-coded PM profiles and renders live assembled PM context plus diagnostic states.

## Requirements Advanced

- R201 — Established the real people-management operating seam by turning the placeholder people page into a live PM portfolio intelligence workspace with attention signals and coaching evidence.
- R007 — Preserved the approval boundary by keeping people draft actions local and draft-only rather than writing formal records.
- R008 — Preserved the overlay model by deriving people intelligence from existing synthesized feature-request context rather than creating a new formal people system of record.

## Requirements Validated

- none

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

The original placeholder `/people` page looked reusable, but in practice it was too mock-shaped to extend safely. The slice therefore introduced a new server-side `people-assembler` seam and route earlier than the task narrative implied, because removing mock drift required one authoritative runtime data source.

## Known Limitations

- S01 does not persist actual 1:1 history, coaching notes, or PM review state yet; it only exposes missing-history diagnostics and live portfolio intelligence.
- The current draft generation in `/people` still builds local draft content in the page component rather than using a dedicated persisted people-draft workflow.
- Real PM identity is still inferred from `pmOwner` on feature requests, so identity normalization remains thin until S02 adds durable people workflow state.

## Follow-ups

- Build S02 around a persisted people overlay so 1:1 history, coaching notes, or PM review state can replace the current missing-history diagnostic path.
- Consider moving people draft generation onto a dedicated server-backed seam once the durable people workflow model exists.

## Files Created/Modified

- `web/lib/control-tower/people-assembler.ts` — added the assembled PM portfolio seam with attention and diagnostic outputs.
- `web/app/api/control-tower/people/route.ts` — added the runtime people read API over live assembled PM data.
- `web/app/people/page.tsx` — replaced mock PM profile rendering with live fetched PM portfolio summaries, diagnostics, and runtime draft actions.
- `web/tests/control-tower/people-engine.test.ts` — locked evidence extraction, summary generation, and overdue 1:1 helper behavior.
- `web/tests/control-tower/people-assembler.test.ts` — locked PM grouping, attention outputs, and diagnostic behavior.
- `web/tests/control-tower/people-route.test.ts` — locked route serialization and empty-state behavior.

## Forward Intelligence

### What the next slice should know
- The live people workspace now depends on `/api/control-tower/people`; S02 should extend that assembled payload rather than reintroducing local PM state or separate client-side grouping logic.

### What's fragile
- PM identity is currently just `pmOwner` text from feature requests — if names vary across records, the people workspace will fragment PM portfolios until normalization or durable PM metadata is added.

### Authoritative diagnostics
- `web/tests/control-tower/people-assembler.test.ts` and `GET /api/control-tower/people` are the fastest trustworthy signals for whether PM grouping, diagnostics, and live workspace data are still coherent.

### What assumptions changed
- The assumption that the existing people page could be incrementally wired to live data was wrong — it needed a new assembled runtime seam first, otherwise mock state and real state would drift immediately.
