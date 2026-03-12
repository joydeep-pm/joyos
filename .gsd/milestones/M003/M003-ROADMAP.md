# M003: Approval-governed automation

**Vision:** Turn the current draft-safe workflows into an approval-governed automation layer with explicit approval envelopes, auditable state transitions, and safe writeback-capable execution paths that never bypass human review.

## Success Criteria

- Joydeep can inspect a concrete approval envelope, see the proposed action and evidence behind it, and explicitly approve or deny it before any write-capable execution occurs.
- The system records durable audit state for proposed, approved, denied, executed, and failed actions, and exposes that state through stable runtime diagnostics.
- At least one real write-capable or send-capable action completes end to end under the approval model without bypassing the systems-of-record boundary.

## Key Risks / Unknowns

- The current comms approval flow may be too specialized to serve as the general envelope model without refactoring.
- Jira, Confluence, and comms actions may drift into route-specific approval behavior unless one shared lifecycle model is established first.
- Poor failure visibility or weak audit state would make automation less trustworthy even if the happy path works.

## Proof Strategy

- reusable approval-envelope lifecycle is operationally sound → retire in S01 by proving proposed, approved, denied, and failure states persist with stable diagnostics on one shared envelope model
- approval-governed execution works beyond planning artifacts → retire in S02 by proving one real action family executes from an approved envelope with auditable state transitions
- assembled approval workflow works end-to-end in the live app → retire in S03 by proving a user can inspect, approve, and observe the result of an envelope-driven action in the browser without silent side effects

## Verification Classes

- Contract verification: targeted tests for approval-envelope persistence, lifecycle transitions, audit state, and route failure codes
- Integration verification: real app flow through proposal, approval, execution, and status inspection for at least one action family
- Operational verification: failed or denied actions remain inspectable and do not execute; approved actions record durable audit outcomes
- UAT / human verification: confirm approval envelopes communicate the action, evidence, and risk clearly enough for director review

## Milestone Definition of Done

This milestone is complete only when all are true:

- all slices ship substantive working code for approval envelopes, audit state, and safe execution paths
- approval and execution surfaces are wired into live assembled data and durable state rather than route-local flags
- the real browser entrypoint exists and is exercised against an envelope-driven workflow
- success criteria are re-checked against live behavior, not just fixtures or route tests
- final integrated acceptance scenarios pass with approval remaining mandatory

## Requirement Coverage

- Covers: R202
- Partially covers: R007, R008
- Leaves for later: R203
- Orphan risks: none

## Slices

- [x] **S01: Approval envelope model and audited lifecycle** `risk:high` `depends:[]`
  > After this: the system can persist and inspect proposed approval envelopes with explicit lifecycle state, audit events, and stable diagnostics.
- [x] **S02: Approved action execution path** `risk:medium` `depends:[S01]`
  > After this: one real action family can move from approved envelope to executed or failed state with durable audit output and no approval bypass.
- [x] **S03: Live approval workflow integration** `risk:medium` `depends:[S01,S02]`
  > After this: the running app supports an end-to-end browser workflow for inspecting, approving, and observing an envelope-driven action in real time.

## Boundary Map

### S01 → S02

Produces:
- approval-envelope record shape with lifecycle states, actor/timestamp fields, and audit event history
- stable route or service contracts for proposing, approving, denying, and inspecting envelopes
- durable diagnostic codes for invalid transitions, missing envelopes, and denied execution attempts

Consumes:
- existing draft-safe action sources and local overlay persistence patterns

### S02 → S03

Produces:
- one envelope-backed execution path with durable executed and failed result state
- inspection surface for pending, approved, denied, executed, and failed envelopes
- runtime-safe invariant that execution cannot occur without prior approval

Consumes:
- S01 approval-envelope lifecycle contracts

### S01 → S03

Produces:
- authoritative approval state and audit records usable by browser-visible approval workflows

Consumes:
- existing artifact viewer, assistant, or control-tower UI entrypoints that can initiate or display reviewed actions
