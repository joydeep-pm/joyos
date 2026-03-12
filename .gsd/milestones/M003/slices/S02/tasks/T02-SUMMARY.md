---
id: T02
parent: S02
milestone: M003
provides:
  - Route-level proof that approved comms envelopes execute once, surface executed state, and return stable failure and replay errors
key_files:
  - web/tests/assistant/approval-envelope-route.test.ts
  - web/app/api/assistant/approval-envelopes/[id]/route.ts
  - web/lib/assistant/approval-envelope-store.ts
key_decisions:
  - Use route-contract tests to prove execution success and failure diagnostics instead of broadening the store API with route-specific error enums prematurely
patterns_established:
  - Approval-envelope route tests should cover success, approval-required rejection, execution failure, and replay rejection against durable persisted envelope state
observability_surfaces:
  - approval envelope route responses with executed lifecycle payloads and stable error codes for approval-required, invalid-transition, and transition-failed outcomes
  - persisted envelope audit trails and failure fields for post-route inspection
 duration: 30m
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T02: Implement envelope-backed comms execution and result state

**Closed the route-level execution path by proving approved comms envelopes return durable executed state and stable failure diagnostics.**

## What Happened

The core envelope-backed comms execution logic was already present, but the slice still lacked proof that the route surface behaved correctly for downstream consumers. I expanded `web/tests/assistant/approval-envelope-route.test.ts` to cover the full route contract: successful approved execution returning executed state and timestamps, approval-required rejection, provider/metadata failure returning a stable transition failure error, and replay attempts returning invalid-transition. To exercise the failed-execution route deterministically without changing production code, I rewrote the comms cache fixture in-test so the underlying approved draft was missing approval metadata; that forces the send path to fail and lets the envelope persist `failed` state through the real execution route.

## Verification

Ran `cd web && npm test -- --run tests/assistant/approval-envelope-route.test.ts tests/assistant/approval-envelope-execution.test.ts tests/assistant.test.ts` and all 13 tests passed.

Ran `cd web && npm run typecheck` and TypeScript completed without errors.

## Diagnostics

Inspect `web/tests/assistant/approval-envelope-route.test.ts` for the authoritative route behavior matrix. Inspect `web/lib/assistant/approval-envelope-store.ts` when execution failures need deeper lifecycle tracing; it remains the source of persisted `executed`, `failed`, and audit transition state.

## Deviations

I did not change the production route or store logic because the required behavior was already implemented. The remaining gap was missing contract coverage, so T02 closed by hardening route verification rather than adding redundant runtime code.

## Known Issues

The route currently collapses all execution failures into `approval_envelope_transition_failed`; if downstream UI needs finer-grained failure codes, that should be handled in T03 alongside shared client contract expansion.

## Files Created/Modified

- `web/tests/assistant/approval-envelope-route.test.ts` — added route contract coverage for successful execution, failed execution, and replay rejection using durable fixture state.
