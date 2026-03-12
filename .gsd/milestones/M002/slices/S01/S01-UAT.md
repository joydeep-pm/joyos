# S01: Live PM portfolio intelligence and attention model — UAT

**Milestone:** M002
**Written:** 2026-03-12

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S01 proves the live assembled people read path and UI wiring through tests and typecheck, but durable people workflow state and end-to-end browser/runtime proof are intentionally deferred to later slices.

## Preconditions

- `web/` dependencies are installed
- synthesized feature-request data exists in local cache for meaningful PM portfolio rendering, or the empty-state path is acceptable for smoke testing
- the app is running locally if a human wants to inspect `/people`

## Smoke Test

Open `/people` and confirm the page no longer shows hard-coded placeholder PM names; it should either render live PM portfolio panels or an explicit empty-state message from the people API.

## Test Cases

### 1. Live PM summary rendering

1. Start the web app locally.
2. Open `/people`.
3. Confirm the page loads without build/runtime errors.
4. **Expected:** the page shows live PM summary totals and attention-aware PM panels, or a structured empty state if no feature requests are cached.

### 2. Diagnostic visibility

1. Load `/people` with a dataset where PM history is missing or PM ownership is incomplete.
2. Inspect the diagnostics section.
3. **Expected:** missing-history or missing-owner conditions are surfaced explicitly instead of being hidden behind fake completed PM records.

## Edge Cases

### Empty cache

1. Run the app with no cached feature requests.
2. Open `/people`.
3. **Expected:** the page shows the empty-state message from `GET /api/control-tower/people` and does not render mock PMs.

## Failure Signals

- `/people` still renders placeholder PM names or hard-coded email addresses
- the page crashes while fetching `/api/control-tower/people`
- diagnostics are missing when PM history or owner mapping is incomplete
- typecheck or people route tests fail

## Requirements Proved By This UAT

- R201 — proves the people-management workspace is now anchored on live PM portfolio intelligence instead of a static placeholder shell

## Not Proven By This UAT

- persistent 1:1 history, coaching notes, or PM review state
- end-to-end live browser proof for draft handoff or approval-gated people workflows

## Notes for Tester

This slice intentionally reports missing 1:1 history as a diagnostic because S02 has not added durable people workflow state yet. Treat that warning as expected unless later slices say otherwise.
