# S01: Live PM portfolio intelligence and attention model

**Goal:** Replace the mock people workspace foundation with a live assembled PM intelligence seam that derives PM attention, 1:1 urgency, and coaching evidence from real synthesized feature-request data.
**Demo:** The app can return and render real PM portfolio summaries keyed from live feature-request state, with explicit attention signals, evidence entries, and low-confidence diagnostics instead of mock PM profiles.

## Must-Haves

- Assemble PM portfolio summaries from real synthesized feature-request data rather than hard-coded PM profiles.
- Derive explicit PM attention and 1:1 urgency signals with inspectable evidence and low-confidence or missing-signal diagnostics.
- Expose the assembled people contract through a stable runtime seam the `/people` UI can consume.

## Proof Level

- This slice proves: integration
- Real runtime required: no
- Human/UAT required: no

## Verification

- `cd web && npm test -- --run tests/control-tower/people-assembler.test.ts tests/control-tower/people-engine.test.ts`
- `cd web && npm test -- --run tests/control-tower/people-route.test.ts`
- `cd web && npm run typecheck`

## Observability / Diagnostics

- Runtime signals: structured PM diagnostics returned with the assembled people payload
- Inspection surfaces: people read API payload, targeted tests, and `/people` empty/diagnostic UI state
- Failure visibility: stable diagnostic codes for missing PM identity, weak evidence, or empty assembled portfolios
- Redaction constraints: private PM coaching state must not expose anything beyond local synthesized portfolio context

## Integration Closure

- Upstream surfaces consumed: `web/lib/control-tower/feature-request-assembler.ts`, M001 readiness/review-enhanced feature-request contract, existing artifact viewer/types
- New wiring introduced in this slice: server-side PM assembly seam, people read API or equivalent runtime data path, `/people` page rewired off mock local state
- What remains before the milestone is truly usable end-to-end: durable private people workflow state plus live 1:1/IDP drafting loop

## Tasks

- [x] **T01: Lock the PM intelligence contract with failing tests** `est:45m`
  - Why: The slice needs a stable contract for PM grouping, attention status, evidence, and diagnostics before implementation starts.
  - Files: `web/tests/control-tower/people-assembler.test.ts`, `web/tests/control-tower/people-engine.test.ts`, `web/tests/control-tower/people-route.test.ts`
  - Do: Add failing-first tests that define PM summary shape, evidence derivation, low-confidence diagnostics, and route serialization from live assembled feature-request inputs.
  - Verify: `cd web && npm test -- --run tests/control-tower/people-assembler.test.ts tests/control-tower/people-engine.test.ts tests/control-tower/people-route.test.ts`
  - Done when: tests fail only because the new PM assembly seam and runtime route do not exist yet.
- [x] **T02: Implement the assembled PM intelligence seam** `est:1h15m`
  - Why: The milestone depends on one authoritative server-side PM model, not repeated ad hoc grouping in the route or UI.
  - Files: `web/lib/control-tower/people-engine.ts`, `web/lib/control-tower/people-types.ts`, `web/lib/control-tower/people-assembler.ts`
  - Do: Normalize PM identity from live feature-request data, assemble PM portfolio summaries and diagnostics, derive 1:1 urgency plus evidence entries, and preserve explicit low-confidence or missing-signal outputs.
  - Verify: `cd web && npm test -- --run tests/control-tower/people-assembler.test.ts tests/control-tower/people-engine.test.ts`
  - Done when: one reusable PM assembly seam returns typed summaries and diagnostics that satisfy the locked tests.
- [x] **T03: Wire the live people read path and remove mock page data** `est:1h`
  - Why: The slice is only useful if `/people` consumes the assembled PM contract instead of local mocks.
  - Files: `web/app/api/control-tower/people/route.ts`, `web/app/people/page.tsx`
  - Do: Add a runtime read API or equivalent server path for PM intelligence, rewrite the people page to fetch/render live summaries and diagnostics, and preserve clear empty/weak-signal UI states without embedding mock profiles.
  - Verify: `cd web && npm test -- --run tests/control-tower/people-route.test.ts && cd web && npm run typecheck`
  - Done when: the `/people` runtime path is backed by assembled PM data and the mock profile list has been removed.

## Files Likely Touched

- `web/lib/control-tower/people-engine.ts`
- `web/lib/control-tower/people-types.ts`
- `web/lib/control-tower/people-assembler.ts`
- `web/app/api/control-tower/people/route.ts`
- `web/app/people/page.tsx`
- `web/tests/control-tower/people-assembler.test.ts`
- `web/tests/control-tower/people-engine.test.ts`
- `web/tests/control-tower/people-route.test.ts`
