# M007: Meeting-derived action drafts

**Vision:** Turn visible meeting-derived open loops into safe local actions so review can flow directly into durable work without breaking markdown-first architecture.

## Success Criteria

- Joydeep can act on a meeting continuity item from `/assistant` without manually retyping it.
- The first action path creates or prepares a durable local artifact safely.
- The review surface remains inspectable before and after action.

## Key Risks / Unknowns

- Direct local creation may still create noisy tasks if the action contract is weak.
- Review-panel actions could become cluttered if too many artifact types are attempted at once.
- Post-action refresh needs to remain truthful so users can see what changed.

## Proof Strategy

- meeting review actions can be defined safely → retire in S01 by making the first action contract explicit and narrow
- one local action family can execute from meeting review → retire in S02 by wiring a task-creation path end-to-end
- the post-action loop stays visible and trustworthy → retire in S03 by proving the assistant review surface refreshes and reflects the result

## Verification Classes

- Contract verification: action labels, payload shape, and local-only guardrails
- Integration verification: panel action → API call → durable local artifact
- Operational verification: assistant review surface and/or related state reflects the new artifact after refresh
- UAT / human verification: walkthrough of one meeting item becoming tracked work

## Milestone Definition of Done

This milestone is complete only when all are true:

- at least one meeting continuity item can trigger a safe local draft action
- the resulting artifact is durable and inspectable in the local system
- the review loop shows the user what happened after the action

## Requirement Coverage

- Covers: R001, R003, R008
- Leaves for later: multi-artifact drafting, external writeback from meeting review, stronger note-mutation paths
- Orphan risks: none

## Slices

- [ ] **S01: Meeting action contract** `risk:low` `depends:[]`
  > After this: the repo has a narrow, explicit contract for what meeting review actions are allowed first.
- [ ] **S02: Local task action from meeting review** `risk:medium` `depends:[S01]`
  > After this: a meeting continuity item can create a durable local task through the assistant review surface.
- [ ] **S03: Visible post-action review loop** `risk:medium` `depends:[S01,S02]`
  > After this: the user can see the meeting review surface reflect the action and understand what changed.
