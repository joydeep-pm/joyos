# M011: Strategy-to-task extraction for FY27 operating follow-through — Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

## Project Description

This milestone turns the newly created FY27 strategy knowledge corpus in Personal OS into concrete follow-through work. Instead of leaving the strategy as reference material only, the workspace will extract actionable interventions, artifact work, people work, and execution follow-ups into durable task files under `Tasks/`, grounded in current goals and the FY27 strategy notes.

## Why This Milestone

The strategy corpus now exists in markdown, but without linked tasks it remains mostly advisory. Joydeep asked specifically for strategy-to-task extraction, which means the operating system should convert the strategy into concrete work: leadership reviews, stakeholder alignments, loss-analysis loops, hiring dependencies, collateral refreshes, and market-entry follow-ups. This makes the strategy actionable rather than archival.

## User-Visible Outcome

### When this milestone is complete, the user can:

- review a curated set of actionable FY27 strategy tasks under `Tasks/` derived directly from the strategy notes
- see which strategy follow-ups support operating goals like Documentation, Stability, New Business, and Team Leadership

### Entry point / environment

- Entry point: markdown task files under `Tasks/`
- Environment: local workspace / Personal OS markdown task management
- Live dependencies involved: none

## Completion Class

- Contract complete means: a set of strategy-derived task files exists under `Tasks/` with complete metadata and grounded next actions
- Integration complete means: each task clearly traces back to the FY27 strategy knowledge corpus and current goals
- Operational complete means: the task set is concise, actionable, non-duplicative, and usable for intervention planning without re-reading all source strategy notes

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- the FY27 strategy notes have been converted into a focused set of actionable tasks rather than left as passive documentation
- each created task includes enough context, category, priority, and next actions to be used immediately
- the resulting task set aligns with current goals and avoids becoming a generic backlog dump

## Risks and Unknowns

- Over-extraction risk — too many tasks would dilute the signal and violate the Personal OS operating model of focusing on a few high-leverage interventions
- Duplicative follow-up risk — some task themes may already exist in the workspace and should be updated or superseded carefully

## Existing Codebase / Prior Art

- `Knowledge/Strategy/FY27/` — newly created durable strategy note set
- `GOALS.md` — current operating priorities and strategic framing
- `Tasks/` — canonical actionable task directory for Personal OS
- `Tasks/lamf-las-colending-middleware-roadmap.md` — example of an existing strategy-adjacent task that may overlap with FY27 priorities

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution when a meaningful decision is made.

## Relevant Requirements

- R001 — advances daily intervention quality by turning strategy into concrete follow-through work
- R003 — improves visibility into stale risks and dependencies by capturing strategy-linked actions as tasks
- R008 — keeps Personal OS as the private orchestration layer where strategy and execution follow-through meet

## Scope

### In Scope

- review FY27 strategy notes and current goals
- identify the highest-leverage strategy follow-ups
- create a concise set of new task files under `Tasks/` with metadata and next actions

### Out of Scope / Non-Goals

- mass-importing every possible strategy item into tasks
- changing the web app
- changing external systems like Jira or Confluence

## Technical Constraints

- Stay within markdown task files in the Personal OS workspace
- Keep the task set concise and intervention-oriented
- Prefer no more than a handful of high-leverage tasks over exhaustive conversion

## Integration Points

- `Knowledge/Strategy/FY27/` — source strategy corpus
- `GOALS.md` — current priority alignment
- `Tasks/` — destination for extracted work

## Open Questions

- Should overlapping older tasks be edited or should new FY27 strategy tasks be created alongside them? — current thinking: create focused new tasks unless a direct one-to-one overlap makes an update clearly better
