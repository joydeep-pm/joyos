---
estimated_steps: 4
estimated_files: 6
---

# T02: Implement the readiness evaluator and integrate grooming summary logic

**Slice:** S01 — Grooming readiness engine and review rubric
**Milestone:** M001

## Description

Build the derived readiness evaluator and wire it into grooming summary generation so the control tower can explain why a feature request is or is not ready for grooming using stable rubric outputs.

## Steps

1. Create `web/lib/control-tower/readiness-evaluator.ts` to evaluate a `FeatureRequest` into verdict, rubric dimensions, missing inputs, blocker classes, prioritization posture, and recommended next step using stage, documentation, blocker, and risk signals.
2. Update `web/lib/control-tower/grooming-engine.ts` to consume evaluator output for per-category grouping and summary metrics instead of embedding coarse readiness rules directly.
3. Export the new evaluator/types through `web/lib/control-tower/index.ts` and ensure route-facing types stay coherent for downstream consumers.
4. Update `web/app/api/control-tower/grooming/route.ts` so the API returns the richer readiness model while preserving the aggregate summary shape needed by the current page.

## Must-Haves

- [ ] The evaluator reuses existing feature-request, stage, blocker, and risk signals rather than duplicating source-of-truth logic.
- [ ] The grooming route exposes explicit readiness reasoning that future UI and S02 review-tracking work can consume consistently.

## Verification

- `cd web && npm test -- --run web/tests/control-tower/readiness-evaluator.test.ts web/tests/control-tower/grooming-engine.test.ts web/tests/control-tower/intervention-engine.test.ts`
- `cd web && npm run typecheck`

## Observability Impact

- Signals added/changed: API responses and in-memory summaries now include stable readiness verdicts, dimension states, missing-input arrays, blocker classes, and recommended actions.
- How a future agent inspects this: Hit `/api/control-tower/grooming` or rerun the targeted tests to inspect the serialized contract.
- Failure state exposed: Misclassified items expose which rubric dimension failed and what input is missing, instead of collapsing into opaque `notReady` results.

## Inputs

- `web/tests/control-tower/readiness-evaluator.test.ts` — contract assertions that define the required evaluator outputs.
- `web/lib/control-tower/stage-config.ts` — lifecycle semantics that readiness rules must align with.

## Expected Output

- `web/lib/control-tower/readiness-evaluator.ts` — reusable derived readiness evaluation engine.
- `web/lib/control-tower/grooming-engine.ts` — summary generation powered by evaluator output and ready for UI consumption.
