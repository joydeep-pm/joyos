# M012: Weekly strategy review workflow for Personal OS

**Vision:** Give Joydeep a lightweight but specific weekly strategy review ritual that keeps FY27 strategy, follow-through tasks, and intervention priorities current inside Personal OS.

## Success Criteria

- A dedicated weekly strategy review workflow exists under `examples/workflows/` and is clearly distinct from the generic weekly review.
- The workflow explicitly uses `GOALS.md`, `Knowledge/Strategy/FY27/`, and the strategy-derived task set as inputs.
- The workflow ends with next week’s must-win strategic interventions rather than a generic reflection dump.

## Key Risks / Unknowns

- Workflow duplication risk — if too similar to the existing weekly review, the new workflow will not add value.
- Over-scope risk — if the review is too broad or long, it will not be used consistently.

## Proof Strategy

- Workflow duplication risk → retire in S01 by defining the strategy-specific prompts and differentiators against the generic weekly review.
- Over-scope risk → retire in S02 by writing a concise workflow focused on strategy follow-through, blockers, and next-week intervention choices.
- Operational usefulness → retire in S03 by verifying the final workflow reads as a practical weekly ritual tied to the current strategy/task system.

## Verification Classes

- Contract verification: file existence and structure review for the new workflow
- Integration verification: explicit references to goals, strategy notes, and tasks in the workflow content
- Operational verification: read-through for cadence, scope, and weekly usefulness
- UAT / human verification: dry-run suitability review against current FY27 strategy follow-through needs

## Milestone Definition of Done

This milestone is complete only when all are true:

- a separate weekly strategy review workflow exists and is grounded in current Personal OS strategy structures
- the workflow clearly differs from the generic weekly review by focusing on strategy refresh and intervention quality
- the workflow can be used to review FY27 strategy notes, strategy-derived tasks, and next-week must-win interventions in one pass
- milestone artifacts capture the rationale for the separate workflow and how it should be used

## Requirement Coverage

- Covers: R008
- Partially covers: R001, R003
- Leaves for later: reminders or automation to enforce the weekly review cadence
- Orphan risks: none

## Slices

- [x] **S01: Strategy review workflow design** `risk:high` `depends:[]`
  > After this: the strategy-specific weekly review structure is defined and clearly differentiated from the generic weekly review.
- [x] **S02: Create weekly strategy review workflow** `risk:medium` `depends:[S01]`
  > After this: a reusable markdown workflow exists for reviewing FY27 strategy, follow-through tasks, and next-week interventions.
- [x] **S03: Review and operationalize workflow** `risk:low` `depends:[S01,S02]`
  > After this: the workflow reads as a practical weekly operating rhythm for strategy follow-through.

## Boundary Map

### S01 → S02

Produces:
- workflow scope and differentiators
- required inputs and expected outputs
- prompt sequence for the strategy review

Consumes:
- nothing (first slice)

### S01 → S03

Produces:
- workflow success criteria for practical use
- cadence expectations and linkage to the strategy/task system

Consumes:
- nothing (first slice)
