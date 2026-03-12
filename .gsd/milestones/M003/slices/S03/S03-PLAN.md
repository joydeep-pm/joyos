# S03: Live approval workflow integration

**Goal:** Wire one browser-visible approval-envelope workflow into the running app so a user can inspect a proposed action, approve it, execute it, and observe executed or failed diagnostics without reading server internals.
**Demo:** In the running `/assistant` UI, a user can create a comms draft, create or inspect its approval envelope, approve the envelope, execute it, and see the resulting executed or failed lifecycle state rendered from the shared route contracts.

## Must-Haves

- Surface at least one approval envelope in live UI with summary, evidence, status, and audit history.
- Allow approve and execute actions from the browser while preserving the approval gate and replay protection.
- Render executed and failed diagnostics from route-backed envelope data instead of local assumptions or draft-only state.

## Proof Level

- This slice proves: final-assembly
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `cd web && npm test -- --run tests/assistant/approval-workflow-ui.test.tsx tests/assistant/approval-envelope-route.test.ts tests/assistant.test.ts`
- `cd web && npm run typecheck`
- `cd web && npm run dev` then browser verification on `/assistant` covering create draft → create/read envelope → approve → execute → inspect executed or failed state

## Observability / Diagnostics

- Runtime signals: approval-envelope lifecycle badges and audit timeline rendered from route-backed record state
- Inspection surfaces: `/assistant` approval workflow card plus `/api/assistant/approval-envelopes` and `/api/assistant/approval-envelopes/[id]`
- Failure visibility: browser-visible failure message plus rendered `failureCode` / `failureMessage` from the persisted envelope record
- Redaction constraints: show envelope evidence, summary, and lifecycle metadata without exposing secrets beyond existing comms draft redaction boundaries

## Integration Closure

- Upstream surfaces consumed: `web/lib/client-api.ts`, `web/lib/types.ts`, `web/app/api/assistant/approval-envelopes/route.ts`, `web/app/api/assistant/approval-envelopes/[id]/route.ts`, `/assistant` comms draft flow
- New wiring introduced in this slice: assistant UI workflow for listing/creating/transitioning approval envelopes and displaying durable execution diagnostics
- What remains before the milestone is truly usable end-to-end: milestone completion, browser proof capture, and milestone-level closeout only

## Tasks

- [x] **T01: Lock browser-visible approval workflow contracts with failing-first UI tests** `est:45m`
  - Why: S03 needs explicit proof of the user-visible workflow and diagnostic rendering before changing the live assistant UI.
  - Files: `web/tests/assistant/approval-workflow-ui.test.tsx`, `web/app/assistant/page.tsx`
  - Do: Add failing-first UI tests covering envelope list/loading, create/approve/execute actions, executed-state rendering, and failed-state rendering from route-backed envelope data.
  - Verify: `cd web && npm test -- --run tests/assistant/approval-workflow-ui.test.tsx`
  - Done when: the new tests fail only because the approval workflow UI has not been wired yet.
- [x] **T02: Wire approval-envelope workflow into the assistant UI** `est:1h30m`
  - Why: The milestone requires a real browser entrypoint, not only route-level proof, for approval-governed execution.
  - Files: `web/app/assistant/page.tsx`, `web/lib/client-api.ts`, `web/lib/types.ts`
  - Do: Add assistant-page state and actions for loading approval envelopes, creating an envelope from the latest draft, approving and executing it, refreshing the selected envelope after transitions, and rendering lifecycle/audit/failure details from route data.
  - Verify: `cd web && npm test -- --run tests/assistant/approval-workflow-ui.test.tsx tests/assistant/approval-envelope-route.test.ts tests/assistant.test.ts`
  - Done when: the assistant UI can drive the approval workflow against real routes and shows executed/failed diagnostics from the persisted envelope record.
- [x] **T03: Verify the live browser workflow and capture slice closeout** `est:45m`
  - Why: S03 is the final assembly slice, so code-level tests are insufficient without exercising the real app in a browser.
  - Files: `web/app/assistant/page.tsx`, `.gsd/milestones/M003/slices/S03/S03-UAT.md`, `.gsd/milestones/M003/slices/S03/S03-SUMMARY.md`
  - Do: Run the local app, exercise the approval workflow in the browser, record the executed or failed diagnostics observed, and write slice closeout artifacts that reflect live behavior truthfully.
  - Verify: Browser pass on `/assistant` plus `cd web && npm run typecheck`
  - Done when: the browser workflow is exercised end to end and the slice artifacts capture what was proven in the running app.

## Files Likely Touched

- `web/tests/assistant/approval-workflow-ui.test.tsx`
- `web/app/assistant/page.tsx`
- `web/lib/client-api.ts`
- `web/lib/types.ts`
- `.gsd/milestones/M003/slices/S03/S03-UAT.md`
- `.gsd/milestones/M003/slices/S03/S03-SUMMARY.md`
