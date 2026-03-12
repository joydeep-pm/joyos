# S01: Approval envelope model and audited lifecycle — UAT

**Milestone:** M003
**Written:** 2026-03-12

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S01 proves lifecycle persistence, route contracts, and audit visibility through tests and typecheck; no browser-visible approval workspace or execution path exists yet.

## Preconditions

- `web/` dependencies are installed
- the local assistant cache directory is writable

## Smoke Test

Create an approval envelope through the route, read it back, approve it, and confirm the stored audit history shows both `proposed` and `approved` events.

## Test Cases

### 1. Propose and inspect an approval envelope

1. Call `POST /api/assistant/approval-envelopes` with a valid payload.
2. Read the resulting id through `GET /api/assistant/approval-envelopes/[id]`.
3. **Expected:** the envelope is returned in `proposed` status with durable audit history.

### 2. Reject an invalid transition

1. Approve a proposed envelope.
2. Attempt to deny the same envelope afterward.
3. **Expected:** the route returns `approval_envelope_invalid_transition` and the audit log records a rejected transition.

## Edge Cases

### Missing envelope lookup

1. Call `GET /api/assistant/approval-envelopes/[id]` with a nonexistent id.
2. **Expected:** the route returns `approval_envelope_not_found` and no envelope state is fabricated.

## Failure Signals

- envelope transitions succeed without writing audit entries
- missing envelopes return generic 500 errors instead of stable not-found codes
- approved or denied state is lost between requests
- downstream code has to read the store file directly because route contracts are insufficient

## Requirements Proved By This UAT

- R202 — proves approval envelopes and audited state transitions now exist as durable local workflow state
- R007 — proves approval review state can be recorded without executing the underlying action yet

## Not Proven By This UAT

- execution of an approved write-capable action
- browser-visible approval workflow

## Notes for Tester

This slice intentionally stops at lifecycle state. An `approved` envelope does not imply the underlying action was executed; that boundary is reserved for the next slice.
