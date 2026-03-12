# S02: Approved action execution path

**Goal:** Extend the approval-envelope lifecycle so one real action family can move from approved to executed or failed state with durable audit output and a hard guarantee that execution cannot occur without prior approval.
**Demo:** An approved comms send envelope can be proposed against a real draft, explicitly approved, executed through one route/service path, and later inspected as executed or failed with durable audit history and stable failure diagnostics.

## Must-Haves

- Execute exactly one real action family through the shared approval-envelope seam instead of action-specific approval state.
- Persist executed and failed outcome state, timestamps, actor metadata, and audit history on the same envelope record.
- Reject execution attempts for proposed, denied, missing, or already-executed envelopes with stable route codes.

## Proof Level

- This slice proves: integration
- Real runtime required: no
- Human/UAT required: no

## Verification

- `cd web && npm test -- --run tests/assistant/approval-envelope-execution.test.ts tests/assistant/approval-envelope-route.test.ts tests/assistant.test.ts`
- `cd web && npm run typecheck`

## Observability / Diagnostics

- Runtime signals: envelope status transitions including approved, executed, failed, and execution rejection audit entries
- Inspection surfaces: approval-envelope routes, assistant comms history, and durable envelope cache state
- Failure visibility: stable route codes for execution without approval, missing envelope, duplicate execution, and provider failure
- Redaction constraints: execution may invoke the comms send provider but must not leak raw sensitive content beyond existing comms redaction boundaries

## Integration Closure

- Upstream surfaces consumed: `web/lib/assistant/approval-envelope-store.ts`, `web/lib/assistant/comms-engine.ts`, `web/app/api/assistant/approval-envelopes/[id]/route.ts`
- New wiring introduced in this slice: envelope-backed execution path for comms send plus executed/failed lifecycle recording
- What remains before the milestone is truly usable end-to-end: wire the lifecycle into a browser-visible approval workflow and verify it in the running app

## Tasks

- [x] **T01: Lock approved-execution contracts with failing tests** `est:45m`
  - Why: S02 needs executable proof that approval envelopes govern real execution and reject bypasses before implementation begins.
  - Files: `web/tests/assistant/approval-envelope-execution.test.ts`, `web/tests/assistant/approval-envelope-route.test.ts`, `web/tests/assistant.test.ts`
  - Do: Add failing-first tests for approved comms execution, failed provider execution, duplicate execution rejection, and attempts to execute without prior approval.
  - Verify: `cd web && npm test -- --run tests/assistant/approval-envelope-execution.test.ts tests/assistant/approval-envelope-route.test.ts tests/assistant.test.ts`
  - Done when: the new tests fail only because executed/failed lifecycle behavior has not been implemented yet.
- [x] **T02: Implement envelope-backed comms execution and result state** `est:1h15m`
  - Why: The milestone requires at least one real action family to execute from the shared approval seam instead of from route-local approval logic.
  - Files: `web/lib/assistant/approval-envelope-store.ts`, `web/lib/assistant/comms-engine.ts`, `web/app/api/assistant/approval-envelopes/[id]/route.ts`
  - Do: Extend envelope records for executed and failed states, add one execution path that sends a comms draft only from an approved envelope, persist outcome diagnostics on the envelope, and block bypass or replay attempts with stable errors.
  - Verify: `cd web && npm test -- --run tests/assistant/approval-envelope-execution.test.ts tests/assistant/approval-envelope-route.test.ts tests/assistant.test.ts`
  - Done when: one approved comms envelope can execute exactly once and failure states remain inspectable through the same envelope record.
- [x] **T03: Expose execution diagnostics for downstream UI wiring** `est:45m`
  - Why: S03 will need stable inspection and client contracts for executed and failed envelopes without re-reading server internals.
  - Files: `web/lib/types.ts`, `web/lib/client-api.ts`, `web/tests/assistant/approval-envelope-route.test.ts`
  - Do: Extend shared types and helpers to include executed/failed envelope outcomes and verify route inspection exposes the needed diagnostics for browser wiring.
  - Verify: `cd web && npm test -- --run tests/assistant/approval-envelope-route.test.ts && cd web && npm run typecheck`
  - Done when: downstream UI code can consume envelope execution state through stable shared contracts.

## Files Likely Touched

- `web/tests/assistant/approval-envelope-execution.test.ts`
- `web/tests/assistant/approval-envelope-route.test.ts`
- `web/tests/assistant.test.ts`
- `web/lib/assistant/approval-envelope-store.ts`
- `web/lib/assistant/comms-engine.ts`
- `web/app/api/assistant/approval-envelopes/[id]/route.ts`
- `web/lib/types.ts`
- `web/lib/client-api.ts`
