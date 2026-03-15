---
id: M008
provides:
  - Coherent director workflow discovery through Today-first landing behavior and primary navigation that foregrounds Today and Assistant
key_decisions:
  - Keep /intervention reachable as Control Tower instead of deleting it immediately
  - Use Today as the default landing route for the daily operating model
patterns_established:
  - When milestone behavior is already shipped, close it through truthful automated and browser verification rather than rewriting working code
observability_surfaces:
  - web/tests/nav-route-coherence.test.tsx
  - browser verification on http://localhost:3004
requirement_outcomes:
  - id: R001
    from_status: active
    to_status: validated
    proof: Home now lands on /today and primary nav exposes the intended daily surfaces, verified by targeted test and browser pass
  - id: R008
    from_status: validated
    to_status: validated
    proof: Route and navigation behavior remain coherent, explicit, and inspectable through tests and browser verification
duration: 30m
verification_result: passed
completed_at: 2026-03-15
---

# M008: Navigation and route coherence for the director operating model

**Made the current director workflow discoverable by foregrounding Today and Assistant and de-emphasizing the legacy intervention route.**

## What Happened

M008 turned route coherence into a truthful project state rather than a stale roadmap item. The shipped application already had the core behavior the milestone wanted: primary nav foregrounded `Today` and `Assistant`, the root route redirected to `/today`, and the legacy intervention surface was still reachable as `Control Tower` instead of being presented as the default daily workflow.

The milestone therefore closed through explicit verification and artifact catch-up instead of redundant code churn. S01 recorded the primary-nav behavior, S02 recorded the Today-first landing behavior, and S03 added both targeted automated proof and a live browser walkthrough to confirm real route discovery across `/today`, `/assistant`, and `/intervention`.

## Cross-Slice Verification

- `cd web && npm run test -- --run tests/nav-route-coherence.test.tsx`
- Browser verification on `http://localhost:3004`:
  - `/` landed on `/today`
  - primary nav exposed `Today`, `Assistant`, and `Control Tower`
  - `Assistant` navigated to `/assistant`
  - `Control Tower` navigated to `/intervention`

## Requirement Changes

- R001: active → validated — users now land on the correct daily surface and can discover the primary workflow from navigation, proven by targeted route tests and browser verification.
- R008: validated → validated — the systems-of-record overlay model remains coherent and discoverable; this milestone strengthened verification rather than changing status.

## Forward Intelligence

### What the next milestone should know
- Navigation and landing behavior are already aligned with the current operating model, so future IA work should start from Today/Assistant as the baseline rather than assuming Intervention-first navigation still exists.

### What's fragile
- The header title still says `Product Control Tower` — acceptable for now, but future branding/alignment work may want the shell copy to match the newer director operating model more closely.

### Authoritative diagnostics
- `web/tests/nav-route-coherence.test.tsx` — fastest signal for redirect and nav-label regressions
- browser verification on `http://localhost:3004` — authoritative operational proof for real route discovery

### What assumptions changed
- Original assumption: M008 required new implementation work — what actually happened: the implementation was already present and the real work was to verify it and bring `.gsd` artifacts up to date.

## Files Created/Modified

- `.gsd/milestones/M008/M008-ROADMAP.md` — marked all slices complete
- `.gsd/milestones/M008/M008-SUMMARY.md` — milestone closeout summary
- `.gsd/milestones/M008/slices/S01/S01-SUMMARY.md` — recorded nav-foregrounding proof
- `.gsd/milestones/M008/slices/S02/S02-SUMMARY.md` — recorded Today-first landing proof
- `.gsd/milestones/M008/slices/S03/S03-PLAN.md` — verification-only closeout plan
- `.gsd/milestones/M008/slices/S03/S03-UAT.md` — route coherence UAT
- `.gsd/milestones/M008/slices/S03/S03-SUMMARY.md` — browser/test proof summary
