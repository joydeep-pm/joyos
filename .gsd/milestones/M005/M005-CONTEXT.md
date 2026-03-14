# M005: Director-of-Products web-app alignment — Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

## Project Description

This milestone aligns the existing Product Control Tower web app with the Director-of-Products operating model now established in the markdown Personal OS. The markdown side already encodes Director Intervention Briefs, Today’s Three, meeting follow-up, 1:1 prep, role-aware setup, and scaffolded knowledge structures. The app should now reflect that same operating contract instead of continuing with more generic task or assistant framing.

## Why This Milestone

M004 completed the markdown/setup path for Joydeep’s role, but the web app remains visually and behaviorally misaligned. The `/today` view still centers generic task execution priorities, and the app does not yet expose the same intervention-first operating model that the markdown assistant now uses. The next highest-value step is to make the web UI feel like the same system.

## User-Visible Outcome

### When this milestone is complete, the user can:

- open the app and immediately see a Director Intervention Brief rather than a generic task-focused daily view
- understand Today’s Three in the UI, tied to role-specific operating goals and blockers
- use the app as a faithful extension of the markdown operating model instead of maintaining two conflicting systems

### Entry point / environment

- Primary entry points: `web/app/today/page.tsx`, `web/app/assistant/page.tsx`, related assistant/control-tower APIs and UI components
- Environment: local dev server plus browser verification
- Dependencies: existing assistant brief/context APIs, task/status/goals APIs, current local markdown data, and already-shipped control-tower/people/comms surfaces

## Completion Class

- Contract complete means: the web UI adopts explicit Director-of-Products terminology, information hierarchy, and role-specific planning behavior
- Integration complete means: the UI consumes existing APIs or minimally extended contracts to present intervention-first guidance without UI-local fakery
- Operational complete means: browser-visible flows feel coherent with the markdown system and remain inspectable through stable UI/API behavior

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- the daily web entrypoint reflects a Director Intervention Brief and Today’s Three instead of a generic top-task view
- blocker visibility, operating-goal context, and intervention framing are visible in the UI without requiring markdown-only interpretation
- the app and markdown system no longer contradict each other on the core daily operating model

## Risks and Unknowns

- current app data contracts may not expose the exact role-specific information needed without some API shaping
- the `/today` and `/assistant` surfaces may overlap in confusing ways if the new hierarchy is not clear
- visual changes could accidentally become superficial if the underlying ranking and reasoning are not also made more role-aware

## Existing Codebase / Prior Art

- `web/app/today/page.tsx` — currently shows top 3 execution priorities, blocked tasks, quick capture, and goal signal
- `web/app/assistant/page.tsx` — rich assistant surface with briefs, queue, comms, review, KPI, alerts, and approval envelopes
- `requirements.md` — defines Joydeep’s role, operating model, and need for a daily intervention brief
- `build-plan.md` — already identifies the Daily Intervention Brief as the P0 user-facing outcome for the app
- `.gsd/milestones/M004/*` — completed markdown/setup milestone establishing the role-specific operating contract

## Relevant Requirements

- R001 — the daily intervention brief should be the primary operating surface
- R003 — blocker and PM execution visibility must improve in a way that helps Joydeep decide where to intervene
- R008 — Personal OS remains a private orchestration layer, not the system of record

## Scope

### In Scope

- web-app alignment to the Director-of-Products operating model
- daily planning UI hierarchy and naming
- Today’s Three and intervention framing in the UI
- role-consistent blocker and goal context on the main daily view

### Out of Scope / Non-Goals

- broad redesign of all app surfaces at once
- new external integrations as part of this first alignment pass
- rewriting every existing engine before proving the first user-facing slice

## Technical Constraints

- prefer reusing current APIs and scoring logic where possible, extending them only when necessary
- preserve truthful UI semantics; do not claim intervention reasoning the app cannot actually support
- verify real browser behavior before marking slices complete

## Open Questions

- should `/today` become the primary intervention brief, or should `/assistant` absorb that role and `/today` become a lighter execution surface
- what is the minimum API shaping needed to support role-specific intervention reasoning without overbuilding
- how much of Today’s Three can be derived from existing data vs. requiring a new ranking seam
