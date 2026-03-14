# M006: Meeting intelligence and follow-up orchestration — Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

## Project Description

This milestone extends the Director-of-Products operating system by making meetings a first-class execution input. The markdown Personal OS now supports meeting workflows conceptually, and the web app now reflects the intervention-first daily model, but meeting notes and transcripts are still not systematically converted into follow-ups, blockers, feature-request updates, and people-context updates.

## Why This Milestone

Meetings are one of the highest-signal inputs in Joydeep’s operating loop: client escalations, PM syncs, engineering grooming, leadership asks, and 1:1s all create decisions, commitments, blockers, and follow-up obligations. Right now that value is only partially captured. The next step is to turn meetings into durable, actionable orchestration artifacts.

## User-Visible Outcome

### When this milestone is complete, the user can:

- convert a meeting note or transcript into tasks, blockers, follow-ups, and durable context updates
- see meeting-derived action items reflected in the system instead of losing them in static notes
- use the app and markdown workspace together to track unresolved commitments from meetings

### Entry point / environment

- Markdown inputs under `Knowledge/Meetings/` and related workflows
- Existing Granola integration path under `core/integrations/granola/`
- Future app surfaces likely include `/assistant`, `/today`, or a dedicated meeting-derived view
- Environment: local markdown workflow first, then browser verification for any app surface introduced in later slices

## Completion Class

- Contract complete means: the repo has a clear, reusable meeting-to-follow-up model and note/update conventions
- Integration complete means: meetings can drive durable updates to tasks, people notes, feature-request notes, or assistant-facing state
- Operational complete means: the system can localize unresolved meeting commitments instead of leaving them buried in notes

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- a meeting note can be transformed into structured follow-up outputs
- those outputs connect to the existing operating model (tasks, people, feature requests, learnings, or app surfaces)
- the resulting workflow is visible and inspectable enough to support real intervention decisions

## Risks and Unknowns

- meeting notes vary widely in quality and structure
- over-automation could create noisy tasks instead of useful follow-up signals
- app integration may be premature if the markdown-side meeting model is not first made crisp and durable

## Existing Codebase / Prior Art

- `examples/workflows/meeting-followup.md` — newly added markdown workflow for post-meeting action extraction
- `core/integrations/granola/README.md` and related skill docs — optional meeting transcript sync path
- `Knowledge/People/`, `Knowledge/Feature-Requests/`, and `Knowledge/Learnings/` scaffolds — now available as durable targets for meeting-derived updates
- `requirements.md` — confirms recurring meeting-driven inputs and outputs in Joydeep’s weekly operating loop

## Relevant Requirements

- R001 — daily intervention quality improves when recent meeting-derived commitments are visible
- R003 — blocker visibility improves when meeting-derived blockers become durable artifacts
- R008 — markdown remains canonical for Personal OS context and orchestration overlays

## Scope

### In Scope

- meeting note / transcript follow-up extraction patterns
- durable markdown targets for meeting-derived outputs
- a truthful path from meeting input to actionable artifacts
- later, a small app-facing surface if the first slices establish a stable meeting model

### Out of Scope / Non-Goals

- autonomous external writeback from meetings without approval
- broad speech/transcription platform work beyond what current integrations can support
- full CRM-style relationship management

## Technical Constraints

- keep markdown canonical for local meeting intelligence unless a later slice needs derived app state
- prefer explicit and inspectable transformations over magical hidden automation
- preserve approval boundaries for any outbound communication or system-of-record writeback

## Open Questions

- should the first meeting milestone stop at markdown/workflow integration, or should it also prove a small app surface immediately
- how much Granola integration should be treated as optional versus core
- what the most valuable first durable targets are: tasks, people notes, feature-request notes, or all three
