# M002: People management intelligence

**Vision:** Turn the current placeholder people area into a real people-management operating layer that helps Joydeep prepare for PM 1:1s, inspect coaching evidence from live portfolio context, and draft feedback or IDP material without breaking the local-first overlay and approval boundary.

## Success Criteria

- Joydeep can open the people workspace and immediately see which PMs need attention, why they need it, and what evidence supports that assessment.
- Joydeep can inspect a PM’s live portfolio context and generate useful 1:1 prep plus feedback/IDP drafts from that context without relying on mock profiles or placeholder-only content.
- The system keeps people-management notes and draft outputs private or approval-gated, and does not silently create formal performance records.

## Key Risks / Unknowns

- The current mock-driven people page and thin evidence engine may not produce operationally useful coaching signals without a new assembled PM model.
- PM identity and portfolio evidence derived from `pmOwner` may be incomplete or inconsistent, which could weaken the people workspace unless low-confidence states are explicit.
- Durable people-management notes and draft state could blur the line between private synthesis and formal performance records if the approval boundary is not explicit.

## Proof Strategy

- operationally useful PM attention and evidence model → retire in S01 by proving live PM portfolio summaries can be derived from real synthesized feature-request state with explicit confidence and attention signals
- durable private people-management workflow state → retire in S02 by proving notes or review state persist locally and refresh through one assembled people seam without mutating source records
- assembled 1:1 and feedback drafting loop works end-to-end → retire in S03 by proving the live people workspace can review evidence, generate drafts, and keep all formal outputs draft-only or approval-gated

## Verification Classes

- Contract verification: targeted tests for PM assembly, evidence derivation, persistence contracts, and people-aware drafting outputs
- Integration verification: real app flow through the people workspace, PM detail/review, and draft generation using live synthesized context
- Operational verification: approval-gated behavior remains intact for any formal note save, share, or comms handoff path
- UAT / human verification: confirm the PM attention signals, coaching summaries, and 1:1/IDP draft language feel useful for real management prep

## Milestone Definition of Done

This milestone is complete only when all are true:

- all slices ship substantive working code for PM intelligence and people-management workflows
- PM evidence, draft state, and UI surfaces are wired into live assembled data rather than mock profiles
- the real browser entrypoint exists and is exercised against the assembled people workflow
- success criteria are re-checked against live behavior, not just fixtures or placeholder content
- final integrated acceptance scenarios pass with approval boundaries intact

## Requirement Coverage

- Covers: R201
- Partially covers: R007, R008
- Leaves for later: R202, R203
- Orphan risks: none

## Slices

- [x] **S01: Live PM portfolio intelligence and attention model** `risk:high` `depends:[]`
  > After this: the app can derive real PM attention summaries, portfolio evidence, and 1:1 urgency from assembled feature-request context and expose them through a stable contract.
- [x] **S02: Durable people workflow state and review surfaces** `risk:medium` `depends:[S01]`
  > After this: a PM detail workflow can show persisted private notes or review state alongside live portfolio evidence without relying on client-local mock data.
- [x] **S03: 1:1 and IDP drafting loop integration** `risk:medium` `depends:[S01,S02]`
  > After this: the live people workspace supports end-to-end evidence review, 1:1 prep generation, and approval-safe feedback/IDP drafting with real browser proof.

## Boundary Map

### S01 → S02

Produces:
- assembled PM portfolio summary contract keyed by normalized PM identity
- derived PM attention status, 1:1 urgency, and coaching evidence entries with explicit confidence or missing-signal diagnostics
- people workspace read API or equivalent stable read seam for runtime consumers

Consumes:
- existing feature-request cache and M001 assembled feature-request state

### S02 → S03

Produces:
- persisted people-management overlay shape for private notes, coaching reviews, or draft session state
- PM detail/review surfaces that combine live portfolio evidence with persisted private workflow state
- stable mutation/read diagnostics for missing PM targets or persistence failures

Consumes:
- S01 assembled PM portfolio and evidence contracts

### S01 → S03

Produces:
- authoritative PM evidence and portfolio context usable by 1:1 prep and feedback/IDP drafting flows

Consumes:
- existing artifact viewer / draft presentation flow and approval-gated draft handling patterns from M001
