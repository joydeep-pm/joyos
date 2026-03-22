# M014: Monthly strategy review workflow and status-output index — Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

## Project Description

This milestone extends the FY27 strategy operating system with two missing coordination layers: a monthly strategy review workflow and a central index for shareable status outputs. The monthly review will support a broader, slower cadence than the weekly strategy review, while the index will make it easier to find the current stakeholder-facing outputs without scanning the folder structure manually.

## Why This Milestone

The weekly strategy review now exists, and stakeholder-facing outputs can now be created. The next gap is cadence and discoverability at the monthly level. Joydeep asked for both a monthly strategy review workflow and a status-update index page. These two additions together make the strategy system easier to maintain and easier to use as a communication layer.

## User-Visible Outcome

### When this milestone is complete, the user can:

- run a monthly strategy review focused on bigger shifts, month-over-month movement, and business-facing outcomes
- open one index note that links the current shareable status, business updates, and templates from a single place

### Entry point / environment

- Entry point: workflow markdown under `examples/workflows/` and index markdown under `Knowledge/Strategy/FY27/`
- Environment: local markdown workspace / Personal OS
- Live dependencies involved: none

## Completion Class

- Contract complete means: the monthly review workflow and status-output index files exist with clear structure and roles
- Integration complete means: both are linked to the current FY27 strategy corpus and stakeholder-output pack
- Operational complete means: the system now supports both recurring monthly review and quick access to shareable outputs

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- a monthly strategy review workflow exists and is meaningfully distinct from the weekly review
- a central index exists for current shareable outputs and templates
- both artifacts make the FY27 strategy system easier to run and easier to communicate from

## Risks and Unknowns

- Workflow redundancy risk — the monthly review could duplicate the weekly review if not scoped to slower, bigger questions
- Index bloat risk — the index could become a file dump instead of a useful entrypoint

## Existing Codebase / Prior Art

- `examples/workflows/weekly-strategy-review.md` — current weekly strategy review ritual
- `Knowledge/Strategy/FY27/Current-Shareable-Status.md` — current main shareable note
- `Knowledge/Templates/` — stakeholder output pack
- `Knowledge/Strategy/FY27/Business-Status-Update-2026-03-21.md` — first dated business-facing update

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution when a meaningful decision is made.

## Relevant Requirements

- R001 — improves strategic planning readiness and leadership communication support
- R003 — improves visibility into bigger monthly shifts and lingering risk themes
- R008 — keeps the review/communication system inside Personal OS as the source of truth

## Scope

### In Scope

- create a monthly strategy review workflow
- create a status-output index note linking current shareable outputs and templates

### Out of Scope / Non-Goals

- automation of monthly review reminders
- app/UI changes
- export automation

## Technical Constraints

- remain markdown-first
- make the monthly workflow distinct from the weekly workflow
- keep the index concise and usable as a real entrypoint

## Integration Points

- `examples/workflows/weekly-strategy-review.md`
- `Knowledge/Strategy/FY27/`
- `Knowledge/Templates/`
- `GOALS.md`

## Open Questions

- Should the index live at the FY27 folder root or inside Templates? — current thinking: keep it in `Knowledge/Strategy/FY27/` because the primary use is current FY27 communication, not generic templating
