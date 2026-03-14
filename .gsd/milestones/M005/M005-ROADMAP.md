# M005: Director-of-Products web-app alignment

**Vision:** Align the Product Control Tower web app with Joydeep’s Director-of-Products operating model so the primary daily surfaces reflect intervention-first planning, Today’s Three, blocker visibility, and role-specific context instead of generic task execution framing.

## Success Criteria

- Joydeep can open the app and immediately see a Director Intervention Brief with a small number of high-leverage priorities.
- The daily app surface reflects Today’s Three, operating-goal context, and blocker visibility in language and structure consistent with the markdown system.
- The app and markdown operating model no longer conflict on the core daily planning behavior.

## Key Risks / Unknowns

- Existing APIs may not expose enough role-aware context for the UI without additional shaping.
- `/today` and `/assistant` may overlap unless one becomes the clear primary daily brief.
- UI-only copy changes may create a false sense of alignment if the ranking/reasoning remains generic.

## Proof Strategy

- the app can support a truthful Director Intervention Brief on the current daily surface → retire in S01 by reshaping `/today` around intervention-first hierarchy and Today’s Three using existing or lightly extended data
- role-consistent continuity can reach the richer assistant surfaces → retire in S02 by connecting the intervention framing to assistant/contextual surfaces without UI-local contradictions
- the new operating model works live in the browser → retire in S03 by verifying the daily flow end to end in the running app

## Verification Classes

- Contract verification: tests or static verification for any new UI-state logic and API shaping
- Integration verification: live wiring to current app APIs and existing assistant/control-tower data
- Operational verification: browser checks that the primary daily surface behaves as the intended intervention brief
- UAT / human verification: browser validation that the app now matches the markdown operating model

## Milestone Definition of Done

This milestone is complete only when all are true:

- the primary daily app surface is intervention-first rather than generically task-first
- Today’s Three, blocker visibility, and operating-goal context are live in the UI
- the app’s daily operating model is consistent with the markdown Personal OS
- browser verification proves the resulting flow in the running app

## Requirement Coverage

- Covers: R001, R003
- Partially covers: R008
- Leaves for later: broader assistant/control-tower orchestration beyond daily app alignment
- Orphan risks: none

## Slices

- [x] **S01: Daily intervention brief UI alignment** `risk:medium` `depends:[]`
  > After this: `/today` presents a Director Intervention Brief, Today’s Three, blocker visibility, and operating-goal context using the current app foundations.
- [x] **S02: Assistant continuity alignment** `risk:medium` `depends:[S01]`
  > After this: the richer assistant surface reflects the same intervention model and no longer feels like a separate operating system.
- [x] **S03: Shared intervention presentation seam** `risk:low` `depends:[S01,S02]`
  > After this: `/today` and `/assistant` share a small intervention-presentation seam and remain browser-verified after the refactor.
