# M009: Roadmap communications and collateral operations — Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

## Project Description

The product already supports multiple artifact types and control-tower context, but new requirements clarified that roadmap communication is a separate recurring operating job. Joydeep needs to produce at least four distinct communication/collateral outputs that should not be conflated:
- Monthly Product Update — periodic reporting on completed movement, risks, and updates across lending verticals and platform areas
- Roadmap Update — forward-looking status and direction for a specific business stakeholder or audience, often narrowed to one vertical such as Gold Loan
- Overall roadmap deck for RFP/business use — a business-facing roll-up of roadmap positioning across verticals and platform areas
- Quarterly Product Deck / Product Factsheet refreshes per vertical — recurring collateral maintenance work, not just one-off drafting

## Why This Milestone

A substantial amount of recurring leadership and business communication work still lives outside a structured workflow. The system should help draft and manage these artifacts using the real vertical-aware format Joydeep already uses, rather than forcing repeated manual repackaging.

## User-Visible Outcome

### When this milestone is complete, the user can:

- distinguish Product Update from Roadmap Update in the system
- draft a roadmap status update for one specific vertical/stakeholder
- draft an overall roadmap deck outline for RFP/business use
- get reminders for quarterly Product Deck / Factsheet refreshes by vertical

### Entry point / environment

- existing artifact generation/template seams in `web/lib/control-tower/artifacts/`
- likely UI surfaces: Control Tower artifact flow, assistant reminders, and/or review/today reminder surfaces
- real reference format: `~/Downloads/Product Documents/Monthly Product Update -- Lending _ January.md`

## Completion Class

- Contract complete means: artifact taxonomy and cadence are explicit and grounded in the real monthly update format
- Integration complete means: at least one roadmap-oriented draft path works end-to-end through existing artifact seams
- Operational complete means: recurring collateral refreshes can surface as reminders instead of being remembered manually

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Product Update and Roadmap Update are treated as different artifact types/workflows
- at least one vertical-specific roadmap draft and one overall roadmap deck draft can be generated from the system
- quarterly collateral refresh work becomes visible through reminders or review surfaces

## Risks and Unknowns

- roadmap data may be less normalized than feature-request data
- the roadmap deck may need a different context shape than current feature-request-centric artifacts
- quarterly reminders need a simple, durable source of truth without introducing excessive config burden

## Existing Codebase / Prior Art

- `web/lib/control-tower/artifacts/types.ts` already includes `monthly_product_update` and `product_roadmap`
- `web/lib/control-tower/artifacts/templates.ts` and config loader support template-driven drafting
- `.config/templates/m2p/monthly-product-update-m2p.yaml`
- `.config/templates/m2p/product-roadmap-m2p.yaml`
- real monthly update format: `~/Downloads/Product Documents/Monthly Product Update -- Lending _ January.md`
- the real monthly update format is grouped by multiple lending verticals and platform areas, including examples such as Personal Loan, Gold Loan, Education Loan, LAS, LAMF, MFI, BNPL / Credit Line, Consumer Durables, Business Loan / SCF, Auto Loan, LAP, Home Loan, LOS, Collections, LMS, Co-Lending, Security / Collateral Management, Auction & Repo, and Legal

## Relevant Requirements

- recurring outputs now explicitly include roadmap status updates, roadmap decks, and quarterly collateral refreshes
- assistant behaviors now explicitly include roadmap drafting and reminder support
- Product Update vs Roadmap Update distinction is a direct requirement

## Scope

### In Scope

- roadmap comms artifact taxonomy
- at least one roadmap-oriented draft workflow
- quarterly deck/factsheet reminder concept and integration
- vertical-aware structure grounded in the real monthly update format

### Out of Scope / Non-Goals

- full PowerPoint export fidelity
- external distribution/send flows beyond existing approval boundaries
- solving every possible roadmap data-source issue in one milestone

## Technical Constraints

- reuse the existing artifact/template system where possible
- keep approval boundaries intact for any outward-facing action
- avoid pretending Product Update and Roadmap Update are the same context object

## Artifact Taxonomy Contract

### Monthly Product Update
- reporting-oriented
- structured by lending verticals and platform areas
- emphasizes completed work, current risks, and upcoming initiatives

### Roadmap Update
- audience-specific and forward-looking
- can be scoped to one vertical or stakeholder context
- should not be treated as the same artifact as a monthly product update

### Overall Roadmap Deck
- business-facing roll-up for RFP or stakeholder conversations
- should summarize roadmap posture across multiple verticals / platform areas
- can start as deck outline content before slide-design automation exists

### Product Deck / Product Factsheet Refresh
- recurring quarterly collateral maintenance
- should be modeled as reminder-driven work first, with drafting/template support later if needed

## Open Questions

- whether roadmap drafts should be generated from feature-request aggregates, dedicated roadmap inputs, or a hybrid
- where quarterly reminders should live first: assistant, today, or review
- whether Product Deck and Product Factsheet need distinct templates immediately or can start as reminder-only assets
