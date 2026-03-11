---
estimated_steps: 4
estimated_files: 5
---

# T04: Preserve generated follow-up content through approval-gated comms submission and prove the loop in browser

**Slice:** S03 — Pre-grooming operating loop integration
**Milestone:** M001

## Description

Close the slice by making the generated artifact handoff faithful and proving the end-to-end operating loop in the real app. The artifact viewer must submit the actual generated follow-up content into a comms draft, not ask the comms engine to regenerate a different message, and the result must remain approval-gated.

## Steps

1. Update the artifact-to-comms handoff so the submitted subject/body/destination from the generated artifact are accepted by the comms draft API and stored as a draft without sending.
2. Adjust the comms draft API and underlying engine as needed to support faithful draft persistence while preserving existing approval-required semantics and auditability.
3. Make submission success/failure visible enough in the UI or returned payload to support deterministic browser verification.
4. Run the live app and verify the full loop: open intervention detail, save review, generate follow-up or clarification artifact, submit for approval, and confirm the resulting draft exists while approval/send remain separate actions.

## Must-Haves

- [ ] Approval-gated draft submission preserves generated artifact content and destination instead of silently regenerating a generic message.
- [ ] Browser verification proves the full pre-grooming operating loop works in the live app and stops at draft creation.

## Verification

- `cd web && npm test -- --run tests/control-tower/comms-integration.test.ts tests/control-tower/artifact-generator.test.ts`
- `cd web && npm run typecheck`
- `cd web && npm run dev` plus browser assertions for review save, artifact generation, successful draft submission, and no direct send.

## Observability Impact

- Signals added/changed: Draft-creation payloads or UI success state reflect the created draft identity, while send remains a separate approval-governed state transition.
- How a future agent inspects this: Check `/api/assistant/comms/draft` responses, the persisted comms draft state, and browser-visible confirmation after submission.
- Failure state exposed: Handoff failures become attributable to draft API rejection or persistence mismatch rather than being hidden behind a generic alert.

## Inputs

- `web/components/artifacts/ArtifactViewer.tsx` — current artifact submission trigger that now needs faithful handoff behavior.
- T01/T02/T03 output — locked contracts, working review capture, and refreshed review-aware runtime state needed for the full loop proof.

## Expected Output

- `web/app/api/assistant/comms/draft/route.ts` and `web/lib/assistant/comms-engine.ts` — faithful approval-gated draft persistence for submitted artifacts.
- `web/components/artifacts/ArtifactViewer.tsx` and `web/lib/control-tower/artifacts/comms-integration.ts` — browser-visible handoff that preserves generated follow-up content and destination.
