# M009: Roadmap communications and collateral operations

**Vision:** Make roadmap communication a first-class drafting and reminder workflow, distinct from Product Updates and grounded in Joydeep’s real vertical-aware update format.

## Success Criteria

- Product Update and Roadmap Update are explicitly separated in system behavior and planning language.
- Joydeep can draft a roadmap update for a specific vertical/stakeholder.
- Joydeep can draft an overall roadmap deck outline for RFP/business use.
- Quarterly Product Deck / Factsheet refreshes surface as reminders instead of memory work.

## Key Risks / Unknowns

- Roadmap communication may require context that is not fully captured in feature-request data.
- Reminder workflows may need a lightweight collateral inventory model.
- The system should not overfit to one month’s update while still using the real format as grounding.

## Proof Strategy

- roadmap artifact taxonomy can be defined clearly → retire in S01 by separating Product Update vs Roadmap Update vs collateral refresh workflows
- roadmap drafting can reuse artifact seams → retire in S02 by proving at least one vertical-specific roadmap draft and one overall roadmap deck outline
- recurring collateral maintenance can be surfaced → retire in S03 by proving quarterly reminder visibility for Product Deck/Factsheet refreshes

## Verification Classes

- Contract verification: template/artifact taxonomy and real-format alignment
- Integration verification: artifact generation path for roadmap-oriented outputs
- Operational verification: reminder visibility for recurring collateral work
- UAT / human verification: walkthrough of one vertical roadmap update and one deck/reminder flow

## Milestone Definition of Done

This milestone is complete only when all are true:

- roadmap communication is treated as a distinct workflow from Product Updates
- the system can draft roadmap-oriented outputs using existing artifact seams
- quarterly collateral refresh work becomes visible through reminders or review surfaces

## Requirement Coverage

- Covers: roadmap status updates, roadmap decks for RFP/business use, quarterly Product Deck/Factsheet refresh reminders
- Leaves for later: polished slide export or final presentation design automation
- Orphan risks: none

## Slices

- [x] **S01: Roadmap artifact taxonomy and format grounding** `risk:low` `depends:[]`
  > After this: the repo treats Product Update, Roadmap Update, roadmap deck, and quarterly collateral refresh as distinct jobs with grounded structure.
- [x] **S02: Roadmap drafting through artifact workflows** `risk:medium` `depends:[S01]`
  > After this: at least one vertical roadmap update and one overall roadmap deck outline can be drafted through the existing artifact system.
- [x] **S03: Quarterly collateral reminders** `risk:medium` `depends:[S01,S02]`
  > After this: Product Deck / Factsheet refresh work for each vertical becomes visible through reminders instead of memory.
