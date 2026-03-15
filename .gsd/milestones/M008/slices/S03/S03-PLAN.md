# S03: Verify coherent discovery across nav and routes

**Goal:** Prove users can discover the current director workflow through nav and landing behavior without route guesswork.
**Demo:** Opening the app lands on Today, primary nav exposes Today and Assistant, and the legacy Intervention surface remains reachable as Control Tower instead of competing as the default route.

## Must-Haves

- Confirm the existing nav/landing implementation matches the milestone contract.
- Verify the behavior with both targeted test proof and one real browser pass.
- Close the milestone without unnecessary code churn if the shipped behavior already matches the roadmap.

## Proof Level

- This slice proves: operational
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `cd web && npm run test -- --run tests/nav-route-coherence.test.tsx`
- Browser verification against local app: `/` lands on `/today`, nav shows `Today`, `Assistant`, and `Control Tower`, and `Control Tower` reaches `/intervention`

## Observability / Diagnostics

- Runtime signals: browser-visible route and nav state
- Inspection surfaces: `tests/nav-route-coherence.test.tsx`, browser URL/title/nav state
- Failure visibility: redirect mismatch or wrong nav labels are directly visible in test failures and browser assertions
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: `web/components/nav.tsx`, `web/app/page.tsx`, existing route pages
- New wiring introduced in this slice: none unless verification reveals a gap
- What remains before the milestone is truly usable end-to-end: nothing if verification passes

## Tasks

- [x] **T01: Record verification-only slice contract** `est:10m`
  - Why: S03 should reflect that nav and landing behavior already exists and this slice is about proof, not speculative rework.
  - Files: `.gsd/milestones/M008/slices/S03/S03-PLAN.md`, `.gsd/milestones/M008/slices/S03/S03-UAT.md`
  - Do: Define the verification-only plan and UAT around route coherence.
  - Verify: plan and UAT files exist and match the actual proof target.
  - Done when: the slice clearly states that success is demonstrated through targeted test plus browser verification.
- [x] **T02: Prove route coherence with existing automated coverage** `est:10m`
  - Why: the lowest-cost proof is the existing targeted test.
  - Files: `web/tests/nav-route-coherence.test.tsx`
  - Do: Run the targeted nav coherence test and use it as the code-level proof source.
  - Verify: `cd web && npm run test -- --run tests/nav-route-coherence.test.tsx`
  - Done when: the targeted nav test passes.
- [ ] **T03: Complete live browser verification and close the milestone** `est:20m`
  - Why: the milestone’s operational proof requires one real browser pass so route discovery is not inferred only from tests.
  - Files: `.gsd/milestones/M008/slices/S03/S03-SUMMARY.md`, `.gsd/milestones/M008/M008-SUMMARY.md`, `.gsd/milestones/M008/M008-ROADMAP.md`, `.gsd/PROJECT.md`, `.gsd/STATE.md`
  - Do: Verify `/`, `/today`, `/assistant`, and `/intervention` discovery in the browser, then write slice/milestone summaries and update roadmap/state files if the pass succeeds.
  - Verify: browser assertions pass and milestone docs reflect completion truthfully.
  - Done when: browser proof is captured and M008 is closed in `.gsd` artifacts.

## Files Likely Touched

- `.gsd/milestones/M008/slices/S03/S03-PLAN.md`
- `.gsd/milestones/M008/slices/S03/S03-UAT.md`
- `.gsd/milestones/M008/slices/S03/S03-SUMMARY.md`
- `.gsd/milestones/M008/M008-SUMMARY.md`
- `.gsd/milestones/M008/M008-ROADMAP.md`
- `.gsd/PROJECT.md`
- `.gsd/STATE.md`
