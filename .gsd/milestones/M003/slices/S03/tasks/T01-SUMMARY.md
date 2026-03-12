---
id: T01
parent: S03
milestone: M003
provides:
  - Failing-first UI contract tests for browser-visible approval-envelope workflow behavior on `/assistant`
key_files:
  - web/tests/assistant/approval-workflow-ui.test.tsx
  - web/app/assistant/page.tsx
key_decisions:
  - Use the existing `/assistant` page as the S03 browser entrypoint instead of inventing a new approval-specific route
patterns_established:
  - Approval-workflow UI tests should mock the client API layer and assert route-backed executed and failed envelope diagnostics, not local optimistic state
observability_surfaces:
  - failing UI tests for approval workflow rendering and action flow
  - React runtime error in test environment showing the current page is not yet safe for the new approval-workflow test harness
 duration: 20m
verification_result: failed-first
completed_at: 2026-03-12
blocker_discovered: false
---

# T01: Lock browser-visible approval workflow contracts with failing-first UI tests

**Added failing-first UI tests for the approval workflow and exposed the first live wiring blocker in the assistant page test path.**

## What Happened

I created `web/tests/assistant/approval-workflow-ui.test.tsx` to define the S03 browser-visible contract on `/assistant`. The new tests cover the intended workflow shape: load approval-envelope state beside the latest comms draft, approve an envelope, execute it, refresh the persisted record, and render either executed lifecycle state or failed diagnostics from the route-backed envelope record. When I ran the test file, both tests failed before reaching the missing workflow UI assertions because the current `web/app/assistant/page.tsx` render path throws `ReferenceError: React is not defined` in the Vitest/jsdom environment. That is still valid failing-first progress: the contract is written and the current UI cannot satisfy it yet.

## Verification

Ran `cd web && npm test -- --run tests/assistant/approval-workflow-ui.test.tsx`.

Result: 2 tests failed as expected. Current failure is `ReferenceError: React is not defined` from `web/app/assistant/page.tsx`, before approval-workflow assertions can pass.

## Diagnostics

Start with `web/tests/assistant/approval-workflow-ui.test.tsx` for the intended S03 UI contract. If the test crashes before assertions, inspect `web/app/assistant/page.tsx` first; it currently needs React imported explicitly for this test environment before the new workflow wiring can be verified.

## Deviations

The first failing signal is a render-environment issue (`React is not defined`) rather than the expected missing approval-workflow controls, but it still blocks the same next task and should be fixed before wiring the new UI behavior.

## Known Issues

`web/app/assistant/page.tsx` is not yet safe under the new UI test harness, so T02 must first remove that runtime crash and then implement the actual approval workflow UI.

## Files Created/Modified

- `web/tests/assistant/approval-workflow-ui.test.tsx` — added failing-first browser workflow tests for approval-envelope rendering, transitions, and executed/failed diagnostics.
