---
id: S01
parent: M003
milestone: M003
provides:
  - Reusable approval-envelope lifecycle with durable local persistence, explicit approve/deny transitions, and stable inspection routes for downstream automation work
requires:
  - slice: M001/S03
    provides: Existing approval-gated comms lifecycle, draft-safe route patterns, and durable audit discipline reused as the baseline for a generalized envelope model
affects:
  - S02
  - S03
key_files:
  - web/lib/assistant/approval-envelope-store.ts
  - web/app/api/assistant/approval-envelopes/route.ts
  - web/app/api/assistant/approval-envelopes/[id]/route.ts
  - web/lib/types.ts
  - web/lib/client-api.ts
  - web/tests/assistant/approval-envelope-store.test.ts
  - web/tests/assistant/approval-envelope-route.test.ts
key_decisions:
  - Introduce approval envelopes as a dedicated assistant-side persistence and route seam instead of spreading approval state across action-specific routes
  - Keep S01 non-executing: approval envelopes persist intent, state, and audit history, but do not yet trigger underlying write-capable actions
patterns_established:
  - Approval-governed automation should separate envelope lifecycle state from execution so downstream slices can prove approve/deny behavior before wiring live side effects
  - Stable route codes and durable audit entries are mandatory for approval transitions because runtime debugging depends on inspecting why a transition failed without re-running it
observability_surfaces:
  - cd web && npm test -- --run tests/assistant/approval-envelope-store.test.ts tests/assistant/approval-envelope-route.test.ts
  - cd web && npm run typecheck
  - GET /api/assistant/approval-envelopes
  - POST /api/assistant/approval-envelopes
  - GET /api/assistant/approval-envelopes/[id]
  - POST /api/assistant/approval-envelopes/[id]
  - ASSISTANT_CACHE_DIR/assistant-approval-envelopes.json
drill_down_paths:
  - .gsd/milestones/M003/slices/S01/S01-PLAN.md
duration: 1h12m
verification_result: passed
completed_at: 2026-03-12
---

# S01: Approval envelope model and audited lifecycle

**Shipped the first reusable approval-envelope lifecycle for the assistant layer, with durable local persistence, explicit approve/deny transitions, stable inspection routes, and audit history that downstream automation slices can build on without executing anything yet.**

## What Happened

S01 started by locking the approval-envelope boundary with failing-first tests for two seams: a durable store and a set of assistant routes. Those tests defined the core contract for proposed envelopes, approve and deny transitions, invalid transition rejection, missing-envelope lookup, and stable route error codes before implementation began.

The implementation then introduced `web/lib/assistant/approval-envelope-store.ts` as the durable lifecycle seam. Approval envelopes now persist to a local assistant cache file with explicit action type, target type, target id, summary, evidence, actor metadata, timestamps, and audit entries. The store also enforces a simple but explicit lifecycle: envelopes begin in `proposed`, can transition to either `approved` or `denied`, and record a `transition_rejected` audit event when an invalid follow-on action is attempted.

With the store in place, `POST /api/assistant/approval-envelopes`, `GET /api/assistant/approval-envelopes/[id]`, and `POST /api/assistant/approval-envelopes/[id]` were added as the first inspection and transition surfaces. The routes validate payloads, persist envelopes, expose stable failure codes for invalid requests, missing envelopes, and invalid transitions, and deliberately stop short of executing any underlying action. Finally, minimal shared typing and client helpers were added so future slices can consume the approval-envelope seam without reaching into store internals.

## Verification

Passed slice-level checks:

- `cd web && npm test -- --run tests/assistant/approval-envelope-store.test.ts tests/assistant/approval-envelope-route.test.ts`
- `cd web && npm run typecheck`

Observability and diagnostic inspection confirmed:

- `approval-envelope-store.ts` persists envelope state and audit history under `ASSISTANT_CACHE_DIR/assistant-approval-envelopes.json`.
- envelope routes expose proposal, inspection, approval, and denial behavior with stable error codes for invalid transitions and missing envelopes.
- shared `web/lib/types.ts` and `web/lib/client-api.ts` surfaces now expose envelope contracts for downstream slices without leaking store-specific implementation details.

## Requirements Advanced

- R202 — Established the approval-envelope and audit-state foundation required for approval-governed automation.
- R007 — Preserved the hard approval boundary by ensuring S01 records intent and review state only, with no execution path yet.
- R008 — Preserved the overlay model by storing approval lifecycle state locally rather than moving authority into a new external system.

## Requirements Validated

- none

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

The slice originally described a broader route surface, but the minimal useful boundary turned out to be one collection route plus one id-scoped route with transition actions. That narrower shape still satisfies the slice contract and keeps the lifecycle model easier to reuse downstream.

## Known Limitations

- S01 does not execute any underlying action after approval; it only persists and transitions envelope state.
- No browser-visible approval workspace exists yet; inspection is currently route and test driven.
- The envelope model currently covers only proposed, approved, and denied states; executed and failed execution outcomes remain for S02.

## Follow-ups

- Build S02 around one real action family so approved envelopes can transition into executed or failed states with durable audit output.
- Add a browser-visible approval inspection surface in S03 so the lifecycle can be exercised in the running app rather than only through routes and tests.

## Files Created/Modified

- `web/lib/assistant/approval-envelope-store.ts` — added the durable approval-envelope persistence and lifecycle logic.
- `web/app/api/assistant/approval-envelopes/route.ts` — added proposal and list routes for approval envelopes.
- `web/app/api/assistant/approval-envelopes/[id]/route.ts` — added id-scoped envelope inspection plus approve/deny transitions.
- `web/lib/types.ts` — added shared approval-envelope types and audit event contracts.
- `web/lib/client-api.ts` — added minimal client helpers for listing, creating, reading, and transitioning envelopes.
- `web/tests/assistant/approval-envelope-store.test.ts` — locked store lifecycle, audit, and ordering behavior.
- `web/tests/assistant/approval-envelope-route.test.ts` — locked route contracts and stable error codes.

## Forward Intelligence

### What the next slice should know
- The envelope seam is ready for one execution path, but S02 should extend it rather than bypass it; approved execution should update the same durable record rather than creating a second state store.

### What's fragile
- The current lifecycle model is intentionally narrow and does not yet represent execution outcomes, so downstream code must not assume approved means executed.

### Authoritative diagnostics
- `web/tests/assistant/approval-envelope-store.test.ts`, `web/tests/assistant/approval-envelope-route.test.ts`, and `ASSISTANT_CACHE_DIR/assistant-approval-envelopes.json` are the fastest trustworthy signals for whether lifecycle state and audit entries are behaving correctly.

### What assumptions changed
- The initial instinct to treat the existing comms approval flow as “close enough” for downstream automation was wrong — a generalized envelope seam was needed first so later action families can share one lifecycle model instead of inheriting comms-specific behavior.
