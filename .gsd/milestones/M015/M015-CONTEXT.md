# M015: Real Strategy Command Center in the frontend — Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

## Project Description

This milestone rebuilds the useful operational model of the original HTML command center inside the frontend app. The goal is not just to read markdown strategy notes, but to provide a real strategy cockpit with roadmap item visibility, product deep-dives, AOP framing, risks/hiring visibility, and a clear place to inspect and update roadmap status.

## Why This Milestone

The current `/strategy` route is a useful reading and document-generation surface, but it does not yet answer the user's core operational questions. The user still cannot clearly see roadmap item status, product deep-dives, or where roadmap status should be updated. The original HTML remained more effective for understanding the overall picture. This milestone corrects that by building a structured Strategy Command Center UI in the web app.

## User-Visible Outcome

### When this milestone is complete, the user can:

- open `/strategy` and see a real command-center view with roadmap sections, product deep-divives, AOP planning, and risks/hiring in one place
- inspect roadmap items by quarter and product category with status visibility
- update roadmap item status from the frontend
- understand the overall picture from the UI without needing the standalone HTML

### Entry point / environment

- Entry point: `/strategy`
- Environment: local browser / Next.js web app
- Live dependencies involved: local markdown/source files only

## Completion Class

- Contract complete means: structured strategy data exists for roadmap items, deep-dives, and risk/AOP panels, and the `/strategy` route renders these sections
- Integration complete means: the strategy UI combines the durable strategy corpus with structured command-center data and supports real status inspection/update behavior
- Operational complete means: the frontend is meaningfully closer to the HTML’s usefulness, especially for roadmap status and deep-dive understanding

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- roadmap items are visible by quarter/category with status in the frontend
- product deep-dives are visible as a dedicated UI surface
- AOP and risks/hiring sections are present and understandable in the frontend
- at least one roadmap status update flow works from the UI
- `/strategy` becomes a credible replacement for the HTML as the main interactive command center

## Risks and Unknowns

- Data-model mismatch risk — long-form markdown notes are not sufficient for the full command-center UI, so structured strategy data must be introduced carefully
- Scope creep risk — the HTML contains a wide surface area, so the frontend reconstruction must prioritize the most operationally valuable sections first

## Existing Codebase / Prior Art

- `/Users/joy/Downloads/online_viewer_net.html` — original useful command-center reference
- `web/app/strategy/page.tsx` — current partial strategy UI
- `web/lib/strategy.ts` — current strategy workspace reader
- `Knowledge/Strategy/FY27/` — durable narrative strategy corpus

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution when a meaningful decision is made.

## Relevant Requirements

- R001 — improves intervention quality by making the strategy cockpit usable from the frontend
- R003 — improves visibility into risks, drift, and status at the strategy/roadmap layer
- R008 — keeps Personal OS as the source of truth while making the web UI the primary interaction surface

## Scope

### In Scope

- create a structured strategy command-center data model for roadmap/deep-dive/risk surfaces
- add roadmap, deep-dives, AOP, and risks/hiring sections to `/strategy`
- support roadmap item status visibility and at least one status update workflow from UI

### Out of Scope / Non-Goals

- full 1:1 recreation of every visual effect from the original HTML
- external system writeback
- polished export/slide generation

## Technical Constraints

- keep the durable strategy system local-first
- use the HTML as reference, not as runtime source of truth
- prioritize operational usefulness over cosmetic parity

## Integration Points

- `web/app/strategy/page.tsx`
- `web/lib/strategy.ts`
- new structured strategy data module(s)
- `Knowledge/Strategy/FY27/` for narrative context

## Open Questions

- Should roadmap status be persisted into markdown immediately or kept in local app state first? — current thinking: use a local persisted file/store similar to existing task/review patterns so the UI can be operational quickly
