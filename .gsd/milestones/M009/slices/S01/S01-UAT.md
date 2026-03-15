# S01: Roadmap artifact taxonomy and format grounding — UAT

**Milestone:** M009
**Written:** 2026-03-15

## UAT Type

- UAT mode: artifact/contract verification
- Why this mode is sufficient: this slice establishes taxonomy, structure, and planning contracts rather than a running UI feature.

## Preconditions

- M009 milestone docs exist.
- Requirements were updated with roadmap communication distinctions.
- The M2P monthly product update and product roadmap templates exist.

## Smoke Test

Read the M009 context and confirm it explicitly distinguishes Product Update, Roadmap Update, roadmap deck, and quarterly collateral refreshes.

## Test Cases

### 1. Artifact taxonomy clarity

1. Open `.gsd/milestones/M009/M009-CONTEXT.md`.
2. **Expected:** Product Update, Roadmap Update, roadmap deck, and Product Deck / Factsheet refresh are described as different jobs.

### 2. Grounding in real format

1. Open `.gsd/milestones/M009/M009-CONTEXT.md`.
2. **Expected:** The docs reference the real monthly update structure and representative vertical/platform areas such as Gold Loan, LAMF, BNPL, LOS, Collections, Co-Lending, and Legal.

### 3. Drafting vs reminder split

1. Open `.gsd/milestones/M009/M009-CONTEXT.md` and `.gsd/milestones/M009/M009-ROADMAP.md`.
2. **Expected:** Draft generation and quarterly reminder work are clearly separated into later slices.

## Failure Signals

- Product Update and Roadmap Update still read like the same thing.
- The milestone docs ignore the real vertical-aware structure already used in monthly updates.
- Product Deck / Factsheet refreshes are not treated as recurring reminder work.

## Requirements Proved By This UAT

- The roadmap communication problem is now represented as distinct artifact jobs with grounded structure.

## Not Proven By This UAT

- No roadmap draft generation is proven yet.
- No collateral reminder UI/workflow is proven yet.

## Notes for Tester

This slice intentionally stops at the contract layer. S02 should implement drafts; S03 should implement reminders.
