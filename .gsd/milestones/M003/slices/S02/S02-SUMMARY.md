---
id: S02
parent: M003
milestone: M003
provides:
  - One approved comms action family that executes through the approval-envelope seam with durable executed/failed lifecycle state and route-visible diagnostics
requires:
  - slice: S01
    provides: approval-envelope record shape, lifecycle transitions, audit persistence, and stable baseline route contracts
affects:
  - S03
key_files:
  - web/lib/assistant/approval-envelope-store.ts
  - web/app/api/assistant/approval-envelopes/[id]/route.ts
  - web/lib/types.ts
  - web/lib/client-api.ts
  - web/tests/assistant/approval-envelope-execution.test.ts
  - web/tests/assistant/approval-envelope-route.test.ts
key_decisions:
  - Model execution proof around the existing comms send path and treat the envelope as the governing execution seam rather than duplicating approval semantics inside the route or tests
patterns_established:
  - Approval-envelope execution should persist executed and failed state on the same record and expose client-visible diagnostics through the read/transition routes
  - Shared client helpers should consume typed approval-envelope transition payloads instead of route-local literal shapes
observability_surfaces:
  - approval-envelope route responses and persisted records showing approved, executed, failed, and transition_rejected lifecycle events
  - route-readable failureCode, failureMessage, failedBy, executedAt, executedBy, and audit history for downstream UI inspection
drill_down_paths:
  - .gsd/milestones/M003/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M003/slices/S02/tasks/T02-SUMMARY.md
  - .gsd/milestones/M003/slices/S02/tasks/T03-SUMMARY.md
duration: 1h15m
verification_result: passed
completed_at: 2026-03-12
---

# S02: Approved action execution path

**Shipped an approval-envelope-governed comms execution path that records durable executed/failed state and exposes stable client-visible diagnostics.**

## What Happened

S02 turned the approval-envelope model from a review-only lifecycle into a real execution path. I first tightened the execution contract around approved comms sends and fixed the hidden fixture mismatch that made the test depend on unrelated draft-approval behavior. Then I proved the route-level execution behavior end to end: approved envelopes execute exactly once, successful execution returns executed state and timestamps, failed execution persists failure diagnostics on the same envelope record, and replay attempts are rejected through stable route codes. Finally, I formalized the shared client contract by promoting the transition payload into shared types and locking the observable executed/failed response expectations in route tests so S03 can wire a browser-visible workflow without inferring behavior from server internals.

## Verification

- `cd web && npm test -- --run tests/assistant/approval-envelope-store.test.ts tests/assistant/approval-envelope-execution.test.ts tests/assistant/approval-envelope-route.test.ts tests/assistant.test.ts`
- `cd web && npm run typecheck`

## Requirements Advanced

- R202 — advanced from audited approval lifecycle into one real approval-governed execution path with durable executed and failed outcomes.
- R007 — strengthened the hard approval gate by proving route and store behavior reject unapproved and replayed execution attempts.
- R008 — preserved system-of-record boundaries by executing only through the existing comms send seam without shifting authority into route-local state.

## Requirements Validated

- R202 — validated for one action family through passing execution/store/route tests covering approved execution, failure persistence, and client-visible inspection.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

T02 closed mostly through route-contract hardening rather than new production code because the underlying execution seam was already present; the missing gap was proof and client-facing diagnostic clarity.

## Known Limitations

This slice only proves the comms action family. No browser UI consumes the approval-envelope execution diagnostics yet, and other writeback targets like Jira/Confluence remain for later milestone work.

## Follow-ups

S03 should build a live approval workflow that reads and transitions these envelopes from the browser, then verify the executed/failed diagnostics render clearly in the running app.

## Files Created/Modified

- `web/lib/assistant/comms-engine.ts` — allowed explicit approval metadata when building comms draft fixtures for execution-contract tests.
- `web/lib/types.ts` — added executed/failed envelope fields and a shared transition payload contract.
- `web/lib/client-api.ts` — adopted the shared approval-envelope transition payload type.
- `web/tests/assistant/approval-envelope-execution.test.ts` — proved approved and failed execution lifecycle behavior on the envelope record.
- `web/tests/assistant/approval-envelope-route.test.ts` — proved route-level success, failure, replay rejection, and failed-state inspection contracts.

## Forward Intelligence

### What the next slice should know
- The route tests now define the browser-facing contract: execute responses show executed state directly, while failed execution details are read back from the envelope record after the failed transition response.

### What's fragile
- Failed execution currently maps to the broad route code `approval_envelope_transition_failed` even though the underlying record keeps a more specific `failureCode`; UI flows should read the envelope record for detailed failure display.

### Authoritative diagnostics
- `web/tests/assistant/approval-envelope-route.test.ts` — this is the highest-signal source for what S03 can safely assume about success/failure payloads.

### What assumptions changed
- Initial T02 planning assumed significant new runtime implementation would be required — in practice the execution seam already existed and the main work was making its client-visible contract explicit and verified.
