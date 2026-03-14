# M004: Expanded orchestration and intelligence

**Vision:** Extend the current control tower into a more continuous orchestration layer by deepening signal capture, assembling cross-surface continuity state, and proving at least one richer browser-visible workflow that helps Joydeep coordinate interventions with better context and less manual stitching.

## Success Criteria

- Joydeep can inspect richer operating signals that improve blocker and escalation visibility beyond the current Jira/Confluence-only read pattern.
- The product exposes at least one assembled continuity view or workflow that connects intervention, people, and automation state without relying on mock-only or UI-local joins.
- A browser-visible orchestration flow helps Joydeep decide and act on next steps with stronger context while still preserving approval and systems-of-record boundaries.

## Key Risks / Unknowns

- Cross-channel ingestion can produce noisy or weakly structured signals that do not fit the feature-request-centric model cleanly.
- Continuity across intervention, people, and assistant surfaces may drift into duplicated or UI-local state if there is no shared assembly seam.
- Orchestration work can regress into a vague dashboard unless each slice proves a concrete workflow with decision value.

## Proof Strategy

- cross-channel or richer signal capture is operationally useful → retire in S01 by proving one normalized signal seam adds inspectable execution visibility without breaking the current model
- cross-surface continuity can be assembled safely → retire in S02 by proving one shared continuity contract powers a live workflow across existing surfaces
- the assembled orchestration experience provides real browser value → retire in S03 by proving a user can use the running app to inspect and act on a richer orchestration workflow end to end

## Verification Classes

- Contract verification: targeted tests for new orchestration state, normalization logic, assembly contracts, and route diagnostics
- Integration verification: real assembled reads across existing control-tower, people, and assistant subsystems
- Operational verification: continuity state and new signals remain inspectable and stable under live runtime refresh
- UAT / human verification: browser validation that the orchestration workflow is clearer and more actionable than the prior disconnected surfaces

## Milestone Definition of Done

This milestone is complete only when all are true:

- all slices ship substantive working code for richer signal capture, continuity assembly, and one real orchestration workflow
- shared continuity or intelligence state is actually wired into live assembled surfaces rather than isolated mocks
- the real browser entrypoint exists and is exercised end to end
- success criteria are re-checked against live behavior, not just tests or fixtures
- final integrated acceptance scenarios pass while preserving approval and systems-of-record boundaries

## Requirement Coverage

- Covers: R001, R003, R203
- Partially covers: none
- Leaves for later: none
- Orphan risks: none

## Slices

- [x] **S01: Director-of-products role scaffolding and workflow uplift** `risk:medium` `depends:[]`
  > After this: the markdown Personal OS has a coherent Director-of-Products operating contract, intervention-first workflows, and continuity scaffolds that future setup or app work can build on.
- [x] **S02: Role-aware setup and template alignment** `risk:medium` `depends:[S01]`
  > After this: new workspaces and reusable templates scaffold the Director-of-Products operating model instead of the old generic task-management defaults.
- [x] **S03: Minimal markdown runtime proof** `risk:low` `depends:[S01,S02]`
  > After this: the markdown/setup path is closed with automatic role-specific Knowledge scaffolding and a truthful post-setup verification runbook.

## Boundary Map

### S01 → S02

Produces:
- normalized richer-signal contract with explicit types, diagnostics, and at least one stable assembled read surface

Consumes:
- nothing (first slice)

### S01 → S03

Produces:
- inspectable signal state and normalization outputs that a live browser workflow can render truthfully

Consumes:
- nothing (first slice)

### S02 → S03

Produces:
- shared continuity contract joining at least two existing product surfaces through server-authored assembly

Consumes:
- normalized richer-signal contract from S01
