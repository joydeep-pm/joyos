---
id: T02
parent: S01
milestone: M004
provides:
  - Director-level morning and weekly workflow guidance aligned to intervention-based product leadership
key_files:
  - examples/workflows/morning-standup.md
  - examples/workflows/weekly-review.md
  - examples/workflows/README.md
key_decisions:
  - Make Director Intervention Brief + Today’s Three the default daily planning pattern
patterns_established:
  - Group review and planning around Documentation, Stability, New Business, blockers, and recurring patterns instead of generic productivity metrics
observability_surfaces:
  - workflow markdown files
  - grep/diff over workflow language
duration: 35m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Upgrade daily and weekly workflows into director intervention loops

**Rewrote the daily and weekly workflows around intervention, blockers, and operating-goal progress.**

## What Happened

The morning standup workflow now starts with a Director Intervention Brief, then constrains the day to Today’s Three. It explicitly prioritizes PM/client/feature-request intervention needs, blocker age, leadership urgency, and operating-goal support instead of generic top-task selection.

The weekly review workflow was expanded into a Director-of-Products reflection loop covering Documentation, Stability, New Business, and Team Leadership. It now asks where Joydeep had to intervene, what patterns repeated across blockers or PM coaching, what should be learned by the system, and what next week’s must-win interventions are.

The workflow index was also updated so the repo now advertises meeting follow-up and 1:1 prep as first-class workflows alongside morning planning and weekly review.

## Verification

- Ran `rg -n "intervention|Today's Three|Documentation|Stability|New Business|PM|blocker|learning" examples/workflows/morning-standup.md examples/workflows/weekly-review.md examples/workflows/README.md`
- Reviewed `git diff -- examples/workflows/morning-standup.md examples/workflows/weekly-review.md examples/workflows/README.md`
- Confirmed the workflows now read as director operating loops rather than generic planning prompts.

## Diagnostics

Future agents should inspect:
- `examples/workflows/morning-standup.md` for the daily intervention structure
- `examples/workflows/weekly-review.md` for the weekly reflection and learning loop
- `examples/workflows/README.md` for discovery and prompt guidance

If future edits regress the role-specific behavior, grep for `Director Intervention Brief`, `Today’s Three`, `Documentation`, `Stability`, `New Business`, and `learning`.

## Deviations

None.

## Known Issues

The referenced `meeting-followup.md` and `one-on-one-prep.md` files did not exist yet at the start of this task. They are still to be created in T03.

## Files Created/Modified

- `examples/workflows/morning-standup.md` — rewritten around daily intervention triage and Today’s Three
- `examples/workflows/weekly-review.md` — rewritten around operating-goal progress, recurring patterns, and system learnings
- `examples/workflows/README.md` — updated workflow catalog and prompt guidance for the director operating model
