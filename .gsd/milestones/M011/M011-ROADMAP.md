# M011: Strategy-to-task extraction for FY27 operating follow-through

**Vision:** Convert the FY27 strategy knowledge corpus into a concise, high-leverage task set inside Personal OS so the strategy drives real intervention work rather than sitting as reference material.

## Success Criteria

- A focused set of strategy-derived task files exists under `Tasks/` with clear metadata, context, and next actions.
- Each created task maps back to the FY27 strategy notes and aligns with at least one operating goal such as Documentation, Stability, New Business, or Team Leadership.
- The resulting task set is small enough to be useful for intervention planning and does not become a generic backlog dump.

## Key Risks / Unknowns

- Over-extraction risk — converting too much strategy material into tasks would reduce clarity and overwhelm the workspace.
- Duplication risk — new tasks could overlap with existing task files and create conflicting follow-through surfaces.

## Proof Strategy

- Over-extraction risk → retire in S01 by defining a small, clear extraction set based on the highest-leverage strategy follow-ups only.
- Duplication risk → retire in S02 by checking the current `Tasks/` inventory and creating only non-duplicative FY27 strategy tasks with explicit scope.
- Operational usefulness → retire in S03 by proving the final task set can be read as an actionable strategy follow-through layer.

## Verification Classes

- Contract verification: filesystem checks for new task files and metadata completeness review
- Integration verification: task-to-strategy and task-to-goal alignment review
- Operational verification: concise task-set review for intervention usefulness and non-duplication
- UAT / human verification: read-through of the final extracted tasks as Today/leadership-ready follow-through work

## Milestone Definition of Done

This milestone is complete only when all are true:

- a concise set of FY27 strategy-derived tasks exists under `Tasks/`
- each task is actionable, clearly scoped, and grounded in the strategy corpus
- the task set aligns with current goals and avoids obvious duplication with existing tasks
- the extracted work supports real follow-through in Personal OS rather than acting as passive notes
- milestone artifacts capture the strategy-to-task pattern for future reuse

## Requirement Coverage

- Covers: R008
- Partially covers: R001, R003
- Leaves for later: automatic strategy-to-task generation, daily brief automation from these tasks
- Orphan risks: none

## Slices

- [x] **S01: Strategy extraction shortlist** `risk:high` `depends:[]`
  > After this: the highest-leverage FY27 strategy follow-ups are shortlisted with clear task candidates and overlap awareness.
- [x] **S02: Create strategy-derived task set** `risk:medium` `depends:[S01]`
  > After this: the Personal OS contains a concise set of new FY27 strategy tasks with complete metadata and next actions.
- [x] **S03: Review and operationalize extracted tasks** `risk:low` `depends:[S01,S02]`
  > After this: the final task set reads as a usable follow-through layer for strategy-driven intervention work.

## Boundary Map

### S01 → S02

Produces:
- shortlisted strategy task candidates
- overlap review against existing tasks
- task naming and scope choices

Consumes:
- nothing (first slice)

### S01 → S03

Produces:
- extraction criteria defining why each task belongs in the final set
- alignment expectations against goals and strategy notes

Consumes:
- nothing (first slice)
