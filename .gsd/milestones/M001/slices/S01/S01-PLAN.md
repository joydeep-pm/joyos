# S01: Grooming readiness engine and review rubric

**Goal:** Establish a derived readiness evaluation contract that can assess real feature requests for grooming readiness, missing inputs, blocker classes, prioritization posture, and recommended next step without changing systems-of-record ownership.
**Demo:** A real feature request can be evaluated through the control-tower grooming flow and show an explicit readiness verdict, rubric dimensions, missing-context signals, blocker classification, prioritization posture, and recommended action in both API output and the grooming UI.

## Must-Haves

- Derived readiness evaluation model hangs off `FeatureRequest` inputs and stays overlay-only, preserving Jira/Confluence as systems of record.
- Rubric output includes verdict, per-dimension statuses with rationale, missing inputs, blocker classifications, prioritization posture, and recommended next step.
- Grooming summary and route consume the new evaluator instead of coarse in-place bucket rules.
- Grooming UI exposes substantive review language for real feature requests, not only category counts.
- Verification proves both contract behavior and a failure/diagnostic inspection path for low-readiness items.

## Proof Level

- This slice proves: integration
- Real runtime required: no
- Human/UAT required: no

## Verification

- `web/tests/control-tower/readiness-evaluator.test.ts`
- `web/tests/control-tower/grooming-engine.test.ts`
- `cd web && npm test -- --run web/tests/control-tower/readiness-evaluator.test.ts web/tests/control-tower/grooming-engine.test.ts web/tests/control-tower/intervention-engine.test.ts`
- `cd web && npm run typecheck`

## Observability / Diagnostics

- Runtime signals: readiness evaluation emits machine-readable dimension statuses, missing-input codes, blocker classes, and recommended-next-step fields instead of opaque bucket-only outcomes.
- Inspection surfaces: unit tests against the readiness contract, `/api/control-tower/grooming` JSON payload, and the grooming page’s rendered low-readiness explanations.
- Failure visibility: low-readiness and blocked items expose explicit verdict reasons, failing dimensions, and missing-input arrays so a future agent can localize why an item is not groomable.
- Redaction constraints: diagnostics stay limited to feature-request metadata already surfaced in the control tower; no secrets, raw tokens, or external-system credentials are included.

## Integration Closure

- Upstream surfaces consumed: `web/lib/control-tower/types.ts`, `web/lib/control-tower/stage-config.ts`, `web/lib/control-tower/blocker-detector.ts`, `web/lib/control-tower/risk-scorer.ts`, `web/lib/control-tower/feature-request-engine.ts`
- New wiring introduced in this slice: readiness evaluator module wired into `grooming-engine.ts`, `web/app/api/control-tower/grooming/route.ts`, and `web/app/grooming/page.tsx` with richer response/rendering contracts.
- What remains before the milestone is truly usable end-to-end: durable review decision persistence and cross-surface review workflow wiring in S02, plus end-to-end pre-grooming operating loop assembly in S03.

## Tasks

- [x] **T01: Create failing readiness contract tests and evaluator seam** `est:45m`
  - Why: Lock the S01 boundary contract before implementation so the slice proves a real, reusable readiness model rather than ad hoc grooming buckets.
  - Files: `web/tests/control-tower/readiness-evaluator.test.ts`, `web/tests/control-tower/grooming-engine.test.ts`, `web/lib/control-tower/index.ts`, `web/lib/control-tower/types.ts`
  - Do: Add failing Vitest coverage for readiness verdicts, rubric dimensions, missing inputs, blocker classes, prioritization posture, recommended next step, and grooming summary consumption; extend exported types only as needed to host the derived contract seam without introducing durable review storage.
  - Verify: `cd web && npm test -- --run web/tests/control-tower/readiness-evaluator.test.ts web/tests/control-tower/grooming-engine.test.ts`
  - Done when: The new tests exist, express the S01 contract clearly, and fail because the evaluator implementation is not present yet.
- [x] **T02: Implement the readiness evaluator and integrate grooming summary logic** `est:1h`
  - Why: This delivers the core slice behavior by replacing the coarse readiness buckets with a rubric-driven evaluation layer consumed by grooming summaries.
  - Files: `web/lib/control-tower/readiness-evaluator.ts`, `web/lib/control-tower/grooming-engine.ts`, `web/lib/control-tower/index.ts`, `web/app/api/control-tower/grooming/route.ts`, `web/tests/control-tower/readiness-evaluator.test.ts`, `web/tests/control-tower/grooming-engine.test.ts`
  - Do: Build a derived evaluator over `FeatureRequest` using stage, documentation presence, blockers, and risk signals; define stable rubric/dimension outputs and prioritization posture; update grooming summary generation and API serialization to expose the richer contract while keeping backward-compatible aggregate counts where still useful.
  - Verify: `cd web && npm test -- --run web/tests/control-tower/readiness-evaluator.test.ts web/tests/control-tower/grooming-engine.test.ts web/tests/control-tower/intervention-engine.test.ts`
  - Done when: The evaluator tests pass, grooming summaries are powered by evaluator output, and the route returns machine-readable readiness reasoning for each item/category.
- [x] **T03: Render rubric-driven grooming review surfaces** `est:1h`
  - Why: S01 is not complete unless the richer readiness model is visible in the real grooming workflow and helps the director understand what is missing or blocked.
  - Files: `web/app/grooming/page.tsx`, `web/lib/control-tower/grooming-engine.ts`, `web/tests/control-tower/grooming-engine.test.ts`
  - Do: Update the grooming page to render verdict-aware cards, dimension/rationale summaries, missing-input and blocker details, prioritization posture, and recommended next steps for real feature requests; keep existing top-level summary metrics but shift the page toward actionable review language.
  - Verify: `cd web && npm run typecheck && npm test -- --run web/tests/control-tower/readiness-evaluator.test.ts web/tests/control-tower/grooming-engine.test.ts`
  - Done when: The grooming page can present actionable readiness explanations for each category using the API contract, and the slice demo is true without relying on placeholder text.

## Files Likely Touched

- `web/lib/control-tower/types.ts`
- `web/lib/control-tower/index.ts`
- `web/lib/control-tower/readiness-evaluator.ts`
- `web/lib/control-tower/grooming-engine.ts`
- `web/app/api/control-tower/grooming/route.ts`
- `web/app/grooming/page.tsx`
- `web/tests/control-tower/readiness-evaluator.test.ts`
- `web/tests/control-tower/grooming-engine.test.ts`
