# S02: Durable people workflow state and review surfaces

**Goal:** Add a persisted people-management overlay so PM detail workflows can carry durable 1:1 history or coaching notes alongside live PM portfolio evidence without falling back to client-local state.
**Demo:** A PM detail workflow can show live portfolio evidence plus persisted private people-management state, and missing-history diagnostics are replaced by explicit stored records or explicit no-record state.

## Must-Haves

- Persist private people-management workflow state in a local overlay rather than client-local memory or source records.
- Expose a stable assembled PM detail contract that combines live portfolio intelligence with persisted people workflow state.
- Add explicit read/mutation diagnostics for missing PM targets, invalid payloads, or persistence failures.

## Proof Level

- This slice proves: integration
- Real runtime required: no
- Human/UAT required: no

## Verification

- `cd web && npm test -- --run tests/control-tower/people-store.test.ts tests/control-tower/people-assembler.test.ts tests/control-tower/people-mutation-route.test.ts`
- `cd web && npm test -- --run tests/control-tower/people-route.test.ts`
- `cd web && npm run typecheck`

## Observability / Diagnostics

- Runtime signals: structured people-state diagnostics returned with assembled PM detail and mutation responses
- Inspection surfaces: persisted people overlay file, people read/mutation routes, and PM detail UI state
- Failure visibility: stable route `code` values for invalid request, PM not found, and persistence failure paths
- Redaction constraints: private 1:1 or coaching notes remain local-only and must not be auto-shared or treated as formal records

## Integration Closure

- Upstream surfaces consumed: `web/lib/control-tower/people-assembler.ts`, `web/app/api/control-tower/people/route.ts`, review-overlay and cache patterns from M001
- New wiring introduced in this slice: persisted people overlay store, assembled PM detail shape, people mutation API, PM detail or note surface in `/people`
- What remains before the milestone is truly usable end-to-end: live draft-generation loop and approval-safe handoff for people outputs

## Tasks

- [x] **T01: Lock persisted people-state contracts with failing tests** `est:45m`
  - Why: The slice needs explicit contracts for overlay storage, assembled PM detail state, and mutation failure codes before implementation.
  - Files: `web/tests/control-tower/people-store.test.ts`, `web/tests/control-tower/people-mutation-route.test.ts`, `web/tests/control-tower/people-assembler.test.ts`
  - Do: Add failing-first tests for persisted people records, assembled PM detail state, and stable mutation codes for invalid payload, missing PM, and persistence failure cases.
  - Verify: `cd web && npm test -- --run tests/control-tower/people-store.test.ts tests/control-tower/people-mutation-route.test.ts tests/control-tower/people-assembler.test.ts`
  - Done when: tests fail only because the durable people overlay and mutation/read seams do not exist yet.
- [x] **T02: Implement the people overlay store and assembled PM detail seam** `est:1h15m`
  - Why: S02 depends on one durable local-first people workflow layer that can be composed with live PM portfolio data.
  - Files: `web/lib/control-tower/people-types.ts`, `web/lib/control-tower/people-store.ts`, `web/lib/control-tower/people-assembler.ts`
  - Do: Add a persisted people store for 1:1 history or coaching notes, extend the PM assembly contract with explicit stored-state presence/absence, and preserve missing-record diagnostics without fabricating history.
  - Verify: `cd web && npm test -- --run tests/control-tower/people-store.test.ts tests/control-tower/people-assembler.test.ts`
  - Done when: assembled PM detail state includes durable private people data and the persistence contract is covered by passing tests.
- [x] **T03: Wire mutation/read surfaces into the people workspace** `est:1h15m`
  - Why: The durable people overlay only matters if the runtime workspace can read and update it through stable server-backed flows.
  - Files: `web/app/api/control-tower/people/route.ts`, `web/app/api/control-tower/people/notes/route.ts`, `web/app/people/page.tsx`
  - Do: Add a people mutation API, refresh or render PM detail state from the assembled read path, and expose inline save/error feedback for private notes or 1:1 history without leaving the local approval-safe boundary.
  - Verify: `cd web && npm test -- --run tests/control-tower/people-mutation-route.test.ts tests/control-tower/people-route.test.ts && cd web && npm run typecheck`
  - Done when: PM detail UI can persist and re-read private people state through server-backed routes with explicit success/error signals.

## Files Likely Touched

- `web/lib/control-tower/people-types.ts`
- `web/lib/control-tower/people-store.ts`
- `web/lib/control-tower/people-assembler.ts`
- `web/app/api/control-tower/people/route.ts`
- `web/app/api/control-tower/people/notes/route.ts`
- `web/app/people/page.tsx`
- `web/tests/control-tower/people-store.test.ts`
- `web/tests/control-tower/people-mutation-route.test.ts`
- `web/tests/control-tower/people-assembler.test.ts`
