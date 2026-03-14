# S01: Daily intervention brief UI alignment

**Goal:** Turn `/today` into a Director-of-Products daily brief that surfaces interventions, Today’s Three, blockers, and operating-goal context in language and hierarchy aligned with the markdown Personal OS.
**Demo:** In the running app, `/today` reads as a Director Intervention Brief rather than a generic top-task page, while still using truthful app data and preserving quick capture plus blocker visibility.

## Must-Haves

- Reframe the main `/today` hero and priority section around a Director Intervention Brief and Today’s Three.
- Surface why each top item matters now in role-specific terms, not just title/priority metadata.
- Keep blockers and goal context visible in a structure that supports intervention decisions.
- Verify the new flow in the browser on the running app.

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `cd web && npm run typecheck`
- `cd web && npm run test -- --run tests/today-page.test.tsx`
- Browser verification on `/today` confirming the new intervention-first layout and visible Today’s Three / blocker sections

## Observability / Diagnostics

- Runtime signals: rendered Today page sections and any route/data errors visible in UI or browser console
- Inspection surfaces: `/today`, related API responses already consumed by the page, browser console/network logs if needed
- Failure visibility: missing sections, stale generic headings, or rendering errors visible in-browser and in test failures
- Redaction constraints: no secret data in client-rendered diagnostics

## Integration Closure

- Upstream surfaces consumed: `web/app/today/page.tsx`, `web/lib/scoring.ts`, current tasks/status/goals APIs
- New wiring introduced in this slice: intervention-first UI hierarchy on the existing Today surface
- What remains before the milestone is truly usable end-to-end: assistant-surface alignment and final browser proof across the broader daily flow

## Tasks

- [x] **T01: Rework Today page hierarchy around intervention-first language and cards** `est:45m`
  - Why: The current page still presents a generic execution dashboard instead of a Director Intervention Brief.
  - Files: `web/app/today/page.tsx`, `web/components/ui.tsx`
  - Do: Rename and restructure the hero, priority cards, and sidebars around Director Intervention Brief, Today’s Three, and intervention-oriented supporting copy while preserving truthful use of current data.
  - Verify: `cd web && npm run typecheck`
  - Done when: The Today page’s information hierarchy and language match the markdown operating model.
- [x] **T02: Add role-aware reasoning text for top items and blockers** `est:45m`
  - Why: The page needs to explain why items matter now in terms Joydeep can act on, not just show titles and due dates.
  - Files: `web/app/today/page.tsx`, `web/lib/scoring.ts`, `web/tests/today-page.test.tsx`
  - Do: Add lightweight reasoning labels or helper copy based on current task/blocker/goal data, plus tests that lock the new UI semantics.
  - Verify: `cd web && npm run test -- --run tests/today-page.test.tsx`
  - Done when: Top items and blockers expose role-aware reasoning and tests prove the new semantics.
- [x] **T03: Verify the aligned Today flow in the browser** `est:30m`
  - Why: This slice is not complete until the live app proves the new daily operating model visually and behaviorally.
  - Files: `web/app/today/page.tsx`
  - Do: Run the app if needed, open `/today`, and verify the intervention-first layout, Today’s Three, and blocker visibility with browser assertions.
  - Verify: browser assertions on `/today`
  - Done when: Browser verification passes and the page truthfully behaves like the intended daily intervention brief.

## Files Likely Touched

- `web/app/today/page.tsx`
- `web/lib/scoring.ts`
- `web/tests/today-page.test.tsx`
- `web/components/ui.tsx`
