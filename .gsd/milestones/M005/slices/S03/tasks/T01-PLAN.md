---
estimated_steps: 5
estimated_files: 3
---

# T01: Extract shared intervention-candidate presentation helpers

**Slice:** S03 — Shared intervention presentation seam
**Milestone:** M005

## Description

Create a lightweight shared presentation seam for intervention-candidate reasoning so `/today` and `/assistant` stop duplicating page-local semantics and stay aligned as the app evolves.

## Steps

1. Inspect how `/today` currently derives intervention reasoning from task fields and how `/assistant` renders candidate outcome semantics.
2. Create a shared helper module for intervention-candidate presentation grounded in current fields and data contracts.
3. Refactor `/today` and `/assistant` to use the shared helper where it improves semantic consistency.
4. Keep the visible headings and role-specific wording stable.
5. Verify the refactor typechecks before adding direct tests.

## Must-Haves

- [ ] The shared helper uses current data contracts rather than introducing unnecessary backend changes.
- [ ] Both pages consume the new seam where it materially reduces drift.

## Verification

- `cd web && npm run typecheck`
- `git diff -- web/lib/intervention-presenters.ts web/app/today/page.tsx web/app/assistant/page.tsx | sed -n '1,240p'`

## Observability Impact

- Signals added/changed: shared intervention presentation logic only
- How a future agent inspects this: read `web/lib/intervention-presenters.ts` and compare page usage in Today/Assistant
- Failure state exposed: diverging or broken reasoning strings surface in typecheck, test failures, or visible UI regressions

## Inputs

- `web/app/today/page.tsx` — current task-based intervention presentation
- `web/app/assistant/page.tsx` — current brief/outcome presentation on the assistant surface

## Expected Output

- `web/lib/intervention-presenters.ts` — shared intervention presentation helpers
- `web/app/today/page.tsx` — updated to consume the shared helper
- `web/app/assistant/page.tsx` — updated to consume the shared helper where applicable
