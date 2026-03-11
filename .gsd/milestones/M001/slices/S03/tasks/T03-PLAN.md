---
estimated_steps: 4
estimated_files: 4
---

# T03: Wire live review editing into the intervention detail workflow

**Slice:** S03 — Pre-grooming operating loop integration
**Milestone:** M001

## Description

Turn the read-only review section into a real operating surface. This task adds review creation and editing to the existing intervention detail flow, keeps the client on browser-safe imports, and refreshes the assembled runtime state so the saved decision immediately becomes visible in the same workflow.

## Steps

1. Add local form state to `FeatureRequestDetail` for review status, summary, rationale, pending decisions, next actions, and reviewer identity, initialized from the explicit review presence/absence contract.
2. Submit the form to the new review API with loading/success/error states that are visible in the UI instead of relying only on alerts or console output.
3. Wire the parent intervention workflow to refresh assembled feature-request data after save so the modal re-renders the persisted review record and updated timestamps from the server path.
4. Keep client imports browser-safe and avoid introducing any direct client dependency on the server-only control-tower barrel.

## Must-Haves

- [ ] The live detail modal supports both first-time review capture and editing the current review record.
- [ ] The UI refreshes from assembled server data after save and surfaces submit failures explicitly.

## Verification

- `cd web && npm run typecheck`
- Browser verification in the running app that a saved review updates the visible review section, including status and timestamps, without a manual page reload.

## Observability Impact

- Signals added/changed: Visible save/loading/error state in the detail modal and refreshed rendered review timestamps.
- How a future agent inspects this: Use the live intervention detail UI plus `GET /api/control-tower/intervention` to compare rendered review state with assembled API state.
- Failure state exposed: Save failures are visible in-context in the modal, making it clear whether the issue is API rejection versus stale UI refresh wiring.

## Inputs

- `web/components/intervention/FeatureRequestDetail.tsx` — existing review display surface and artifact-generation entrypoint.
- T02 output — review mutation API and stable route payloads used by the new form submission flow.

## Expected Output

- `web/components/intervention/FeatureRequestDetail.tsx` — real review editor with submit and refresh behavior.
- `web/app/control-tower/page.tsx` or equivalent intervention parent surface — refresh wiring that rehydrates assembled review-aware feature requests after save.
