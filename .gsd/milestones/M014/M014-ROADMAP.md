# M014: Monthly strategy review workflow and status-output index

**Vision:** Add a slower monthly review ritual and a single shareable-output entrypoint so the FY27 strategy system is easier to maintain and easier to use for communication.

## Success Criteria

- A monthly strategy review workflow exists and is clearly distinct from the weekly strategy review.
- A status-output index exists and links the current shareable status note, dated updates, and stakeholder-facing templates.
- The monthly workflow and index together make the strategy communication layer easier to operate.

## Key Risks / Unknowns

- Workflow redundancy risk — the monthly review may feel too similar to the weekly review if not scoped to larger shifts and decisions.
- Index bloat risk — the index could become a directory dump instead of a usable communication entrypoint.

## Proof Strategy

- Workflow redundancy risk → retire in S01 by defining monthly-specific questions and outputs that differ from the weekly review.
- Index bloat risk → retire in S02 by creating a concise, role-based index structure instead of a raw file list.
- Operational usefulness → retire in S03 by verifying both artifacts work together as cadence + discoverability improvements.

## Verification Classes

- Contract verification: file existence and structure review for the new workflow and index
- Integration verification: explicit links to existing strategy notes and templates
- Operational verification: read-through for monthly usefulness and fast output discovery
- UAT / human verification: assess whether the artifacts would be used in real monthly strategy and stakeholder preparation work

## Milestone Definition of Done

This milestone is complete only when all are true:

- the monthly strategy review workflow exists and addresses larger monthly changes, not weekly churn
- the status-output index exists and serves as a practical communication entrypoint
- both artifacts are linked clearly to the FY27 strategy and stakeholder output system
- the milestone improves maintainability and communication discovery without adding unnecessary complexity

## Requirement Coverage

- Covers: R008
- Partially covers: R001, R003
- Leaves for later: reminder automation and export workflows
- Orphan risks: none

## Slices

- [x] **S01: Monthly strategy review design** `risk:high` `depends:[]`
  > After this: the monthly review is scoped clearly around bigger strategy shifts, decisions, and communication readiness.
- [x] **S02: Create monthly review workflow and output index** `risk:medium` `depends:[S01]`
  > After this: a monthly strategy review workflow and a concise shareable-output index both exist.
- [x] **S03: Review and operationalize cadence + index** `risk:low` `depends:[S01,S02]`
  > After this: the monthly workflow and status-output index read as practical additions to the FY27 strategy system.

## Boundary Map

### S01 → S02

Produces:
- monthly review scope and differentiators
- index role and structure
- expected monthly outputs

Consumes:
- nothing (first slice)

### S01 → S03

Produces:
- criteria for what belongs in the index
- cadence expectations for monthly strategy refresh

Consumes:
- nothing (first slice)
