# M012: Weekly strategy review workflow for Personal OS — Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

## Project Description

This milestone adds a reusable weekly strategy review workflow to the Personal OS so Joydeep can refresh strategy, interventions, blockers, and learning loops on a regular cadence. The workflow should bridge the newly created FY27 strategy corpus, the strategy-derived tasks, and the broader weekly review habit already present in the workspace.

## Why This Milestone

The workspace already has a general weekly review workflow, but the new FY27 strategy layer and strategy-derived tasks need a more explicit operating rhythm. Without a dedicated strategy review loop, the strategy notes risk becoming static and the extracted tasks risk drifting away from active review. The user explicitly asked for a weekly strategy review workflow, making this the right next step after strategy-to-task extraction.

## User-Visible Outcome

### When this milestone is complete, the user can:

- run a weekly strategy review using a markdown workflow that focuses on FY27 priorities, strategy-derived tasks, commercial readiness, and leadership interventions
- use the workflow to refresh strategy notes, identify stale risks, and set the next week's must-win strategic interventions

### Entry point / environment

- Entry point: workflow markdown under `examples/workflows/`
- Environment: local markdown workspace / Personal OS
- Live dependencies involved: none

## Completion Class

- Contract complete means: a dedicated weekly strategy review workflow exists with clear prompts, sequence, and outputs grounded in the current strategy/task system
- Integration complete means: the workflow explicitly references the FY27 strategy notes, strategy-derived tasks, and existing Personal OS structures
- Operational complete means: the workflow is concise enough to use regularly and specific enough to improve strategic follow-through week to week

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- there is a reusable weekly review workflow specifically for strategy follow-through, not just the generic weekly review
- the workflow connects strategy notes, tasks, and intervention thinking in a repeatable sequence
- the resulting workflow can be used as a practical weekly operating rhythm inside Personal OS

## Risks and Unknowns

- Workflow duplication risk — the new workflow could become too similar to the existing weekly review and fail to justify its existence
- Over-scope risk — if the strategy review tries to cover too much, it will not be used consistently

## Existing Codebase / Prior Art

- `examples/workflows/weekly-review.md` — current generic weekly review workflow
- `Knowledge/Strategy/FY27/` — strategy corpus that now needs a recurring refresh cadence
- `Tasks/fy27-*.md` — strategy-derived follow-through tasks to be reviewed weekly
- `GOALS.md` — goal layer that should anchor weekly priority review

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution when a meaningful decision is made.

## Relevant Requirements

- R001 — improves the quality of weekly intervention selection and next-week focus
- R003 — improves visibility into stale risks, blockers, and drift
- R008 — keeps the strategy review loop inside Personal OS as the orchestration layer

## Scope

### In Scope

- create a dedicated weekly strategy review workflow in markdown
- tie the workflow to FY27 strategy notes, strategy-derived tasks, and next-week intervention planning
- keep the workflow concise and usable

### Out of Scope / Non-Goals

- automation of the review itself
- app/UI changes
- calendar or reminder system changes

## Technical Constraints

- workflow must remain markdown-first
- should complement rather than replace the generic weekly review
- must be specific enough to strategy follow-through to justify a separate workflow

## Integration Points

- `examples/workflows/weekly-review.md` — prior art and baseline structure
- `Knowledge/Strategy/FY27/` — primary strategy input
- `Tasks/` — strategy follow-through tasks
- `GOALS.md` — weekly priority anchor

## Open Questions

- Should this become a separate workflow file or a section inside the existing weekly review? — current thinking: separate workflow file is cleaner because it serves a distinct strategy-refresh job
