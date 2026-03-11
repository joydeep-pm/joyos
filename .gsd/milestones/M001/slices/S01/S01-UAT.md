# S01: Grooming readiness engine and review rubric — UAT

**Milestone:** M001
**Written:** 2026-03-12

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: The slice plan explicitly proves S01 at the integration level without requiring real-runtime or human UAT signoff. The shipped tests, typecheck pass, API contract, and rendered grooming-page code provide the acceptance evidence for this slice.

## Preconditions

- Dependencies are installed in `web/`.
- The current branch contains the S01 implementation.
- The verifier can run `npm test` and `npm run typecheck` from `web/`.

## Smoke Test

Run:

- `cd web && npm test -- --run tests/control-tower/readiness-evaluator.test.ts tests/control-tower/grooming-engine.test.ts tests/control-tower/intervention-engine.test.ts`
- `cd web && npm run typecheck`

Expected result: all targeted tests pass and typecheck succeeds.

## Test Cases

### 1. Readiness evaluator returns explicit rubric outcomes

1. Open `web/tests/control-tower/readiness-evaluator.test.ts`.
2. Run `cd web && npm test -- --run tests/control-tower/readiness-evaluator.test.ts`.
3. Inspect `web/lib/control-tower/readiness-evaluator.ts` if needed.
4. **Expected:** ready, low-readiness, and blocked scenarios all return explicit verdicts, dimension statuses, missing-input codes, blocker class, prioritization posture, and recommended next step.

### 2. Grooming summary preserves diagnostics for downstream consumers

1. Open `web/tests/control-tower/grooming-engine.test.ts`.
2. Run `cd web && npm test -- --run tests/control-tower/grooming-engine.test.ts`.
3. Inspect `web/lib/control-tower/grooming-engine.ts`.
4. **Expected:** grouped grooming summaries expose `readiness.evaluations`, preserve low-readiness and blocked diagnostics, and keep aggregate counts aligned with evaluator verdicts.

### 3. Grooming route and page consume the richer contract

1. Inspect `web/app/api/control-tower/grooming/route.ts`.
2. Inspect `web/app/grooming/page.tsx`.
3. Run `cd web && npm run typecheck`.
4. **Expected:** the route serializes evaluator-driven summaries and the page compiles while rendering verdict-aware review lanes, rationale, missing-input guidance, blocker class, and recommended next steps from the shared contract.

## Edge Cases

### Client bundle safety on the grooming page

1. Inspect imports in `web/app/grooming/page.tsx`.
2. Confirm the page imports browser-safe modules directly instead of the `@/lib/control-tower` barrel.
3. **Expected:** the page avoids pulling server-only dependencies like `fs` into the client bundle.

### Empty review lanes

1. Read the empty-state sections in `web/app/grooming/page.tsx`.
2. Compare them against the grouped-rendering logic.
3. **Expected:** when no requests fall into a lane, the UI still renders an explicit empty-state message rather than appearing broken.

## Failure Signals

- Targeted readiness or grooming-engine tests fail.
- `npm run typecheck` fails on grooming route/page contract mismatches.
- `readiness.evaluations` is missing from grooming summaries.
- The grooming page reverts to opaque bucket text without dimension rationale, missing-input guidance, or blocker detail.
- A client-bundle error reappears because a client component imports the server-heavy control-tower barrel.

## Requirements Proved By This UAT

- R005 — The artifact checks prove that feature requests can be assessed for grooming readiness, dependency state, prioritization posture, and recommended next step with explicit machine-readable rationale.

## Not Proven By This UAT

- R006 — This slice does not prove durable decision tracking, rationale persistence, or pending-decision storage.
- End-to-end live populated-browser behavior for real seeded feature requests is not proven here.
- Approval-gated downstream action flows and assembled pre-grooming operating loop behavior remain for later slices.

## Notes for Tester

- This slice intentionally relies on artifact-driven proof rather than human-experience signoff.
- If you choose to do extra runtime checking, start at `/api/control-tower/grooming` and `/grooming`, but treat those checks as supplemental rather than required acceptance evidence for S01.
- If the grooming page regresses at runtime, inspect its import boundary first before debugging the evaluator logic.
