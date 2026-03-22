# M010: Strategy knowledge system inside Personal OS

**Vision:** Turn the FY27 product strategy corpus into a durable markdown-first knowledge system inside Personal OS so Joydeep can maintain, review, and reuse strategy context without depending on a browser-local HTML artifact.

## Success Criteria

- Joydeep has a dedicated `Knowledge/Strategy/FY27/` strategy area with durable markdown notes for executive snapshot, lessons learned, win/loss analysis, AOP framing, LOS strategy, and source traceability.
- A single operating brief exists that summarizes the strategy corpus for daily and leadership workflows and links to deeper notes.
- The Personal OS strategy knowledge is clearly more maintainable and trustworthy than the original browser-local HTML snapshot because it lives as versionable markdown in the workspace.

## Key Risks / Unknowns

- Source condensation fidelity — overlapping HTML, PDF, and workbook narratives could be flattened incorrectly and lose important distinctions.
- Knowledge-system usefulness — if the notes mirror a presentation deck too closely, they will not serve daily operating workflows well.

## Proof Strategy

- Source condensation fidelity → retire in S01 by proving the source corpus can be mapped into a coherent markdown information architecture with explicit note roles and source boundaries.
- Knowledge-system usefulness → retire in S02 by proving the core executive, lessons, win/loss, AOP, and LOS notes read as durable operating knowledge rather than static slide prose.
- End-to-end strategy usability → retire in S03 by proving a leadership-ready operating brief and source index make the corpus discoverable and maintainable from Personal OS.

## Verification Classes

- Contract verification: filesystem checks for expected strategy note set and internal structure review
- Integration verification: source-to-note synthesis checks against the HTML, PDFs, and workbook-derived findings
- Operational verification: discoverability and internal-link review for the final `Knowledge/Strategy/FY27/` corpus
- UAT / human verification: read-through of the operating brief and linked notes for leadership usefulness

## Milestone Definition of Done

This milestone is complete only when all are true:

- a durable FY27 strategy knowledge area exists under Personal OS with the planned note set
- the notes synthesize the real source corpus into current-state operating knowledge instead of raw copied source text
- one operating brief provides a practical top-level strategy summary with links to deeper notes and source evidence
- source traceability is captured well enough that a future agent can refresh or extend the corpus without re-discovering everything from scratch
- the final note set is reviewed against the original HTML/browser-local limitation and clearly removes that dependency for ongoing use

## Requirement Coverage

- Covers: R008
- Partially covers: R001, R003
- Leaves for later: live dashboard regeneration from markdown, automated source refresh pipelines
- Orphan risks: none

## Slices

- [x] **S01: FY27 strategy information architecture and source mapping** `risk:high` `depends:[]`
  > After this: the Personal OS has a planned FY27 strategy knowledge structure with note roles grounded in the HTML and Product Strategy source corpus.
- [x] **S02: Core strategy note synthesis** `risk:medium` `depends:[S01]`
  > After this: the core FY27 strategy notes exist as durable markdown covering executive snapshot, lessons learned, win/loss analysis, AOP framing, and LOS strategy.
- [x] **S03: Operating brief and source index** `risk:low` `depends:[S01,S02]`
  > After this: Joydeep can open one operating brief for the whole strategy corpus and navigate to deeper notes and source evidence from Personal OS.

## Boundary Map

### S01 → S02

Produces:
- `Knowledge/Strategy/FY27/` directory and agreed note inventory
- source-to-note mapping captured in planning artifacts
- normalized note responsibilities so downstream drafting avoids duplication

Consumes:
- nothing (first slice)

### S01 → S03

Produces:
- stable note names and roles for deep strategy notes
- expected source-traceability pattern for the final corpus

Consumes:
- nothing (first slice)
