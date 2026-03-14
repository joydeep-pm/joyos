---
id: T03
parent: S01
milestone: M005
provides:
  - Live browser proof that `/today` now behaves like a Director Intervention Brief on the running app
key_files:
  - web/app/today/page.tsx
key_decisions:
  - Browser verification must target the actual dev-server port surfaced by Next.js rather than assuming port 3000
patterns_established:
  - When local port collisions occur, use `bg_shell` process highlights/digest to find the real app URL before browser assertions
observability_surfaces:
  - live `/today` page on `http://localhost:3001`
  - browser assertions for intervention-first headings and sections
duration: 20m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T03: Verify the aligned Today flow in the browser

**Verified the new Today page hierarchy live in the browser on the running app.**

## What Happened

The web dev server started successfully but had to move from port 3000 to port 3001 because another local app was already using port 3000. Initial browser verification accidentally hit the wrong app and returned a 404 from an unrelated site. After inspecting the dev-server highlights and digest, the correct Product Control Tower URL was identified as `http://localhost:3001`.

Browser verification on `http://localhost:3001/today` then passed, confirming that the page visibly renders `Director intervention brief`, `Today's Three`, `Blockers that may need intervention`, and `Operating-goal signal` on the live app.

## Verification

- Started local dev server with `cd web && npm run dev`
- Confirmed actual app URL from server output: `http://localhost:3001`
- Browser verification on `/today`
- Browser assertions passed for:
  - `Director intervention brief`
  - `Today's Three`
  - `Blockers that may need intervention`
  - `Operating-goal signal`

## Diagnostics

Future agents should check the dev-server highlights if browser verification lands on the wrong app. In this run, `bg_shell` correctly reported the port collision and the fallback URL.

## Deviations

The first browser navigation hit the wrong app on port 3000 because a different local server was already running there. This was corrected before final verification.

## Known Issues

There is still a 404 network warning for a missing resource in the browser session, but it did not prevent the Today page from rendering or invalidate the verified headings.

## Files Created/Modified

- `web/app/today/page.tsx` — live-verified on the running app
