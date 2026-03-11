# S03: Pre-grooming operating loop integration — UAT

**Milestone:** M001
**Written:** 2026-03-12

## UAT Type

- UAT mode: mixed
- Why this mode is sufficient: S03 requires both live-runtime proof of the review → artifact → draft loop and human judgment that the review language and approval-gated handoff feel operationally useful for pre-grooming prep.

## Preconditions

- `cd web && npm run dev -- --port 3000` is running.
- The seeded control-tower data includes intervention candidates such as `KYC verification API integration for Aadhaar`.
- Browser can reach `http://localhost:3000/intervention`.
- Local cache is writable so review overlay and comms draft files can persist.

## Smoke Test

Open `/intervention`, drill into a feature request needing intervention, save a review, generate a follow-up, and submit it for approval. The loop basically works if the review visibly refreshes and a comms draft is created without sending.

## Test Cases

### 1. Save and refresh a director review from intervention detail

1. Open `http://localhost:3000/intervention`.
2. Open a real intervention candidate such as `KYC verification API integration for Aadhaar`.
3. In the review section, enter a reviewer, summary, rationale, pending decisions, and next actions.
4. Click **Save review**.
5. **Expected:** The UI shows successful save feedback, the detail experience refreshes from assembled intervention data, and the rendered review state now shows the persisted reviewer, summary, and refreshed timestamps.

### 2. Generate a review-aware follow-up and hand it into the approval gate

1. From the same feature-request detail modal, click **Draft Follow-up**.
2. Review the generated artifact content.
3. Click **Submit for Approval**.
4. **Expected:** A comms draft is created from the authored artifact content, approval is still required before send, and no message is sent automatically.

## Edge Cases

### Invalid review payload or missing target feature request

1. Submit an incomplete review payload or target a feature request id that is not present in assembled state.
2. **Expected:** The review API returns a stable `code` such as `control_tower_review_invalid_request` or `control_tower_review_feature_request_not_found`, and the UI surfaces visible inline failure state instead of silently failing.

## Failure Signals

- Saving a review appears to succeed but the modal still shows stale review content or timestamps.
- The runtime does not issue `POST /api/control-tower/reviews` followed by `GET /api/control-tower/intervention` after save.
- Generated follow-up content is replaced by generic assistant draft text during comms submission.
- Submitting for approval sends or approves automatically instead of staying in draft state.
- Failures surface only in console noise with no inline UI message or structured API `code`.

## Requirements Proved By This UAT

- R002 — Proves the live workflow stays anchored on one assembled feature-request contract from intervention detail through review refresh and follow-up drafting.
- R007 — Proves comms submission remains approval-gated by creating a draft without sending.
- R008 — Proves review persistence happens in the private overlay workflow without bypassing the systems-of-record boundary.

## Not Proven By This UAT

- R001 — This UAT does not re-prove the entire morning intervention brief grouping/order behavior; it starts from an already visible intervention candidate.
- R003 — This UAT does not exhaustively prove all blocker and stale-dependency detection logic; it only proves those signals can feed the live follow-up loop.
- Broader audited writeback to Jira, Confluence, prioritization, assignment, or non-comms channels remains out of scope for this slice.

## Notes for Tester

Ignore transient Next.js dev hot-reload noise if it appears during local development, but treat any missing inline success/error state or generic regenerated follow-up text as a real failure. If the submission confirmation text disappears quickly, use network requests and persisted comms draft history as the authoritative signal for whether the approval-gated handoff worked.
