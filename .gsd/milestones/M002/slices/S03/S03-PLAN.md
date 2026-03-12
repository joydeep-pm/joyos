# S03: 1:1 and IDP drafting loop integration

**Goal:** Turn the people workspace into a complete drafting loop where persisted PM notes and live portfolio evidence generate server-backed 1:1 prep and IDP drafts that remain draft-only or approval-gated.
**Demo:** A user can save PM notes, generate 1:1 prep or IDP draft content from the assembled server-backed people state, and hand the result through the existing draft-safe artifact path without relying on page-local composition.

## Must-Haves

- Generate people-management drafts from a server-backed assembled people context rather than local page string composition.
- Ensure 1:1 prep and IDP outputs materially incorporate persisted people notes plus live PM portfolio evidence.
- Preserve draft-only or approval-gated behavior for people outputs, with inspectable success and failure signals.

## Proof Level

- This slice proves: final-assembly
- Real runtime required: yes
- Human/UAT required: no

## Verification

- `cd web && npm test -- --run tests/control-tower/people-draft-route.test.ts tests/control-tower/people-page-drafts.test.tsx tests/control-tower/people-route.test.ts`
- `cd web && npm run typecheck`
- live browser pass on `/people` covering note save → server-backed draft generation → artifact viewer open → approval-safe draft handoff where applicable

## Observability / Diagnostics

- Runtime signals: draft-generation route responses plus inline UI success/error state in `/people`
- Inspection surfaces: draft-generation API payloads, artifact viewer state, persisted people overlay, and existing comms draft history when handoff is used
- Failure visibility: stable route codes for invalid PM targets or draft generation failures, plus inline UI failure messages
- Redaction constraints: private PM notes remain local-first and must not be auto-shared without explicit approval-gated action

## Integration Closure

- Upstream surfaces consumed: `web/lib/control-tower/people-store.ts`, `web/lib/control-tower/people-assembler.ts`, `/api/control-tower/people`, artifact viewer/comms draft flows from M001
- New wiring introduced in this slice: server-backed people draft generation route, `/people` draft actions on assembled state, and optional approval-safe handoff using existing artifact tooling
- What remains before the milestone is truly usable end-to-end: milestone completion verification only

## Tasks

- [x] **T01: Lock server-backed people draft contracts with failing tests** `est:45m`
  - Why: The slice needs an explicit contract for PM-targeted draft generation and UI refresh behavior before implementation.
  - Files: `web/tests/control-tower/people-draft-route.test.ts`, `web/tests/control-tower/people-page-drafts.test.tsx`
  - Do: Add failing-first tests for server draft generation from persisted people state, stable error codes for unknown PMs, and runtime UI behavior when opening generated drafts.
  - Verify: `cd web && npm test -- --run tests/control-tower/people-draft-route.test.ts tests/control-tower/people-page-drafts.test.tsx`
  - Done when: tests fail only because the draft-generation seam and wiring do not exist yet.
- [x] **T02: Implement assembled people draft generation** `est:1h15m`
  - Why: Drafting needs to move from page-local string builders onto one server-backed seam that consumes persisted people state and live PM evidence together.
  - Files: `web/lib/control-tower/people-assembler.ts`, `web/app/api/control-tower/people/drafts/route.ts`, `web/lib/control-tower/artifacts/types.ts`
  - Do: Build a route or helper that resolves a PM from assembled people state, generates 1:1 prep and IDP artifacts from persisted notes plus portfolio evidence, and returns stable failure codes on missing PM or generation failure.
  - Verify: `cd web && npm test -- --run tests/control-tower/people-draft-route.test.ts`
  - Done when: draft-generation requests return typed artifact payloads grounded in the assembled people state.
- [x] **T03: Wire `/people` to the server-backed drafting loop and verify live runtime flow** `est:1h30m`
  - Why: The milestone is only complete when the browser workflow uses the server-backed draft seam and preserves the draft-only approval boundary.
  - Files: `web/app/people/page.tsx`, `web/components/artifacts/ArtifactViewer.tsx`
  - Do: Replace local draft composition with API-backed draft generation, surface inline loading/error state, and run a live browser pass covering note save, draft generation, artifact viewer open, and any approval-safe handoff used.
  - Verify: `cd web && npm test -- --run tests/control-tower/people-page-drafts.test.tsx && cd web && npm run typecheck`
  - Done when: `/people` can generate server-authored drafts from persisted PM state and live evidence, with browser-verified runtime proof.

## Files Likely Touched

- `web/app/api/control-tower/people/drafts/route.ts`
- `web/lib/control-tower/people-assembler.ts`
- `web/app/people/page.tsx`
- `web/components/artifacts/ArtifactViewer.tsx`
- `web/tests/control-tower/people-draft-route.test.ts`
- `web/tests/control-tower/people-page-drafts.test.tsx`
