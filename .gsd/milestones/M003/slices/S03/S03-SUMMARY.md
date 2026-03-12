---
id: S03
milestone: M003
title: Live approval workflow integration
status: completed
completed_at: 2026-03-12
verification: passed
artifacts:
  - .gsd/milestones/M003/slices/S03/S03-UAT.md
  - .gsd/milestones/M003/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M003/slices/S03/tasks/T02-SUMMARY.md
---

# S03: Live approval workflow integration

## Outcome

Completed the final assembly slice for approval-governed comms execution on `/assistant`.

The assistant UI now supports a browser-visible approval-envelope workflow that uses route-backed records as the source of truth. A user can approve the underlying outbound draft, create an approval envelope, approve the envelope, execute it, and inspect refreshed envelope status, evidence, audit history, and failure diagnostics directly on the existing `/assistant` page.

## What Changed

### UI integration
- Wired approval-envelope loading into `web/app/assistant/page.tsx`.
- Added selection and detail rendering for approval envelopes.
- Added actions for envelope creation, approval, execution, and route-backed refresh.
- Rendered executed and failed diagnostics from persisted envelope data.
- Tightened envelope creation so it only operates on an already-approved draft, preventing invalid live execution flows.

### Verification contract
- Added and stabilized `web/tests/assistant/approval-workflow-ui.test.tsx` as the UI contract for the approval workflow.
- Verified route behavior remained aligned with S02 execution contracts via route tests.
- Performed real browser UAT on the live app and captured truthful evidence in `S03-UAT.md`.

## Key Decisions Reinforced

- `/assistant` remains the entrypoint for live approval workflow interaction.
- Approval envelopes remain the governing execution seam; draft UI does not bypass envelope review.
- Persisted route state is the truth after transitions; the UI refreshes envelope details from the route instead of trusting transient local assumptions.
- Envelope creation now requires an approved draft so the live workflow cannot create obviously non-executable comms envelopes from draft-only state.

## Verification

### Automated
- `cd web && npm run typecheck`
- `cd web && npm test -- --run tests/assistant/approval-workflow-ui.test.tsx tests/assistant/approval-envelope-route.test.ts tests/assistant.test.ts`

### Browser UAT
- Ran `cd web && npm run dev`
- Verified `/assistant` on `http://localhost:3001/assistant`
- Confirmed end-to-end flow:
  - draft approval
  - envelope creation
  - envelope approval
  - envelope execution
  - executed diagnostics and audit refresh

See `.gsd/milestones/M003/slices/S03/S03-UAT.md` for the exact sequence and results.

## Risks / Follow-up

- There is unrelated dev-mode console noise from a missing resource and an earlier hydration mismatch on a different local app/port. These did not affect the verified `/assistant` workflow run, but they remain worth cleaning up separately if broader local-dev polish is needed.
- The workflow now blocks envelope creation for non-approved drafts in the UI, which closes the live gap discovered during browser verification.

## Slice Status

- **S03 status:** complete
- **Milestone impact:** approval-governed comms workflow is now integrated into the browser-facing assistant experience with both automated and live verification.
