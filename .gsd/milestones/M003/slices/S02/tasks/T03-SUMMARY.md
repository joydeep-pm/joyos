---
id: T03
parent: S02
milestone: M003
provides:
  - Shared client contract for approval-envelope transitions plus route-verified executed and failed diagnostic payload expectations
key_files:
  - web/lib/types.ts
  - web/lib/client-api.ts
  - web/tests/assistant/approval-envelope-route.test.ts
key_decisions:
  - Promote approval-envelope transition payloads into shared types instead of leaving action literals embedded only in the client helper
patterns_established:
  - Downstream UI should rely on ApprovalEnvelopeRecord plus route-tested absence/presence of failure fields rather than server-internal status assumptions
observability_surfaces:
  - route GET inspection of failed envelopes with persisted failureCode, failureMessage, failedBy, and execution_failed audit state
  - route execute response for successful envelopes with executed state and no failure fields
 duration: 20m
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T03: Expose execution diagnostics for downstream UI wiring

**Finished the shared client contract and route-level diagnostic expectations needed for browser wiring in S03.**

## What Happened

I added a shared `ApprovalEnvelopeTransitionPayload` type in `web/lib/types.ts` and switched `api.transitionApprovalEnvelope` in `web/lib/client-api.ts` to use that contract instead of an inline literal shape. Then I strengthened `web/tests/assistant/approval-envelope-route.test.ts` so downstream UI work has explicit proof of what the route returns: successful execution includes executed state and audit history without failure fields, while failed execution remains inspectable via the read route with persisted `failed` status, `failureCode`, `failureMessage`, `failedBy`, and `execution_failed` audit entries. That closes the remaining S02 gap where S03 would otherwise need to infer client-visible behavior from server internals.

## Verification

Ran `cd web && npm test -- --run tests/assistant/approval-envelope-route.test.ts` and all 5 tests passed.

Ran `cd web && npm run typecheck` and TypeScript completed without errors.

## Diagnostics

Use `web/tests/assistant/approval-envelope-route.test.ts` as the authoritative client-facing contract for envelope execution diagnostics. Use `web/lib/types.ts` for the stable transition payload and record shape shared by browser code.

## Deviations

I did not need additional production route changes because the required diagnostics were already emitted; the missing work was formalizing the shared client payload type and locking the observable contract in tests.

## Known Issues

No browser UI consumes these diagnostics yet; that remains the S03 integration task.

## Files Created/Modified

- `web/lib/types.ts` — added shared approval-envelope transition payload typing.
- `web/lib/client-api.ts` — switched approval-envelope transition helper to the shared payload contract.
- `web/tests/assistant/approval-envelope-route.test.ts` — asserted the exact client-visible executed and failed diagnostic payload expectations.
