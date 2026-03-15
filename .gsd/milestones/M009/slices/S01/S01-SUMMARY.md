---
id: S01
parent: M009
milestone: M009
provides:
  - A grounded roadmap communications taxonomy separating Product Update, Roadmap Update, roadmap deck, and quarterly collateral refresh work
requires:
  - slice: none
    provides: none
affects:
  - S02
  - S03
key_files:
  - .gsd/milestones/M009/M009-CONTEXT.md
  - .gsd/milestones/M009/M009-ROADMAP.md
  - .gsd/milestones/M009/slices/S01/S01-PLAN.md
  - requirements.md
key_decisions:
  - Product Update and Roadmap Update must be treated as distinct artifact jobs
  - Roadmap comms should reuse the real vertical/platform structure already present in the monthly product update format
  - Product Deck/Factsheet work should begin as reminder-driven collateral maintenance, not over-scoped template automation
patterns_established:
  - Roadmap deck output can start as template-aware outline/content generation before full slide automation exists
observability_surfaces:
  - M009 docs
  - updated requirements wording
  - grep over milestone docs and M2P templates
drill_down_paths:
  - .gsd/milestones/M009/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M009/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M009/slices/S01/tasks/T03-SUMMARY.md
duration: 2h
verification_result: passed
completed_at: 2026-03-15
---

# S01: Roadmap artifact taxonomy and format grounding

**Separated roadmap communication into distinct artifact jobs and grounded the milestone in the real monthly update structure.**

## What Happened

This slice defined the contract for roadmap communications work. The M009 milestone docs now clearly distinguish Monthly Product Update, Roadmap Update, overall roadmap deck, and quarterly Product Deck / Product Factsheet refreshes. That distinction is now explicit in planning language instead of being left implicit or conflated.

The slice also grounded the roadmap comms model in Joydeep’s actual monthly product update format, including the real lending verticals and platform areas already used in practice. Finally, it clarified the split between drafting and reminders: S02 should focus on roadmap-oriented draft generation through the existing artifact/template seams, while S03 should focus on recurring collateral reminders.

## Verification

- `rg -n "Product Update|Roadmap Update|roadmap deck|Product Deck|Factsheet|quarterly" requirements.md .gsd/milestones/M009 docs .config/templates/m2p`
- `rg -n "Gold Loan|LAMF|BNPL|LOS|Collections|Co-Lending|Legal" .gsd/milestones/M009`
- `rg -n "template|reminder|quarterly|artifact" .gsd/milestones/M009 build-plan.md`

## Requirements Advanced

- advanced the newly added roadmap communication requirements by defining the artifact taxonomy and cadence explicitly
- advanced the recurring collateral maintenance requirement by treating Product Deck/Factsheet refreshes as first-class reminder work

## Requirements Validated

- The repo now explicitly distinguishes Product Update from Roadmap Update in milestone planning and requirement language.

## New Requirements Surfaced

- S02 will likely need a dedicated roadmap-oriented context shape rather than blindly reusing feature-request drafting inputs.

## Known Limitations

- No actual roadmap draft generation exists yet.
- No reminder surface exists yet for quarterly Product Deck / Factsheet refreshes.
- The roadmap workbook itself has not yet been normalized into app-consumable data.

## Follow-ups

- Build S02 around one vertical-specific roadmap update plus one overall roadmap deck outline.
- Build S03 around reminder visibility for quarterly collateral refreshes.

## Files Created/Modified

- `.gsd/milestones/M009/M009-CONTEXT.md`
- `.gsd/milestones/M009/M009-ROADMAP.md`
- `.gsd/milestones/M009/slices/S01/S01-PLAN.md`
- `requirements.md`
