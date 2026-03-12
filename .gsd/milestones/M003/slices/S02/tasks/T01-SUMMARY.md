---
id: T01
parent: S02
milestone: M003
provides:
  - Failing-first execution contracts for approved, failed, and duplicate approval-envelope comms execution
key_files:
  - web/tests/assistant/approval-envelope-execution.test.ts
  - web/lib/assistant/comms-engine.ts
  - web/lib/types.ts
  - web/lib/client-api.ts
key_decisions:
  - Model S02 execution tests against an already-approved comms draft so envelope execution proves shared execution governance instead of re-testing draft approval semantics
patterns_established:
  - Execution-path tests should isolate envelope lifecycle behavior while relying on explicit comms approval metadata fixtures
observability_surfaces:
  - approval envelope audit events for executed, execution_failed, and transition_rejected states
  - shared ApprovalEnvelopeRecord status and failure fields for downstream route and UI inspection
duration: 25m
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T01: Lock approved-execution contracts with failing tests

**Added approved-envelope execution coverage and aligned shared execution types with the new lifecycle states.**

## What Happened

I validated the new S02 execution contract by extending the approval-envelope execution test path and then fixing the hidden mismatch that kept the approved-send scenario failing. The root issue was that envelope execution called the comms send path against a draft fixture that still lacked approval metadata, so the test was not isolating envelope execution behavior cleanly. I updated the comms draft factory to accept optional approval fields for explicit test fixtures, revised the execution tests to use already-approved drafts, and extended shared approval-envelope type surfaces and client transition typing so executed and failed state can be consumed downstream.

## Verification

Ran `cd web && npm test -- --run tests/assistant/approval-envelope-store.test.ts tests/assistant/approval-envelope-execution.test.ts tests/assistant/approval-envelope-route.test.ts tests/assistant.test.ts` and all 14 tests passed.

Ran `cd web && npm run typecheck` and TypeScript completed without errors.

## Diagnostics

Future agents should inspect `web/tests/assistant/approval-envelope-execution.test.ts` first for the authoritative execution contract and `web/lib/types.ts` for the shared executed/failed envelope shape used by routes and client code.

## Deviations

Instead of leaving T01 at a purely failing-first checkpoint, I resolved the immediate contract mismatch because the slice already contained most of the runtime support and the test failure was caused by an inconsistent fixture boundary rather than a missing execution lifecycle.

## Known Issues

The route tests still do not assert executed and failed payload shapes over HTTP; that remains part of downstream S02 execution and client-surface closure.

## Files Created/Modified

- `web/tests/assistant/approval-envelope-execution.test.ts` — updated execution fixtures to use explicitly approved comms drafts and keep the contract focused on envelope lifecycle behavior.
- `web/lib/assistant/comms-engine.ts` — allowed explicit approval metadata when creating test comms drafts.
- `web/lib/types.ts` — extended approval-envelope shared status, audit, and failure fields for executed/failed lifecycle inspection.
- `web/lib/client-api.ts` — extended approval-envelope transition typing to include `execute`.
