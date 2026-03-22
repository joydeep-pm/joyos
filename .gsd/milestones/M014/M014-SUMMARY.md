---
id: M014
provides:
  - A monthly strategy review workflow focused on larger shifts, decisions, and communication readiness
  - A central FY27 status-output index for current shareable notes and templates
key_decisions:
  - Keep monthly strategy review separate from the weekly review
  - Make the status-output index role-based and action-oriented instead of a raw file list
patterns_established:
  - Once a strategy communication layer exists, add both cadence and discoverability artifacts to keep it usable
observability_surfaces:
  - examples/workflows/monthly-strategy-review.md
  - Knowledge/Strategy/FY27/Status-Output-Index.md
requirement_outcomes:
  - id: R008
    from_status: validated
    to_status: validated
    proof: Personal OS now contains weekly review, monthly review, and communication index layers on top of the FY27 strategy system
  - id: R001
    from_status: active
    to_status: active
    proof: strategy planning readiness improved, though the runtime daily brief was not changed
  - id: R003
    from_status: active
    to_status: active
    proof: monthly structural risk review and output discovery improved, though live blocker visibility was not changed
duration: 25m
verification_result: passed
completed_at: 2026-03-21
---

# M014: Monthly strategy review workflow and status-output index

**Added a monthly strategy review ritual and a single output index so the FY27 strategy system is easier to refresh and easier to communicate from.**

## What Happened

M014 completed two coordination layers that were still missing from the FY27 strategy operating system. First, it added `examples/workflows/monthly-strategy-review.md`, a broader cadence than the weekly strategy review focused on larger shifts, strategic decisions, communication readiness, and month-level interventions. Second, it added `Knowledge/Strategy/FY27/Status-Output-Index.md`, a central entrypoint for current shareable status notes, dated business updates, supporting decision artifacts, templates, and review workflows.

S01 defined the difference between weekly and monthly strategy review. S02 created both the new monthly workflow and the index. S03 verified that the workflow and index are concise, linked to the current FY27 system, and useful as cadence + discovery improvements.

## Cross-Slice Verification

- Workflow inventory and content review:
  - `examples/workflows/monthly-strategy-review.md`
- Output-index review:
  - `Knowledge/Strategy/FY27/Status-Output-Index.md`
- Integration checks against:
  - `Knowledge/Strategy/FY27/Current-Shareable-Status.md`
  - `Knowledge/Templates/`
  - `examples/workflows/weekly-strategy-review.md`

## Requirement Changes

- R008: validated → validated — the strategy system now includes both weekly and monthly cadence plus a communication discovery layer inside Personal OS.
- R001: active → active — planning readiness improved, but the runtime daily brief was not changed.
- R003: active → active — structural risk review and output discovery improved, but live blocker visibility was not changed.

## Forward Intelligence

### What the next milestone should know
- `Knowledge/Strategy/FY27/Status-Output-Index.md` is now the main entrypoint for finding current shareable artifacts.
- `examples/workflows/monthly-strategy-review.md` should be used for month-level strategy reset and communication refresh.

### What's fragile
- The index will need light maintenance as more dated updates or outputs are created.
- The monthly workflow is only valuable if the shareable status note is actually refreshed from it.

### Authoritative diagnostics
- `examples/workflows/monthly-strategy-review.md`
- `Knowledge/Strategy/FY27/Status-Output-Index.md`

### What assumptions changed
- Original assumption: the stakeholder output pack might be enough — what changed: cadence and output discovery also needed explicit support.

## Files Created/Modified

- `examples/workflows/monthly-strategy-review.md`
- `Knowledge/Strategy/FY27/Status-Output-Index.md`
- `.gsd/milestones/M014/M014-CONTEXT.md`
- `.gsd/milestones/M014/M014-ROADMAP.md`
- `.gsd/milestones/M014/M014-SUMMARY.md`
- `.gsd/PROJECT.md`
- `.gsd/STATE.md`
- `.gsd/DECISIONS.md`
