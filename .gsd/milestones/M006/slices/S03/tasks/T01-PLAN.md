# T01: Design the meeting continuity review presentation

## Why

S02 exposed meeting continuity in assistant context, but without a focused presentation it still behaves like hidden plumbing. This task defines how unresolved meeting commitments should be shown for quick director review.

## Scope

Shape the review presentation for `/assistant` using the existing context data.

## In Scope

- section title and purpose
- presentation of open commitments, blockers, ambiguity, and routing targets
- empty-state behavior
- concise intervention-first wording

## Out of Scope

- new API routes
- new page creation
- mutation actions or writeback

## Files

- `web/app/assistant/page.tsx`
- `web/lib/intervention-presenters.ts`

## Plan

- [ ] Review current assistant layout and choose the right insertion point.
- [ ] Define presenter-level wording for meeting continuity items if the page needs a shared formatting seam.
- [ ] Keep the panel concise and intervention-oriented rather than note-dump oriented.

## Verification

- `rg -n "Meeting continuity review|routingTargets|ambiguity" web/app/assistant/page.tsx web/lib/intervention-presenters.ts`

## Done When

- The repo has a clear visible presentation strategy for unresolved meeting commitments on `/assistant`.
