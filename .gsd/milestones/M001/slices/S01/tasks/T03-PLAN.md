---
estimated_steps: 3
estimated_files: 3
---

# T03: Render rubric-driven grooming review surfaces

**Slice:** S01 — Grooming readiness engine and review rubric
**Milestone:** M001

## Description

Expose the richer readiness model in the real grooming workflow so the director can see readiness verdicts, weak dimensions, blockers, and recommended follow-up actions directly in the grooming page.

## Steps

1. Update `web/app/grooming/page.tsx` to render verdict-aware sections and per-feature-request review cards that show dimension statuses, rationale, missing inputs, blocker classes, prioritization posture, and recommended next steps.
2. Keep existing top-level totals and refresh/export behavior, but shift the page from bucket-only output to actionable review language driven by the API contract.
3. Tighten tests or type usage as needed so the UI stays aligned with the richer grooming summary shape and low-readiness diagnostics remain visible.

## Must-Haves

- [ ] The grooming page shows real actionable readiness reasoning for feature requests, not just counts or generic labels.
- [ ] Low-readiness and blocked states surface enough detail for a future agent or director to tell what is missing and what to do next.

## Verification

- `cd web && npm run typecheck`
- `cd web && npm test -- --run web/tests/control-tower/readiness-evaluator.test.ts web/tests/control-tower/grooming-engine.test.ts`

## Observability Impact

- Signals added/changed: The runtime UI visibly reflects readiness verdicts, failed dimensions, and next-step guidance from the evaluator.
- How a future agent inspects this: Open `/grooming` or inspect the page component against the summary contract returned by `/api/control-tower/grooming`.
- Failure state exposed: UI regressions will either fail type/test checks or visibly omit required rubric details for low-readiness items.

## Inputs

- `web/app/api/control-tower/grooming/route.ts` — API contract that now returns richer readiness evaluation data.
- `web/lib/control-tower/grooming-engine.ts` — grouped summary shape that the page must render accurately.

## Expected Output

- `web/app/grooming/page.tsx` — actionable grooming review surface using rubric-driven readiness data.
- `web/tests/control-tower/grooming-engine.test.ts` — coverage or assertions kept aligned with the UI-facing summary contract.
