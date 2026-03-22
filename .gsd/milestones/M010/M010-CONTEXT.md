# M010: Strategy knowledge system inside Personal OS — Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

## Project Description

This milestone brings the FY27 product strategy corpus into the Personal OS as a durable markdown-first knowledge system instead of leaving it trapped inside a local HTML artifact with browser-local state. The work will synthesize the existing command-center HTML plus the Product Strategy source documents into structured strategy notes, an operating brief, and a source index that can be maintained as part of Joydeep’s local-first operating system.

## Why This Milestone

The current HTML command center is useful as a presentation artifact but it is not a trustworthy operating system source of truth. Its updates are local to a browser and machine, hard to version, and hard to refresh from the real source documents. Joydeep explicitly wants this content under Personal OS so strategy, lessons learned, win/loss intelligence, AOP framing, and LOS strategy can be updated durably and reused across planning, leadership updates, and interventions.

## User-Visible Outcome

### When this milestone is complete, the user can:

- open a dedicated FY27 strategy area inside Personal OS and read durable markdown notes for executive snapshot, lessons learned, win/loss analysis, AOP framing, LOS strategy, and source traceability
- use one high-signal operating brief as the canonical strategy summary for daily and leadership workflows instead of consulting a browser-local HTML snapshot

### Entry point / environment

- Entry point: markdown files under `Knowledge/Strategy/FY27/`
- Environment: local workspace / markdown-first Personal OS
- Live dependencies involved: none

## Completion Class

- Contract complete means: the expected FY27 strategy note set exists in the repo with grounded structure, source references, and coherent sectioning
- Integration complete means: the strategy notes faithfully synthesize the HTML artifact and downloaded source documents into a usable Personal OS knowledge surface
- Operational complete means: the strategy corpus is discoverable, internally linked, and usable as the durable source of truth for future operating workflows without relying on browser-local state

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- the FY27 strategy source materials have been converted into a clear markdown knowledge set under Personal OS with explicit file roles
- one operating brief gives Joydeep a practical leadership-ready summary that links to deeper notes and source evidence
- the strategy knowledge can be maintained from files in the repo/workspace rather than depending on localStorage-backed browser state

## Risks and Unknowns

- Source condensation fidelity — the PDFs, workbook, and HTML contain overlapping but not identical framing, so the markdown synthesis must preserve the important distinctions without becoming a copy dump
- Knowledge shape drift — if the note structure is too presentation-specific, it will not remain useful as an operating system knowledge layer

## Existing Codebase / Prior Art

- `/Users/joy/Downloads/online_viewer_net.html` — current browser-local command-center artifact containing an execution-focused FY27 strategy presentation
- `/Users/joy/Downloads/Product Strategy/` — source PDFs and workbook with AOP, strategy report, roadmap, loss intelligence, parity, and LOS strategy inputs
- `Knowledge/` — canonical durable knowledge area inside Personal OS
- `.gsd/PROJECT.md` — establishes Personal OS as the orchestration overlay rather than a presentation-only system

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution when a meaningful decision is made.

## Relevant Requirements

- R008 — advances the systems-of-record overlay model by making Personal OS the durable strategy synthesis layer instead of a browser-local artifact
- R001 — improves the quality of future daily intervention guidance by making strategy and business context durable and queryable in the workspace
- R003 — improves blocker/risk visibility by preserving loss themes, dependency themes, and AOP concentration in reusable strategy notes

## Scope

### In Scope

- create a dedicated FY27 strategy knowledge area under `Knowledge/Strategy/FY27/`
- synthesize the HTML and source documents into durable markdown notes with clear roles
- create a leadership-ready operating brief and a source index for traceability

### Out of Scope / Non-Goals

- rebuilding the HTML dashboard as a live app
- automated PDF/XLSX ingestion pipelines
- polished slide export or presentation design automation

## Technical Constraints

- Stay markdown-first and local-first inside Personal OS
- Use the downloaded HTML/PDF/XLSX artifacts as source material, but do not make them the durable source of truth
- Preserve traceability to source files where practical

## Integration Points

- `Knowledge/` — receives the durable strategy notes
- `/Users/joy/Downloads/online_viewer_net.html` — source presentation artifact to mine for existing synthesis
- `/Users/joy/Downloads/Product Strategy/` — source evidence library for FY27 strategy, AOP, and LOS material

## Open Questions

- How much of the HTML’s execution framing should be mirrored verbatim versus normalized into the Personal OS note structure? — current thinking: keep the underlying business truths, but reshape them into operating notes rather than dashboard sections
