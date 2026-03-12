# M004: Expanded orchestration and intelligence — Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

## Project Description

This milestone extends the control tower from proven review, drafting, people-management, and approval-governed comms execution into broader orchestration. The next step is to deepen cross-channel signal capture, preserve continuity across workstreams, and expose higher-value intelligence that helps Joydeep move from reactive scans to coordinated intervention planning.

## Why This Milestone

The product already proves the core operating loop for feature-request review, artifact drafting, PM coaching, and one approval-governed automation path. The next value gap is continuity and orchestration across channels and time: richer signal ingestion, clearer cross-workstream state, and more agent-useful intelligence that can connect intervention needs, people signals, and outbound actions without collapsing the systems-of-record boundary.

## User-Visible Outcome

### When this milestone is complete, the user can:

- see deeper cross-channel operating signals, including richer escalation context beyond the current Jira/Confluence-centric read model
- follow continuity across interventions, people, and automation surfaces without manually stitching together scattered state
- use higher-value orchestration views or assistant flows that convert raw signals into coordinated next actions while still preserving approval and systems-of-record boundaries

### Entry point / environment

- Entry points likely include the existing `web/` app surfaces such as `/`, `/assistant`, `/people`, and intervention/detail workflows
- Environment: local dev plus real browser verification
- Live dependencies involved: local overlays, assistant/control-tower assembled reads, Jira/Confluence sync, deferred Teams-adjacent or other channel-ingestion seams, and the approval-governed automation surfaces proven in M003

## Completion Class

- Contract complete means: new orchestration/intelligence state has explicit types, stable route contracts, and durable persistence or assembly seams where needed
- Integration complete means: at least one richer cross-surface orchestration loop works through the assembled app rather than isolated mock state
- Operational complete means: new signals and continuity state remain inspectable, do not bypass approval boundaries, and improve agent/human ability to localize what needs action next

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Joydeep can inspect richer operating signals that extend beyond the current read model and use them in at least one live orchestration workflow
- continuity state across interventions, people, and assistant/automation surfaces is assembled from durable state rather than manual inference or mock-only joins
- the milestone adds meaningful intelligence or orchestration value in the browser without weakening the systems-of-record boundary or approval gate

## Risks and Unknowns

- richer cross-channel ingestion may introduce noisy or weakly structured signals that are hard to normalize into the feature-request-centric model
- continuity across intervention, people, and assistant workflows may tempt UI-local joins instead of a stable assembled seam
- orchestration features can become vague dashboards unless each slice proves a concrete, decision-shaping workflow

## Existing Codebase / Prior Art

- `web/lib/control-tower/*` assemblers and views — existing server-authored seams for feature-request and PM intelligence
- `web/lib/assistant/*` — existing assistant context, brief, queue, comms, and approval-envelope flows
- `web/app/assistant/page.tsx` — now a live orchestration/automation entrypoint after M003
- `web/app/people/*` and related people-store/assembler code — durable people-management overlay and assembled reads proven in M002
- `.gsd/milestones/M001/M001-SUMMARY.md`, `.gsd/milestones/M002/M002-SUMMARY.md`, `.gsd/milestones/M003/M003-SUMMARY.md` — verified milestone summaries that define the current reusable seams

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R001 — still active: the daily intervention brief should become more operationally complete through richer orchestration and continuity
- R003 — still active: PM blocker and execution visibility should improve with stronger cross-channel signal capture and continuity
- R203 — deferred target for this milestone: deeper Teams ingestion and channel orchestration
- R008 — must remain preserved: Personal OS orchestrates while Jira and Confluence remain systems of record
- R007 / R302 — approval boundaries remain mandatory for any new outward action or write-capable flow

## Scope

### In Scope

- richer orchestration and intelligence on top of the current control-tower and assistant foundations
- deeper signal ingestion or normalization where it materially improves intervention and execution visibility
- continuity surfaces that connect decisions, people context, and automation state in one assembled workflow
- at least one live browser-visible orchestration loop that proves the milestone adds more than passive visibility

### Out of Scope / Non-Goals

- replacing official systems of record with local authoritative state
- adding autonomous writeback without approval
- broad speculative dashboard expansion without a concrete decision workflow
- reworking completed milestones unless needed to support a stable orchestration seam

## Technical Constraints

- preserve the systems-of-record boundary and approval governance established in prior milestones
- prefer assembled server-authored seams over UI-local inference when joining cross-surface state
- new orchestration state must be inspectable and durable enough for future-agent continuation
- the milestone must include real browser proof, not only route or fixture tests

## Integration Points

- control-tower intervention and detail surfaces
- assistant brief, queue, comms, and approval workflow surfaces
- people-management intelligence from M002
- future Teams or channel-ingestion adapters where they improve execution visibility without becoming the system of record

## Open Questions

- what is the most valuable first orchestration loop: richer escalation ingestion, continuity tracking across surfaces, or a new cross-surface action planner
- whether Teams-adjacent ingestion should be proven directly in M004 or via a more general signal-ingestion seam first
- how much of M004 should focus on deeper intelligence versus explicit orchestration UI/flows
