# M008: Navigation and route coherence for the director operating model

**Vision:** Make the new director workflow discoverable by foregrounding `Today` and `Assistant` in navigation and landing behavior while de-emphasizing the legacy `Intervention` route.

## Success Criteria

- Primary nav shows `Today` and `Assistant`.
- `/` lands on the intended daily starting surface.
- Users no longer have to know hidden routes to find the current workflow.

## Key Risks / Unknowns

- De-emphasizing `/intervention` may hide a still-useful specialist view.
- Route coherence changes can break user expectations if done too abruptly.

## Proof Strategy

- nav model can be updated coherently → retire in S01 by changing primary nav labels/order and landing route
- legacy route can remain available without competing → retire in S02 by keeping `/intervention` reachable but secondary
- user discovery can be verified end-to-end → retire in S03 by proving nav and landing behavior in tests/browser checks

## Verification Classes

- Contract verification: nav model, labels, route ordering
- Integration verification: root redirect and primary nav behavior
- Operational verification: browser navigation to home, today, assistant, and intervention
- UAT / human verification: users can find current surfaces without route guesswork

## Milestone Definition of Done

This milestone is complete only when all are true:

- `Today` and `Assistant` are primary navigation items
- `/` lands on the intended daily workflow
- `/intervention` no longer appears as the default primary surface

## Requirement Coverage

- Covers: R001, R008
- Leaves for later: deciding whether `/intervention` should be redirected, renamed, or redesigned further
- Orphan risks: none

## Slices

- [ ] **S01: Promote Today and Assistant in primary navigation** `risk:low` `depends:[]`
  > After this: the top nav clearly exposes the current daily workflow surfaces.
- [ ] **S02: Make Today the landing route and de-emphasize legacy Intervention** `risk:low` `depends:[S01]`
  > After this: opening the app starts in the right place and `/intervention` stops competing as the default.
- [ ] **S03: Verify coherent discovery across nav and routes** `risk:low` `depends:[S01,S02]`
  > After this: tests and browser verification prove users can find the current workflow without route guesswork.
