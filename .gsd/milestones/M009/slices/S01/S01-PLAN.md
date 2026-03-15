# S01: Roadmap artifact taxonomy and format grounding

**Goal:** Make roadmap communication explicit in the repo by separating Product Update, Roadmap Update, roadmap deck, and quarterly collateral refresh workflows using the real monthly update format as grounding.
**Demo:** The repo contains a clear artifact taxonomy/runbook/template alignment for roadmap communications, and a future agent can tell the difference between a monthly product update, a stakeholder-specific roadmap update, an RFP roadmap deck, and quarterly collateral refresh work.

## Must-Haves

- Explicitly separate Product Update and Roadmap Update in docs/planning language.
- Ground the structure in the real monthly update format and its vertical/platform grouping.
- Define where roadmap deck and collateral refresh work fit in the product model.
- Keep the output truthful: this slice proves taxonomy/contract, not full UI execution yet.

## Proof Level

- This slice proves: contract
- Real runtime required: no
- Human/UAT required: no

## Verification

- `rg -n "Product Update|Roadmap Update|roadmap deck|Product Deck|Factsheet|quarterly" requirements.md .gsd/milestones/M009 docs .config/templates/m2p`
- `git diff -- requirements.md .gsd/milestones/M009 docs .config/templates/m2p | sed -n '1,260p'`

## Observability / Diagnostics

- Runtime signals: none
- Inspection surfaces: milestone docs, requirements, and relevant M2P template references
- Failure visibility: artifact confusion remains visible directly in the wording if taxonomy is not separated clearly
- Redaction constraints: do not copy large private document content verbatim; abstract the structure truthfully

## Integration Closure

- Upstream surfaces consumed: updated `requirements.md`, real monthly update format in Downloads, existing artifact types/templates
- New wiring introduced in this slice: explicit roadmap comms taxonomy and format grounding
- What remains before the milestone is truly usable end-to-end: drafting and reminders in S02/S03

## Tasks

- [x] **T01: Define the roadmap communication artifact taxonomy** `est:35m`
  - Why: The new requirements now distinguish Product Update, Roadmap Update, roadmap deck, and quarterly collateral refresh, but the repo does not yet encode that distinction cleanly.
  - Files: `.gsd/milestones/M009/M009-CONTEXT.md`, `.gsd/milestones/M009/M009-ROADMAP.md`, `requirements.md`
  - Do: Make the artifact taxonomy explicit and connect each artifact type to its real operating purpose.
  - Verify: `rg -n "Product Update|Roadmap Update|roadmap deck|Product Deck|Factsheet" .gsd/milestones/M009 requirements.md`
  - Done when: A future agent can tell the four roadmap/collateral jobs apart without inference.

- [x] **T02: Ground the taxonomy in the actual monthly update structure** `est:40m`
  - Why: The system should be shaped around the real format Joydeep already uses, not a generic product-update model.
  - Files: `.gsd/milestones/M009/M009-CONTEXT.md`, `.gsd/milestones/M009/slices/S01/S01-PLAN.md`
  - Do: Capture the relevant vertical/product-area grouping from the real monthly product update format and state how roadmap comms should reuse that structure.
  - Verify: `rg -n "Gold Loan|LAMF|BNPL|LOS|Collections|Co-Lending|Legal" .gsd/milestones/M009`
  - Done when: The roadmap comms plan clearly reflects the real vertical-aware update structure.

- [x] **T03: Clarify how templates and reminders fit the roadmap comms model** `est:30m`
  - Why: Drafts and reminders are the next milestone slices, so the taxonomy should already say where they belong.
  - Files: `.gsd/milestones/M009/M009-CONTEXT.md`, `.gsd/milestones/M009/M009-ROADMAP.md`, `build-plan.md`
  - Do: Document how roadmap drafting should reuse artifact templates and how quarterly collateral refreshes should surface as reminder workflows.
  - Verify: `rg -n "template|reminder|quarterly|artifact" .gsd/milestones/M009 build-plan.md`
  - Done when: The next slices have a clear contract for drafting vs reminder work.

## Files Likely Touched

- `.gsd/milestones/M009/M009-CONTEXT.md`
- `.gsd/milestones/M009/M009-ROADMAP.md`
- `.gsd/milestones/M009/slices/S01/S01-PLAN.md`
