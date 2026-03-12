---
id: T02
parent: S03
milestone: M003
provides:
  - Assistant-page approval workflow UI for loading, selecting, approving, and inspecting approval envelopes
key_files:
  - web/app/assistant/page.tsx
  - web/tests/assistant/approval-workflow-ui.test.tsx
key_decisions:
  - Reuse `/assistant` as the live approval workflow surface instead of introducing a new page, and drive envelope rendering from route-backed records rather than draft-local state
patterns_established:
  - UI tests for approval workflows should assert rendered persisted outcomes instead of brittle intermediate button-enable timing when route refreshes are immediate
observability_surfaces:
  - `/assistant` approval workflow card with envelope status, evidence, audit trail, and failure diagnostics
  - route-backed envelope refresh after approval transitions via `api.getApprovalEnvelope`
duration: 55m
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T02: Wire approval-envelope workflow into the assistant UI

**Wired the approval-envelope workflow into `/assistant` and proved the UI renders persisted executed and failed diagnostics.**

## What Happened

I extended `web/app/assistant/page.tsx` to load approval envelopes alongside the existing assistant data, track a selected envelope, and render a dedicated approval workflow card. The UI can now create an approval envelope from the latest comms draft, list available envelopes, show summary/evidence/audit details, and refresh route-backed envelope state after transitions. I also added explicit rendering for executed and failed lifecycle diagnostics, including `failureCode` and `failureMessage` when present.

The first pass exposed a React import crash in the jsdom test harness and then a mismatch between the UI tests and the component’s immediate refresh behavior. I fixed the runtime crash, stabilized envelope upsert/refresh handling, and updated the tests to assert final rendered persisted state rather than brittle assumptions about intermediate disabled-button timing.

## Verification

- `cd web && npm run typecheck`
- `cd web && npm test -- --run tests/assistant/approval-workflow-ui.test.tsx tests/assistant/approval-envelope-route.test.ts tests/assistant.test.ts`

All commands passed.

## Diagnostics

Use `web/tests/assistant/approval-workflow-ui.test.tsx` as the authoritative UI contract for approval workflow rendering on `/assistant`. Use the approval workflow card in `web/app/assistant/page.tsx` to inspect status, evidence, audit entries, and failed-execution diagnostics in the live app.

## Deviations

The tests were revised from intermediate-button-state assertions to rendered outcome assertions because the component refreshes persisted route state immediately after transitions; the stable truth is the rendered envelope record, not the transient click timing.

## Known Issues

The current UI proves inspection and approval transitions, but the test harness still models execution outcomes through mocked route reads. Real browser verification remains required in T03.

## Files Created/Modified

- `web/app/assistant/page.tsx` — added approval-envelope loading, selection, creation, transition, refresh, and rendered diagnostics.
- `web/tests/assistant/approval-workflow-ui.test.tsx` — proved executed and failed approval workflow states render correctly from route-backed envelope data.
