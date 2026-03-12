# M003: Approval-governed automation — Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

## Project Description

This milestone extends the current control tower from approval-safe drafting into approval-governed automation. It should package draftable actions into explicit approval envelopes, preserve an auditable trail of what was proposed and approved, and prepare safe writeback-capable flows for Jira, Confluence, and communication channels without crossing the user’s trust boundary.

## Why This Milestone

The current product already proves the two key prerequisites. M001 established durable overlays, assembled workflow reads, stable route diagnostics, and a real approval-gated comms draft path for feature-request follow-ups. M002 reused the same architecture for people-management notes and server-backed drafts. The next value gap is not more drafting — it is making reviewed actions safely executable after approval, with auditable state transitions and enough observability that a future agent can see what is pending, approved, denied, or blocked.

## User-Visible Outcome

### When this milestone is complete, the user can:

- review a concrete approval envelope for a proposed action, see what will happen if approved, and inspect the underlying evidence before execution
- approve or deny specific writeback-capable actions and keep an auditable record of proposal, approval, denial, and execution state without silent side effects

### Entry point / environment

- Entry point: local Next.js web app in `web/`, likely through existing intervention, artifact, assistant, or future approval-specific surfaces
- Environment: local dev and browser
- Live dependencies involved: local overlays, assembled control-tower data, assistant comms draft flow, and future safe writeback adapters for Jira/Confluence/comms

## Completion Class

- Contract complete means: approval-envelope record shapes, state transitions, and audited status surfaces exist with tests and stable route contracts
- Integration complete means: at least one real reviewed action can move from proposed → approved → executed/blocked through the assembled app with inspectable state
- Operational complete means: approval remains mandatory, audit state is durable, and failed or blocked automation attempts expose enough diagnostics for retry or investigation

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Joydeep can inspect a proposed action envelope and explicitly approve or deny it before any write-capable execution occurs
- the system records auditable state transitions for proposed, approved, denied, and executed or failed actions
- at least one safe writeback-capable path works end to end under the approval model without bypassing existing systems-of-record boundaries

## Risks and Unknowns

- The current draft-safe patterns may not be enough for executable approval envelopes without a new orchestration model for action lifecycle state
- Jira, Confluence, and comms actions may have different execution semantics, which could tempt route-specific hacks instead of one stable approval model
- If auditability is weak or execution failures are opaque, the milestone will increase risk instead of trust

## Existing Codebase / Prior Art

- `web/lib/assistant/comms-engine.ts` — already supports draft, approve, and send states with audit entries for comms drafts
- `web/app/api/assistant/comms/draft/route.ts`, `web/app/api/assistant/comms/[id]/approve/route.ts`, `web/app/api/assistant/comms/[id]/send/route.ts` — current approval-gated comms path and route envelopes
- `web/lib/control-tower/reviews.ts` and `web/lib/control-tower/people-store.ts` — proven overlay persistence patterns for private orchestration state
- `web/lib/control-tower/feature-request-assembler.ts` and `web/lib/control-tower/people-assembler.ts` — proven assembled runtime seams for workflow state
- `web/components/artifacts/ArtifactViewer.tsx` — existing artifact handoff UI with draft-safe submission behavior
- `.gsd/milestones/M001/slices/S03/S03-SUMMARY.md` — proof that review-aware follow-up artifacts survive into an approval-gated comms draft path without sending
- `.gsd/milestones/M002/M002-SUMMARY.md` — proof that people-management drafts follow the same draft-safe pattern

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R202 — directly implements auditable approval envelopes and safe writeback-capable automation
- R007 — must preserve human approval as a hard gate before execution
- R008 — must keep Jira, Confluence, and other official systems as systems of record rather than shifting authority into Personal OS
- R004 and R201 — existing draft generation paths are likely upstream proposal sources for approval envelopes, not replacements for them

## Scope

### In Scope

- approval-envelope model for proposed actions with explicit review state
- durable audit trail for proposed, approved, denied, executed, and failed states
- one or more safe execution paths that prove the approval model works end to end
- status/diagnostic surfaces for pending approvals, denied actions, and failed execution attempts

### Out of Scope / Non-Goals

- autonomous execution without prior approval
- broad uncontrolled writeback across all integrations in one step
- replacing Jira, Confluence, or official communication systems as systems of record
- reworking existing drafting milestones unless required as approval-envelope inputs

## Technical Constraints

- approval must remain a hard gate before any write-capable action executes
- execution state must be inspectable and auditable after the initial request lifecycle ends
- existing overlay persistence and assembled-state patterns should be reused where possible instead of creating route-local state machines
- the milestone must prove real runtime behavior, not only fixture-level state transitions

## Integration Points

- assistant comms draft flow — proven approval-capable surface that may become the first reusable execution envelope
- Jira and Confluence integrations — likely future writeback targets under approval governance
- artifact viewer and control-tower workflows — likely proposal sources for reviewed actions
- local overlay persistence — durable storage for approval envelopes and audit state

## Open Questions

- which concrete action type should be the first full approval-envelope proof — comms is already closest, but Jira/Confluence may be the milestone’s more strategic target
- whether approval envelopes should be generalized across all action types first or proven through one action family and then expanded
- how much execution retry and failure-recovery behavior belongs in M003 versus later orchestration work
