# S02: Assistant continuity alignment

**Goal:** Align the richer `/assistant` surface to the same Director-of-Products operating model already established on `/today`, so the assistant page feels like a deeper intervention workspace rather than a separate system.
**Demo:** In the running app, `/assistant` uses intervention-first terminology and hierarchy for the daily brief, top outcomes, and related supporting sections while preserving existing capabilities.

## Must-Haves

- Reframe the assistant page’s primary daily brief copy and section naming around intervention-first language consistent with `/today`.
- Keep existing assistant capabilities intact while improving semantic continuity.
- Add focused verification for the new assistant-page semantics.
- Verify the aligned assistant surface in the browser.

## Proof Level

- This slice proves: integration
- Real runtime required: yes
- Human/UAT required: yes

## Verification

- `cd web && npm run typecheck`
- `cd web && npm run test -- --run tests/assistant-page-alignment.test.tsx`
- Browser verification on `/assistant` confirming intervention-first headings and continuity with `/today`

## Observability / Diagnostics

- Runtime signals: rendered assistant headings/sections plus any browser console/network issues
- Inspection surfaces: `/assistant`, current assistant API responses, focused test coverage
- Failure visibility: stale generic headings, broken section rendering, or browser assertion failures
- Redaction constraints: do not expose secret comms/approval data in any new copy beyond existing surfaced values

## Integration Closure

- Upstream surfaces consumed: `web/app/assistant/page.tsx`, existing assistant APIs and types
- New wiring introduced in this slice: semantic alignment of the assistant daily brief with the Director-of-Products model
- What remains before the milestone is truly usable end-to-end: final browser proof across the assistant surface and any deeper ranking/context improvements discovered during alignment

## Tasks

- [x] **T01: Rework assistant page headings and daily-brief framing** `est:45m`
  - Why: `/assistant` still carries a generic assistant framing that does not clearly continue the intervention-first daily model from `/today`.
  - Files: `web/app/assistant/page.tsx`
  - Do: Update the main daily brief and surrounding section copy/headings so the page reads as a director intervention workspace, preserving current capabilities and data wiring.
  - Verify: `cd web && npm run typecheck`
  - Done when: `/assistant` visibly uses intervention-first language and no longer feels semantically disconnected from `/today`.
- [x] **T02: Add focused semantic coverage for the aligned assistant page** `est:40m`
  - Why: The new copy and section hierarchy should be locked with a narrow test just like the Today page.
  - Files: `web/tests/assistant-page-alignment.test.tsx`, `web/app/assistant/page.tsx`
  - Do: Add a focused test that verifies the new headings/sections and fix any runtime/test-path issues it exposes.
  - Verify: `cd web && npm run test -- --run tests/assistant-page-alignment.test.tsx`
  - Done when: The assistant alignment semantics are covered by a passing focused test.
- [x] **T03: Verify the aligned assistant surface in the browser** `est:30m`
  - Why: This slice is not complete until the running app shows the assistant page as a coherent continuation of the intervention-first model.
  - Files: `web/app/assistant/page.tsx`
  - Do: Open `/assistant` in the running app and verify the new headings/sections with browser assertions.
  - Verify: browser assertions on `/assistant`
  - Done when: Browser verification passes and the assistant page visibly aligns with the role-specific daily operating model.

## Files Likely Touched

- `web/app/assistant/page.tsx`
- `web/tests/assistant-page-alignment.test.tsx`
