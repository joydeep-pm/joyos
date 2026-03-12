# S01: Approval envelope model and audited lifecycle

**Goal:** Establish a reusable approval-envelope lifecycle with durable audit state, explicit approve/deny transitions, and stable diagnostics before any new write-capable execution path is added.
**Demo:** The system can persist proposed approval envelopes, inspect their lifecycle state, approve or deny them through stable routes, and expose durable audit history and failure diagnostics without executing the underlying action.

## Must-Haves

- Persist approval envelopes and audit events in a durable local overlay rather than route-local state.
- Expose explicit lifecycle transitions for proposed, approved, denied, and invalid transition attempts.
- Return stable route codes and inspection surfaces for envelope lookup, transition failure, and audit inspection.

## Proof Level

- This slice proves: integration
- Real runtime required: no
- Human/UAT required: no

## Verification

- `cd web && npm test -- --run tests/assistant/approval-envelope-store.test.ts tests/assistant/approval-envelope-route.test.ts`
- `cd web && npm run typecheck`

## Observability / Diagnostics

- Runtime signals: durable envelope status, actor, timestamp, and audit event history
- Inspection surfaces: approval-envelope store, read/transition route payloads, and targeted tests
- Failure visibility: stable route codes for invalid request, missing envelope, and invalid lifecycle transitions
- Redaction constraints: envelopes may describe write-capable intent but must not execute or leak sensitive payloads during this slice

## Integration Closure

- Upstream surfaces consumed: existing local overlay persistence patterns and current comms approval lifecycle conventions
- New wiring introduced in this slice: approval-envelope store plus propose/approve/deny/read route surfaces
- What remains before the milestone is truly usable end-to-end: connect one real executable action family to the envelope model and verify runtime browser flow

## Tasks

- [ ] **T01: Lock approval-envelope lifecycle contracts with failing tests** `est:45m`
  - Why: The slice needs executable boundaries for envelope persistence, lifecycle transitions, and stable route codes before implementation starts.
  - Files: `web/tests/assistant/approval-envelope-store.test.ts`, `web/tests/assistant/approval-envelope-route.test.ts`
  - Do: Add failing-first tests for proposal persistence, approve/deny transitions, invalid transition failures, missing-envelope lookup, and route error envelopes.
  - Verify: `cd web && npm test -- --run tests/assistant/approval-envelope-store.test.ts tests/assistant/approval-envelope-route.test.ts`
  - Done when: tests fail only because the new approval-envelope lifecycle seam does not exist yet.
- [ ] **T02: Implement the envelope store and lifecycle routes** `est:1h15m`
  - Why: M003 depends on one authoritative lifecycle model rather than scattered approval state across action-specific routes.
  - Files: `web/lib/assistant/approval-envelope-store.ts`, `web/app/api/assistant/approval-envelopes/route.ts`, `web/app/api/assistant/approval-envelopes/[id]/route.ts`
  - Do: Add a durable approval-envelope store, implement proposal/read/approve/deny route behavior, record audit events and timestamps, and return stable failure codes for missing envelopes and invalid transitions.
  - Verify: `cd web && npm test -- --run tests/assistant/approval-envelope-store.test.ts tests/assistant/approval-envelope-route.test.ts`
  - Done when: approval envelopes can be proposed, inspected, approved, and denied with durable audit history and passing tests.
- [ ] **T03: Expose envelope inspection diagnostics for downstream slices** `est:45m`
  - Why: Downstream execution slices need an inspectable status surface instead of reverse-engineering local store state.
  - Files: `web/lib/types.ts`, `web/lib/client-api.ts`, `web/tests/assistant/approval-envelope-route.test.ts`
  - Do: Add any shared types/client helpers needed for inspection, confirm lifecycle state is externally inspectable, and keep this slice non-executing.
  - Verify: `cd web && npm test -- --run tests/assistant/approval-envelope-route.test.ts && cd web && npm run typecheck`
  - Done when: a future slice can consume approval-envelope state through stable contracts without touching store internals.

## Files Likely Touched

- `web/lib/assistant/approval-envelope-store.ts`
- `web/app/api/assistant/approval-envelopes/route.ts`
- `web/app/api/assistant/approval-envelopes/[id]/route.ts`
- `web/tests/assistant/approval-envelope-store.test.ts`
- `web/tests/assistant/approval-envelope-route.test.ts`
- `web/lib/types.ts`
- `web/lib/client-api.ts`
