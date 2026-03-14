# T01: Define the meeting continuity data model and derivation rules

## Why

S01 made the meeting workflow explicit, but the repo still lacks a durable structured object for unresolved meeting commitments. Without that, meetings remain hard to inspect downstream and cannot reliably feed the operating graph.

## Scope

Define the smallest useful set of types and rules for meeting-derived continuity signals.

## In Scope

- meeting-derived commitment type(s)
- routing targets for tasks, feature requests, people notes, learnings, and leadership inputs
- ambiguity / unresolved state flags
- linked source meeting path and linked artifact references

## Out of Scope

- visible app UI
- writeback or automatic task creation
- external integrations beyond existing local meeting markdown

## Files

- `web/lib/types.ts`
- `web/lib/assistant/context-engine.ts`
- `docs/runbooks/meeting-followup-runbook.md`

## Plan

- [ ] Review current assistant context shape and add minimal meeting continuity types.
- [ ] Define derivation rules that map meeting markdown evidence into structured commitments and routing targets.
- [ ] Update the runbook if the new model needs sharper wording for future agents.

## Verification

- `rg -n "MeetingContinuity|meeting commitment|routingTargets|ambiguity" web/lib/types.ts web/lib/assistant/context-engine.ts docs/runbooks/meeting-followup-runbook.md`

## Done When

- The repo has a clear, rebuildable structured model for meeting continuity signals.
