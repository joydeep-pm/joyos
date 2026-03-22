---
id: M012
provides:
  - A dedicated weekly strategy review workflow for FY27 strategy follow-through inside Personal OS
  - A repeatable ritual connecting goals, strategy notes, strategy-derived tasks, and next-week interventions
key_decisions:
  - Keep the strategy review as a separate workflow from the generic weekly review
  - End the workflow with next week's must-win interventions instead of broad reflection output
patterns_established:
  - When a new strategy layer and follow-through task set exist, add a dedicated review workflow rather than overloading the generic weekly review
observability_surfaces:
  - examples/workflows/weekly-strategy-review.md
  - Knowledge/Strategy/FY27/
  - Tasks/fy27-*.md
requirement_outcomes:
  - id: R008
    from_status: validated
    to_status: validated
    proof: the strategy review cadence now lives inside Personal OS as a markdown workflow connected to the FY27 strategy corpus and task set
  - id: R001
    from_status: active
    to_status: active
    proof: weekly intervention quality is improved by a reusable strategy review ritual, though the app's daily brief runtime was not changed
  - id: R003
    from_status: active
    to_status: active
    proof: the workflow explicitly reviews drifting risks and stale follow-through, though runtime blocker detection was not changed
duration: 30m
verification_result: passed
completed_at: 2026-03-21
---

# M012: Weekly strategy review workflow for Personal OS

**Added a dedicated weekly strategy review ritual so FY27 strategy, follow-through tasks, and next-week interventions can be refreshed consistently inside Personal OS.**

## What Happened

M012 introduced a new workflow file, `examples/workflows/weekly-strategy-review.md`, to complement the existing generic weekly review. The new workflow is explicitly grounded in the current strategy layer: `GOALS.md`, `Knowledge/Strategy/FY27/`, and the FY27 strategy-derived tasks.

S01 defined the workflow’s distinct role and kept it separate from the broader weekly review. S02 created the actual markdown workflow with a short input set, a six-step review sequence, and a strong end-state focused on next week’s must-win strategic interventions. S03 verified that the workflow is discoverable in `examples/workflows/`, readable as a standalone ritual, and practical for the current FY27 operating model.

## Cross-Slice Verification

- Workflow inventory check:
  - `ls -1 examples/workflows`
- Content spot check:
  - `head -40 examples/workflows/weekly-strategy-review.md`
- Integration review against:
  - `GOALS.md`
  - `Knowledge/Strategy/FY27/`
  - `Tasks/fy27-*.md`

## Requirement Changes

- R008: validated → validated — the strategy review cadence now lives inside Personal OS as a markdown workflow anchored in the strategy corpus and task layer.
- R001: active → active — this milestone improves weekly intervention quality but does not modify the runtime daily brief.
- R003: active → active — this milestone adds a review ritual for drifting risk and stale follow-through but does not change the live blocker visibility implementation.

## Forward Intelligence

### What the next milestone should know
- `examples/workflows/weekly-strategy-review.md` should be the preferred ritual when reviewing FY27 strategy specifically.
- The generic `weekly-review.md` remains useful for broader operating reflection; the new workflow is intentionally narrower and strategy-focused.

### What's fragile
- The workflow is only valuable if used regularly; there is no reminder or automation layer yet.
- As the FY27 strategy task set evolves, the named task references in the workflow may need periodic refresh.

### Authoritative diagnostics
- `examples/workflows/weekly-strategy-review.md` — canonical weekly strategy review ritual
- `GOALS.md` — weekly priority anchor
- `Knowledge/Strategy/FY27/Operating-Command-Brief.md` — top strategy input for the ritual

### What assumptions changed
- Original assumption: the existing weekly review might be enough — what changed: the strategy layer now has distinct inputs and outputs, so a dedicated review workflow is justified.

## Files Created/Modified

- `examples/workflows/weekly-strategy-review.md`
- `.gsd/milestones/M012/M012-CONTEXT.md`
- `.gsd/milestones/M012/M012-ROADMAP.md`
- `.gsd/milestones/M012/M012-SUMMARY.md`
- `.gsd/PROJECT.md`
- `.gsd/STATE.md`
- `.gsd/DECISIONS.md`
