# M007: Meeting-derived action drafts — Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

## Project Description

M006 made meetings actionable in three layers: a markdown contract, rebuildable continuity integration, and a visible review surface in `/assistant`. The next step is to convert that visibility into low-friction action while preserving the local-first, markdown-canonical, approval-conscious architecture.

## Why This Milestone

A visible review panel is useful, but Joydeep still has to manually translate unresolved meeting commitments into the next durable artifact. The highest-leverage next step is to let the assistant review surface draft the next local artifact safely: usually a task, and later potentially a feature-request or people-note handoff.

## User-Visible Outcome

### When this milestone is complete, the user can:

- take an unresolved meeting item in `/assistant`
- draft a concrete next action from it without retyping context
- keep the output local-first and inspectable
- preserve review-first behavior for higher-risk or outward actions

### Entry point / environment

- Primary entry: `/assistant` meeting continuity review panel
- Supporting local APIs: `/api/tasks`, local note/task stores, assistant context rebuild flow
- Environment: local-only runtime and UI tests first

## Completion Class

- Contract complete means: meeting review actions have explicit draft-safe behavior and clear output targets
- Integration complete means: a visible meeting item can produce at least one durable local artifact safely
- Operational complete means: the user can inspect that drafted artifact and see the meeting review panel reflect the change after rebuild

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- unresolved meeting commitments can trigger safe local draft actions
- those actions create or prepare durable local artifacts without bypassing review boundaries
- the assistant review loop remains inspectable before and after the action

## Risks and Unknowns

- too many action buttons could create UI noise
- over-eager automation could produce low-quality tasks
- feature-request / people-note mutation may need stronger conventions before direct drafting is safe

## Existing Codebase / Prior Art

- `web/app/assistant/page.tsx` — current meeting continuity review surface
- `web/app/api/tasks/route.ts` — local task creation path
- `web/lib/file-store.ts` — markdown task persistence
- `docs/architecture.md` — local-first and approval-boundary rules
- M003 approval-envelope patterns — useful precedent for explicit action handling, though not necessarily required for purely local drafts

## Relevant Requirements

- R001 — daily intervention quality improves when the assistant can turn review into action quickly
- R003 — blocker visibility improves further when blocked meeting commitments can become tracked work
- R008 — markdown remains canonical and derived state remains rebuildable

## Scope

### In Scope

- local draft-safe actions from the meeting continuity review panel
- task-draft or task-creation path as the first concrete action family
- explicit UI feedback and context rebuild after action
- tests proving end-to-end local flow

### Out of Scope / Non-Goals

- external writeback
- automatic Teams/Jira/Confluence mutation from meeting review
- broad workflow automation across all note types in one go

## Technical Constraints

- keep markdown canonical
- prefer reversible local actions first
- avoid hidden automation; the user should understand what action happened
- use existing task routes and stores where possible

## Open Questions

- should the first action be direct local task creation or a draft-preview step in the UI
- whether feature-request or people-note handoff should be part of M007 or deferred until explicit note templates are stronger
- whether action history for meeting review items needs a local audit seam immediately or can come later
