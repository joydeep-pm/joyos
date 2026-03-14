---
estimated_steps: 4
estimated_files: 3
---

# T02: Add role-aware reasoning text for top items and blockers

**Slice:** S01 — Daily intervention brief UI alignment
**Milestone:** M005

## Description

Tighten the Today page semantics by ensuring the intervention-first reasoning copy is covered by a focused test and by keeping the helper text aligned to current task/category/blocker data instead of vague UI-only wording.

## Steps

1. Confirm the Today page now renders role-aware reasoning text for top items and blockers based on current task fields.
2. Fix any component/runtime issues exposed by the focused Today page test.
3. Keep the new test green while preserving truthful semantics.
4. Prepare for browser verification once the test path is stable.

## Must-Haves

- [ ] The focused Today page test passes.
- [ ] The role-aware reasoning remains grounded in existing task/category/blocker data.

## Verification

- `cd web && npm run test -- --run tests/today-page.test.tsx`
- `cd web && npm run typecheck`

## Observability Impact

- Signals added/changed: focused semantic coverage for the Today page
- How a future agent inspects this: run the Today page test and inspect the reasoning helpers in `web/app/today/page.tsx`
- Failure state exposed: missing role-specific headings/copy or JSX runtime issues fail immediately in the test

## Inputs

- `web/app/today/page.tsx` — intervention-first page structure from T01
- `web/tests/today-page.test.tsx` — semantic coverage for the new daily brief

## Expected Output

- `web/tests/today-page.test.tsx` — passing focused coverage for the aligned Today page
- `web/components/ui.tsx` — any shared UI runtime fixes needed by the test path
