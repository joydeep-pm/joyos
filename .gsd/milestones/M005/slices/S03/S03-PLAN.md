# S03: Shared intervention presentation seam

**Goal:** Reduce drift between `/today` and `/assistant` by introducing a small shared presentation/ranking seam for intervention candidates that both surfaces can consume truthfully from current data.
**Demo:** `/today` and `/assistant` render intervention candidates through the same shared helpers or data shape, so the reasoning and hierarchy stay consistent across both pages.

## Must-Haves

- Introduce a shared seam for intervention-candidate presentation or reasoning that both `/today` and `/assistant` can use.
- Keep the seam grounded in current data rather than inventing a new heavy backend contract.
- Add focused verification that the shared seam is consumed by both pages.
- Verify the resulting behavior in the browser on at least one aligned daily surface after refactor.

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `cd web && npm run typecheck`
- `cd web && npm run test -- --run tests/today-page.test.tsx tests/assistant-page-alignment.test.tsx tests/intervention-presenters.test.ts`
- Browser verification on `/today` and/or `/assistant` confirming no semantic regression after the shared-seam refactor

## Observability / Diagnostics

- Runtime signals: unchanged visible headings/semantics on the daily pages after refactor
- Inspection surfaces: shared presentation helper/module, focused tests, browser assertions on the affected surface
- Failure visibility: diverging reasoning strings, missing candidate fields, or test failures on either page
- Redaction constraints: no new secret-bearing data surfaces; stay on existing client-visible fields

## Integration Closure

- Upstream surfaces consumed: `web/app/today/page.tsx`, `web/app/assistant/page.tsx`, current task/brief data, `web/lib/scoring.ts`, `web/lib/types.ts`
- New wiring introduced in this slice: one shared intervention presentation seam consumed by both daily surfaces
- What remains before the milestone is truly usable end-to-end: milestone close/reassessment once the shared seam is browser-proven

## Tasks

- [x] **T01: Extract shared intervention-candidate presentation helpers** `est:45m`
  - Why: Today and Assistant currently express similar intervention reasoning in separate page-local logic, which invites drift.
  - Files: `web/lib/intervention-presenters.ts`, `web/app/today/page.tsx`, `web/app/assistant/page.tsx`
  - Do: Extract shared helpers for reason text / goal signal / candidate semantics using current page data shapes, then update both pages to consume them.
  - Verify: `cd web && npm run typecheck`
  - Done when: Both pages consume a shared intervention presentation seam instead of duplicating page-local strings.
- [x] **T02: Add focused coverage for the shared seam** `est:35m`
  - Why: The new shared helpers should be directly tested, and the page-level alignment tests should continue to pass after the refactor.
  - Files: `web/tests/intervention-presenters.test.ts`, `web/tests/today-page.test.tsx`, `web/tests/assistant-page-alignment.test.tsx`
  - Do: Add direct tests for the shared helper output and keep the page tests green with the refactored implementation.
  - Verify: `cd web && npm run test -- --run tests/intervention-presenters.test.ts tests/today-page.test.tsx tests/assistant-page-alignment.test.tsx`
  - Done when: The helper contract is explicitly covered and both page tests still pass.
- [x] **T03: Browser-check the shared-seam refactor** `est:20m`
  - Why: The refactor must preserve the live daily-surface experience, not just test output.
  - Files: `web/app/today/page.tsx`, `web/app/assistant/page.tsx`
  - Do: Verify in the browser that the aligned headings and reasoning still render correctly after the shared-seam refactor.
  - Verify: browser assertions on the running app
  - Done when: Live browser assertions confirm no semantic regression on the affected daily surfaces.

## Files Likely Touched

- `web/lib/intervention-presenters.ts`
- `web/app/today/page.tsx`
- `web/app/assistant/page.tsx`
- `web/tests/intervention-presenters.test.ts`
- `web/tests/today-page.test.tsx`
- `web/tests/assistant-page-alignment.test.tsx`
