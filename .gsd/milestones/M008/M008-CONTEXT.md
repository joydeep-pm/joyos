# M008: Navigation and route coherence for the director operating model — Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

## Project Description

The app now contains both legacy control-tower routes and newer Director-of-Products operating routes. `/assistant` and `/today` are the newer daily-use surfaces, but the current top navigation and home redirect still drive users toward `/intervention`, creating product confusion.

## Why This Milestone

Users are landing on the wrong surface and missing the latest work because the app’s information architecture still foregrounds an older route model. The next step is to make the new operating model discoverable and primary.

## User-Visible Outcome

### When this milestone is complete, the user can:

- open the app and land on the right daily starting point
- discover `Today` and `Assistant` from primary navigation
- understand that `Intervention` is no longer the main daily workspace

### Entry point / environment

- `web/components/nav.tsx`
- `web/app/page.tsx`
- existing route pages under `web/app/`

## Completion Class

- Contract complete means: the new primary route model is explicit in nav and home behavior
- Integration complete means: nav and landing route both point to the intended director workflow
- Operational complete means: a user can find and use `Today` and `Assistant` without prior repo knowledge

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- primary nav exposes `Today` and `Assistant`
- `/` lands on the intended primary daily page
- legacy `/intervention` no longer competes in the primary nav

## Risks and Unknowns

- removing `Intervention` from the nav may hide a still-useful specialist surface unless it is preserved elsewhere
- route renaming/redirect choices could confuse existing bookmarks if done too aggressively

## Existing Codebase / Prior Art

- `web/components/nav.tsx` — current nav still points to `/intervention`
- `web/app/page.tsx` — current home route redirects to `/intervention`
- `web/app/assistant/page.tsx` and `web/app/today/page.tsx` — new primary director workflow surfaces
- `web/app/intervention/page.tsx` — legacy intervention brief

## Relevant Requirements

- R001 — daily intervention quality depends on users landing on the right surface
- R008 — product behavior should remain clear and inspectable, not hidden behind stale IA

## Scope

### In Scope

- primary nav cleanup
- landing route cleanup
- route discoverability for `Today` and `Assistant`
- preserving `/intervention` as a secondary/legacy route for now

### Out of Scope / Non-Goals

- deleting `/intervention`
- major redesign of the old intervention screen
- deep route migration or bookmark migration logic beyond what is immediately needed

## Technical Constraints

- prefer minimal, coherent changes over large restructuring
- do not break existing routes unnecessarily
- verify with local UI tests and browser navigation checks

## Open Questions

- should `/intervention` remain reachable via a secondary link or be hidden entirely
- whether `Today` or `Assistant` should be the home route; current recommendation is `Today`
