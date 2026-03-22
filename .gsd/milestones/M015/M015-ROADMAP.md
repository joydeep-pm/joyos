# M015: Real Strategy Command Center in the frontend

**Vision:** Turn `/strategy` into the main interactive strategy cockpit by rebuilding the most useful operational parts of the original HTML: roadmap status, product deep-dives, AOP framing, risks/hiring, and structured whole-picture visibility.

## Success Criteria

- `/strategy` shows a structured roadmap by quarter/category with visible item status.
- `/strategy` includes a dedicated product deep-dive surface and clear AOP/risk/hiring sections.
- The user can update roadmap item status from the frontend.
- The resulting UI is meaningfully closer to the HTML’s usefulness for understanding and managing the overall strategy picture.

## Key Risks / Unknowns

- Data-model mismatch risk — command-center behavior requires structured data beyond the current markdown summaries.
- Scope creep risk — the HTML’s surface area is broad, so early slices must focus on the most operationally valuable parts.

## Proof Strategy

- Data-model mismatch risk → retire in S01 by introducing a structured strategy command-center model for roadmap items, deep-dives, and panel data.
- Frontend usefulness risk → retire in S02 by rendering roadmap, deep-dive, AOP, and risks/hiring sections from that model in `/strategy`.
- Operational credibility risk → retire in S03 by proving at least one roadmap status update flow works from the UI and by browser-verifying the assembled experience.

## Verification Classes

- Contract verification: structured strategy data module and typecheck
- Integration verification: `/strategy` renders structured roadmap, deep-dives, AOP, and risks/hiring sections from real local source data
- Operational verification: roadmap status can be updated from UI and persists through the chosen local store
- UAT / human verification: browser walkthrough confirms `/strategy` is now a credible replacement for the HTML for day-to-day use

## Milestone Definition of Done

This milestone is complete only when all are true:

- a structured strategy command-center model exists and is wired into `/strategy`
- roadmap status is visible in a real command-center section and can be updated from the UI
- product deep-dives and AOP/risks sections are present and usable
- browser verification confirms the assembled `/strategy` route is materially closer to the original HTML's operational usefulness

## Requirement Coverage

- Covers: R008
- Partially covers: R001, R003
- Leaves for later: richer export tooling, full polished visual parity with the original HTML
- Orphan risks: none

## Slices

- [ ] **S01: Structured strategy command-center data model** `risk:high` `depends:[]`
  > After this: roadmap items, deep-dives, AOP panels, and risk/hiring content have a structured frontend data model.
- [ ] **S02: Command-center UI sections in /strategy** `risk:medium` `depends:[S01]`
  > After this: `/strategy` renders roadmap, deep-divives, AOP, and risks/hiring sections with whole-picture visibility.
- [ ] **S03: Roadmap status update flow and browser proof** `risk:medium` `depends:[S01,S02]`
  > After this: roadmap status can be updated from the UI and browser verification proves `/strategy` is operationally useful.

## Boundary Map

### S01 → S02

Produces:
- structured roadmap item model
- structured deep-dive model
- structured AOP/risk/hiring data surfaces
- stable read interfaces for `/strategy`

Consumes:
- nothing (first slice)

### S01 → S03

Produces:
- roadmap item identifiers and status model
- persistence seam for roadmap status updates

Consumes:
- nothing (first slice)
