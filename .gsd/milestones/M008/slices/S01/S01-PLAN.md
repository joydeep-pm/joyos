# S01: Promote Today and Assistant in primary navigation

**Goal:** Make the current director workflow discoverable by foregrounding `Today` and `Assistant` in primary navigation and aligning the landing route to the intended daily starting point.
**Demo:** The top nav shows `Today` and `Assistant` as primary items, and visiting `/` lands on `/today` instead of `/intervention`.

## Must-Haves

- Update primary nav labels/order to foreground `Today` and `Assistant`.
- Change the home redirect away from `/intervention`.
- Keep `/intervention` route available for now, but remove it from primary nav.
- Verify both rendering and route behavior with tests and browser checks.

## Proof Level

- This slice proves: operational
- Real runtime required: yes
- Human/UAT required: no

## Verification

- `cd web && npm run typecheck`
- `cd web && npm run test -- --run tests/today-page.test.tsx tests/assistant-page-alignment.test.tsx tests/nav-route-coherence.test.tsx`
- browser check: `/` redirects to `/today` and nav shows `Today`, `Assistant`, `Grooming`, `People`, `Settings`

## Observability / Diagnostics

- Runtime signals: browser-visible nav and redirect behavior
- Inspection surfaces: nav component, root redirect, focused route-coherence test, browser assertions
- Failure visibility: wrong landing route or missing nav items visible immediately in UI/tests
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: `web/components/nav.tsx`, `web/app/page.tsx`, existing route pages
- New wiring introduced in this slice: coherent primary entrypoint and nav model
- What remains before the milestone is truly usable end-to-end: a decision later on whether `/intervention` should be hidden further, renamed, or redirected

## Tasks

- [x] **T01: Update the primary nav model to foreground Today and Assistant** `est:30m`
  - Why: The top nav still steers users toward the legacy intervention page.
  - Files: `web/components/nav.tsx`
  - Do: Replace the current primary nav items so `Today` and `Assistant` are visible and ordered as the main workflow surfaces, while removing `Intervention` from primary nav.
  - Verify: `rg -n "Today|Assistant|Intervention" web/components/nav.tsx`
  - Done when: The nav clearly presents the current daily workflow.

- [x] **T02: Redirect home to Today and preserve legacy Intervention as secondary** `est:20m`
  - Why: Even with a fixed nav, landing on `/intervention` keeps reinforcing the wrong starting point.
  - Files: `web/app/page.tsx`
  - Do: Change the home redirect to `/today` while keeping `/intervention` route intact.
  - Verify: browser check on `/`
  - Done when: Opening the app starts at the intended daily page.

- [x] **T03: Add route-coherence tests and verify browser behavior** `est:35m`
  - Why: The IA fix should be locked by tests so old nav behavior does not creep back in.
  - Files: `web/tests/nav-route-coherence.test.tsx`, `web/tests/assistant-page-alignment.test.tsx`, `web/tests/today-page.test.tsx`
  - Do: Add a focused nav/redirect test and verify the primary surfaces remain discoverable.
  - Verify: `cd web && npm run typecheck && npm run test -- --run tests/nav-route-coherence.test.tsx tests/today-page.test.tsx tests/assistant-page-alignment.test.tsx`
  - Done when: Route and nav coherence is proven by tests and browser behavior.

## Files Likely Touched

- `web/components/nav.tsx`
- `web/app/page.tsx`
- `web/tests/nav-route-coherence.test.tsx`
