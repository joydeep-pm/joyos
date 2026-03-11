---
id: T04
parent: S03
milestone: M001
provides:
  - Faithful approval-gated comms draft persistence for generated follow-up artifacts plus live browser proof of the pre-grooming loop
key_files:
  - web/lib/assistant/comms-engine.ts
  - web/components/artifacts/ArtifactViewer.tsx
  - web/app/intervention/page.tsx
  - web/tests/control-tower/comms-integration.test.ts
key_decisions:
  - Taught the comms engine to persist fully-authored drafts verbatim when subject/body/destination are provided instead of regenerating generic content
  - Removed placeholder intervention-page alerts that added noise to the live artifact-generation loop without creating durable workflow state
patterns_established:
  - Approval-gated draft creation accepts faithful authored payloads while keeping approve/send as separate later transitions
  - Browser-visible submission state should expose created draft identity or stable failure text instead of relying on alerts
observability_surfaces:
  - POST /api/assistant/comms/draft response payload
  - GET /api/assistant/comms/history
  - ArtifactViewer inline submission message/error state
  - browser network log showing POST /api/control-tower/reviews, POST /api/control-tower/artifacts/generate, POST /api/assistant/comms/draft
duration: 1h05m
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T04: Preserve generated follow-up content through approval-gated comms submission and prove the loop in browser

**Shipped faithful artifact-to-comms draft persistence, exposed deterministic submission feedback in the artifact viewer, removed stale placeholder alerts from the intervention page, and proved the review → artifact → draft loop in the live app.**

## What Happened

The comms draft route was already recognizing artifact-submitted payloads, but the fallback comms engine still regenerated a generic stakeholder draft and discarded the authored subject/body/source date. I fixed the root cause in `web/lib/assistant/comms-engine.ts` by extending `createCommsDraft` to support two modes: generated drafts when only high-level inputs are supplied, and faithful persistence when a complete authored draft payload is supplied. In the faithful path, the engine now stores the submitted subject, body, destination, status, and source date as-is while preserving `requiresApproval` and leaving approval/send as separate later transitions.

For browser-proofable UX, I replaced the artifact viewer’s alert-based submission handling with inline success/error state that parses the API envelope, surfaces route error codes when present, and shows the created draft id plus destination after successful submission. This gives a future agent a deterministic on-screen signal instead of relying on transient dialogs.

During live verification I found one leftover runtime mismatch: `app/intervention/page.tsx` still fired “Coming in next task” alerts from the `onDraftFollowup` and related callbacks even though artifact generation was already real. Those alerts were non-blocking but polluted the loop, so I removed the placeholder side effects and kept the callbacks inert.

## Verification

- Passed targeted contract checks:
  - `cd web && npm test -- --run tests/control-tower/comms-integration.test.ts tests/control-tower/artifact-generator.test.ts`
- Passed slice-level code verification:
  - `cd web && npm run typecheck`
  - `cd web && npm test -- --run tests/control-tower/review-mutation-route.test.ts tests/control-tower/comms-integration.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/feature-request-assembler.test.ts`
- Passed live browser verification against the running app on `http://localhost:3002/intervention`:
  - opened intervention detail for `Co-lending repayment strategy for HDFC integration`
  - saved a director review through `POST /api/control-tower/reviews`
  - confirmed refresh via `GET /api/control-tower/intervention` and rendered `Reviewed by Joy Director`
  - generated a follow-up artifact through `POST /api/control-tower/artifacts/generate`
  - submitted it for approval through `POST /api/assistant/comms/draft`
  - verified persisted comms state with `GET /api/assistant/comms/history`, which showed the latest draft as:
    - `status: "draft"`
    - preserved subject `Follow-up: Co-lending repayment strategy for HDFC integration`
    - preserved generated body including persisted review context
    - no `approvedAt` or `sentAt`

## Diagnostics

- Inspect the latest draft payload via `GET /api/assistant/comms/history`.
- Inspect creation responses via `POST /api/assistant/comms/draft`.
- In the browser, the artifact viewer now renders inline submission success/error state instead of only alerts.
- Browser network proof for the live loop shows the sequence:
  - `POST /api/control-tower/reviews`
  - `GET /api/control-tower/intervention`
  - `POST /api/control-tower/artifacts/generate`
  - `POST /api/assistant/comms/draft`
- Persisted approval state remains inspectable because the created comms record stays in `draft` status until later explicit approve/send routes run.

## Deviations

- Removed stale placeholder alerts from `web/app/intervention/page.tsx` because they were leftover scaffolding that interfered with the slice’s required live-loop proof.

## Known Issues

- The local dev session emitted some unrelated 404s for transient Next.js dev assets during hot reload, but they did not affect the verified review/artifact/comms workflow.

## Files Created/Modified

- `web/lib/assistant/comms-engine.ts` — added faithful authored-draft persistence while preserving approval-gated semantics for generated and submitted drafts
- `web/components/artifacts/ArtifactViewer.tsx` — replaced alert-only submission handling with inline success/error state and draft-id confirmation
- `web/app/intervention/page.tsx` — removed stale placeholder alerts from follow-up/clarification/note callbacks to keep the runtime loop clean
- `.gsd/DECISIONS.md` — recorded the UI decision to keep follow-up callbacks side-effect free unless they add durable workflow behavior
