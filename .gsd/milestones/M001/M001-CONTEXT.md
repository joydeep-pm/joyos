# M001: Decision and review operating system — Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

## Project Description

This milestone turns the existing Product Control Tower from a visibility-and-drafting layer into a working decision-and-review operating system. It builds on the current feature-request model, Jira/Confluence synthesis, intervention views, and artifact drafting capabilities to support grooming readiness, prioritization preparation, and durable review outcomes.

## Why This Milestone

The current product already surfaces what is happening and can draft artifacts from context, but Joydeep’s real operating loop also requires deciding what is ready, what is blocked, what needs intervention, and what should move into grooming or be held back. This milestone exists to reduce time spent chasing readiness and translating signals into decisions before biweekly engineering grooming and recurring leadership review cycles.

## User-Visible Outcome

### When this milestone is complete, the user can:

- open the control tower and review a feature request’s readiness, blockers, missing inputs, and prioritization posture before grooming
- record review outcomes and next actions so intervention work becomes durable and actionable instead of remaining a passive dashboard

### Entry point / environment

- Entry point: local Next.js web app in `web/`
- Environment: local dev and browser
- Live dependencies involved: existing Jira and Confluence sync surfaces, local cache, existing control tower UI

## Completion Class

- Contract complete means: grooming readiness states, review outcomes, and decision-tracking surfaces exist with substantive implementation and are wired into the feature-request workflow
- Integration complete means: a real feature request can move through intervention review, readiness assessment, and artifact-follow-up preparation inside the assembled app
- Operational complete means: the review system preserves approval-gated behavior and produces durable next-step visibility for follow-up work

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Joydeep can open a real feature request and determine whether it is ready for grooming, what is missing, and what action should happen next
- Joydeep can record a review decision and see it reflected in intervention and review workflows without breaking the feature-request-centric model
- the assembled app supports a realistic pre-grooming flow that combines synthesized context, review outcome, and draft-generation support in one operational loop

## Risks and Unknowns

- Readiness logic may become too generic or shallow — if the rubric is weak, the review surface will not reduce decision effort
- Existing V1 data structures may not yet carry enough fields for decision tracking — schema drift could force reshaping cache and UI contracts
- Review workflows may overlap awkwardly with existing intervention and artifact flows — poor integration would create duplication instead of a stronger operating loop

## Existing Codebase / Prior Art

- `requirements.md` — full product discovery and source requirements context
- `build-plan.md` — prior recommended workstreams and control tower build order
- `docs/architecture.md` — architecture and systems-of-record model
- `docs/decisions/0001-product-control-tower.md` — accepted product framing decision
- `SLICE3_COMPLETE.md` — evidence that the feature request, intervention, and artifact drafting base already exists

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R001 — advances the intervention brief from scan-only to action-ready operations
- R002 — deepens the feature-request workspace with decision and review state
- R003 — adds stronger blocker and slip visibility in a grooming-ready context
- R004 — ties drafting more directly to review outcomes and missing-context handling
- R005 — directly implements grooming readiness and prioritization support
- R006 — directly implements explicit decision tracking for director review
- R007 — preserves approval-gated behavior for any outward action
- R008 — continues the overlay model above Jira and Confluence rather than replacing them

## Scope

### In Scope

- grooming readiness model and review rubric for feature requests
- review workflow surfaces for pre-grooming and prioritization preparation
- decision capture and next-action tracking at the feature-request level
- integration of review outcomes with existing intervention and artifact flows

### Out of Scope / Non-Goals

- PM people-management workflows such as 1:1s, coaching, and IDP systems
- broad autonomous writeback into Jira, Confluence, or communication channels
- deep Teams integration or chat-native ingestion

## Technical Constraints

- preserve the existing feature-request-centric model rather than falling back to generic tasks
- maintain approval-gated behavior for anything that implies commitment, writeback, or communication
- work with the current local-first cache and Next.js app structure instead of introducing a separate backend platform

## Integration Points

- Jira-derived execution state — source for issue status, ownership, and delivery signals
- Confluence-derived documentation context — source for requirement and artifact references
- local cache under `.cache/` — synthesized state used by the control tower
- existing intervention and artifact UI — the new review system must integrate cleanly with current flows

## Open Questions

- which exact readiness dimensions are already present in the current feature-request model versus needing new derived fields — likely answered during slice research and planning
- how review decisions should be persisted and surfaced without creating duplicate truth with Jira or Confluence — likely via private orchestration metadata
