# M001: Decision and review operating system

**Vision:** Turn the existing Product Control Tower into a director-grade decision and review operating system that makes feature-request intervention actionable, improves grooming readiness and prioritization preparation, and preserves the current feature-request-centric overlay above Jira and Confluence.

## Success Criteria

- Joydeep can review any in-flight feature request and see a clear readiness verdict, missing inputs, blockers, and recommended next step before grooming.
- Joydeep can record review decisions and use them to drive follow-up actions, drafting, and intervention visibility without leaving the control tower workflow.
- The system can support a realistic pre-grooming operating loop using real synthesized feature-request context, not mock-only planning artifacts.

## Key Risks / Unknowns

- Review criteria may be too vague to be operationally useful — if the rubric is weak, the milestone will not reduce decision effort.
- Current cache and UI contracts may not expose enough structure for durable decision tracking — this could require domain-model changes across multiple surfaces.
- Existing intervention and artifact flows may not absorb review outcomes cleanly — poor assembly would create duplicate workflows.

## Proof Strategy

- operationally useful readiness model → retire in S01 by proving a real feature request can be assessed for grooming readiness with explicit missing-context and blocker signals
- durable decision tracking across surfaces → retire in S02 by proving review outcomes persist and affect intervention/detail workflows
- assembled pre-grooming loop works end-to-end → retire in S03 by proving review, decision capture, and follow-up drafting work together in the live app

## Verification Classes

- Contract verification: file and export checks, targeted tests for readiness evaluation and decision persistence, artifact checks for review wiring
- Integration verification: real app flow through feature request detail, review workflow, and follow-up drafting using the assembled control tower
- Operational verification: approval-gated behavior remains intact where communication or writeback-adjacent actions appear
- UAT / human verification: confirm the review language and decision surfaces feel useful for actual director-level grooming prep

## Milestone Definition of Done

This milestone is complete only when all are true:

- all slices ship substantive working code for review and decision workflows
- readiness logic, decision tracking, and UI surfaces are actually wired into the existing feature-request model
- the real browser entrypoint exists and is exercised against the assembled app
- success criteria are re-checked against live behavior, not just test fixtures
- final integrated acceptance scenarios pass

## Requirement Coverage

- Covers: R001, R002, R003, R005, R006
- Partially covers: R004, R007, R008
- Leaves for later: R201, R202, R203
- Orphan risks: none

## Slices

- [x] **S01: Grooming readiness engine and review rubric** `risk:high` `depends:[]`
  > After this: a real feature request can be evaluated for readiness, missing inputs, blockers, and prioritization posture through a substantive decision rubric.
- [x] **S02: Decision tracking in feature request workflows** `risk:medium` `depends:[S01]`
  > After this: review outcomes, pending decisions, and next actions are recorded on feature requests and visible in intervention and detail views.
- [x] **S03: Pre-grooming operating loop integration** `risk:medium` `depends:[S01,S02]`
  > After this: the live app supports an end-to-end pre-grooming flow that combines synthesized context, review decisions, and artifact follow-up preparation.

## Boundary Map

### S01 → S02

Produces:
- readiness evaluation model for a feature request, including verdict, missing inputs, blocker classification, and prioritization posture
- derived review dimensions and invariants that downstream UI can render consistently
- testable readiness contract for real synthesized feature-request objects

Consumes:
- existing feature-request domain model from the current control tower implementation
- existing Jira/Confluence synthesized context already available in V1

### S02 → S03

Produces:
- feature-request review record shape containing review status, decision rationale, pending decisions, and next actions
- detail and intervention surfaces that expose review outcomes alongside existing risk and blocker state
- persistence mechanism for private review metadata in the orchestration layer

Consumes:
- S01 readiness evaluation model and review rubric outputs
- existing artifact generation and intervention detail flows from the current control tower implementation

### S01 → S03

Produces:
- stable readiness verdicts and missing-context signals that can be referenced in follow-up drafting and pre-grooming review flows

Consumes:
- existing feature-request synthesis and detail views from the current control tower implementation
