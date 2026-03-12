---
id: M003
status: completed
completed_at: 2026-03-12
verification: passed
slices:
  - S01
  - S02
  - S03
artifacts:
  - .gsd/milestones/M003/slices/S01/S01-SUMMARY.md
  - .gsd/milestones/M003/slices/S02/S02-SUMMARY.md
  - .gsd/milestones/M003/slices/S03/S03-SUMMARY.md
  - .gsd/milestones/M003/slices/S03/S03-UAT.md
---

# M003: Approval-governed automation

## Outcome

M003 is complete.

The product now supports approval-governed automation for one real action family without bypassing human review. Approval envelopes are persisted as durable records with auditable lifecycle state, stable transition diagnostics, and route-backed inspection surfaces. The comms execution path can now move from proposed → approved → executed or failed under the shared approval-envelope model, and the running `/assistant` UI proves that workflow end to end in the browser.

## What Shipped

### S01 — Approval envelope model and audited lifecycle
- Added the shared approval-envelope record shape and lifecycle model.
- Persisted proposed, approved, denied, executed, failed, and rejected-transition state with actor/timestamp audit events.
- Exposed stable routes and diagnostics for envelope creation, inspection, and transitions.

### S02 — Approved action execution path
- Wired one real action family (`comms_send`) into approved envelope execution.
- Proved successful execution returns executed envelope state.
- Proved blocked or invalid transitions return stable error codes.
- Proved failed execution persists inspectable failure state and route-backed diagnostics.

### S03 — Live approval workflow integration
- Wired approval-envelope browsing and transitions into `web/app/assistant/page.tsx`.
- Added UI proof for envelope list/detail rendering, executed state, and failed diagnostics.
- Performed real browser verification on `/assistant` showing draft approval, envelope creation, envelope approval, envelope execution, and refreshed executed audit state.
- Tightened the UI guardrail so comms approval envelopes can only be created from already-approved drafts.

## Success Criteria Re-check

### 1. Inspectable approval envelope before write-capable execution
**Pass.**
Users can inspect a concrete envelope in `/assistant`, including summary, evidence, status, and audit history, before approving and executing it.

### 2. Durable audit state and stable diagnostics
**Pass.**
The system records durable proposed, approved, executed, failed, denied, and rejected-transition lifecycle data with actor/timestamp audit history and stable route-level diagnostics.

### 3. One real action family completes end to end under the approval model
**Pass.**
The comms send path executes through an approved envelope and was verified both by automated tests and by a live browser workflow on `/assistant`.

## Verification

### Automated
- `cd web && npm run typecheck`
- `cd web && npm test -- --run tests/assistant/approval-workflow-ui.test.tsx tests/assistant/approval-envelope-route.test.ts tests/assistant.test.ts`
- Prior slice verification also covered approval-envelope execution/store contracts.

### Live runtime
- `cd web && npm run dev`
- Browser verification on `/assistant` at `http://localhost:3001/assistant`
- Verified:
  - draft approval
  - approval envelope creation
  - envelope approval
  - envelope execution
  - rendered executed diagnostics and audit state
  - no console errors since the verified interaction
  - no failed requests since the verified interaction

See `.gsd/milestones/M003/slices/S03/S03-UAT.md` for the recorded UAT flow.

## Important Decisions Cemented

- Jira remains execution truth, Confluence remains documentation truth, and Personal OS remains the orchestration overlay.
- Approval envelopes are the shared governing seam for approval-gated automation.
- Route-backed persisted state is the source of truth after transitions; the UI refreshes from envelope routes instead of relying on optimistic-only state.
- Live comms envelope creation must require an already-approved draft so execution semantics stay aligned with comms policy and the approval boundary is not weakened.

## Remaining Gaps / Follow-up

- This milestone proves approval-governed automation for one real action family. Broader orchestration across more action families and channels remains for future milestones.
- There is unrelated dev-environment noise from a missing resource and earlier hydration mismatch on another local app instance; this did not invalidate the verified `/assistant` workflow run but should be cleaned up separately if local-dev fidelity becomes a priority.

## Milestone Status

- **Status:** complete
- **Next likely focus:** M004 — expanded orchestration and intelligence
