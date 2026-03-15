---
id: T01
parent: S01
milestone: M009
provides:
  - A clear taxonomy separating Product Update, Roadmap Update, roadmap deck, and quarterly collateral refresh work
key_files:
  - .gsd/milestones/M009/M009-CONTEXT.md
  - .gsd/milestones/M009/M009-ROADMAP.md
  - requirements.md
key_decisions:
  - Roadmap communications must be treated as multiple artifact jobs, not one generic update workflow
patterns_established:
  - Product Update is reporting-oriented, Roadmap Update is forward-looking and audience-specific, roadmap decks are business-facing roll-ups, and deck/factsheet refreshes are recurring collateral maintenance
observability_surfaces:
  - M009 context and roadmap docs
  - updated requirement wording
duration: 35m
verification_result: passed
completed_at: 2026-03-15
blocker_discovered: false
---

# T01: Define the roadmap communication artifact taxonomy

**Separated the roadmap communication problem into distinct artifact jobs.**

## What Happened

The milestone docs now explicitly distinguish Monthly Product Update, Roadmap Update, overall roadmap deck, and quarterly Product Deck / Product Factsheet refreshes. This makes the roadmap comms problem tractable and prevents the system from treating these as one generic drafting workflow.

## Verification

- `rg -n "Product Update|Roadmap Update|roadmap deck|Product Deck|Factsheet" .gsd/milestones/M009 requirements.md`

## Diagnostics

Future implementation work should use this taxonomy as the contract for what M009 is actually building.

## Files Created/Modified

- `.gsd/milestones/M009/M009-CONTEXT.md`
- `.gsd/milestones/M009/M009-ROADMAP.md`
- `requirements.md`
