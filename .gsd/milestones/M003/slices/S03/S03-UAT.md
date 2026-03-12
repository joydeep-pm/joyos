---
slice: S03
milestone: M003
type: uat
status: passed
executed_at: 2026-03-12
entrypoint: /assistant
environment: local-dev
verified_by: agent
---

# S03 UAT — Live approval workflow integration

## Scope

Verify the `/assistant` page can drive the live approval-envelope workflow end to end using route-backed state, including draft approval, envelope creation, envelope approval, execution, and rendered executed diagnostics.

## Environment

- App: `web`
- Command: `cd web && npm run dev`
- Verified URL: `http://localhost:3001/assistant`
- Note: port `3000` was occupied by another process, so Next.js served the app on `3001`.

## Steps Executed

1. Opened `/assistant` in a browser.
2. Scrolled to the **Approval workflow** section.
3. Approved the latest outbound draft using the **Approve** button in **Outbound updates**.
4. Created a new approval envelope using **Create approval envelope**.
5. Approved the envelope using **Approve envelope**.
6. Executed the envelope using **Execute envelope**.
7. Verified the approval workflow card refreshed from route-backed data and rendered the executed state.

## Expected Result

- Draft can be approved before envelope creation.
- Envelope can be created from an approved draft.
- Envelope can be approved and executed from the `/assistant` page.
- The selected envelope refreshes from route data after transitions.
- The UI shows executed state and audit history without relying on optimistic-only local state.

## Actual Result

Passed.

The page displayed:
- confirmation message `Approval envelope executed.`
- envelope status `EXECUTED`
- detail line `Status: executed`
- audit entry `executed — user`

Network verification showed the expected sequence:
- `POST /api/assistant/comms/:id/approve` → `200`
- `POST /api/assistant/approval-envelopes` → `200`
- `POST /api/assistant/approval-envelopes/:id` (approve) → `200`
- `GET /api/assistant/approval-envelopes/:id` → `200`
- `POST /api/assistant/approval-envelopes/:id` (execute) → `200`
- `GET /api/assistant/approval-envelopes/:id` → `200`

Browser assertions passed with:
- no console errors since the verified run
- no failed requests since the verified run

## Deviations / Notes

- An earlier attempt failed because the envelope had been created from a draft that was still in `draft` status, which truthfully produced a persisted failed envelope with `approval_execution_failed` diagnostics. That surfaced a real UX gap, so the implementation was tightened to require an approved draft before envelope creation.
- There is unrelated dev-environment noise outside the verified run:
  - a `404` for a missing resource during page load
  - a hydration warning from another app previously open on port `3000`
  These were excluded from final pass criteria by asserting diagnostics only since the clean verified interaction on `3001`.

## Pass/Fail

- **Result:** PASS
