# Requirements

This file is the explicit capability and coverage contract for the project.

Use it to track what is actively in scope, what has been validated by completed work, what is intentionally deferred, and what is explicitly out of scope.

Guidelines:
- Keep requirements capability-oriented, not a giant feature wishlist.
- Requirements should be atomic, testable, and stated in plain language.
- Every **Active** requirement should be mapped to a slice, deferred, blocked with reason, or moved out of scope.
- Each requirement should have one accountable primary owner and may have supporting slices.
- Research may suggest requirements, but research does not silently make them binding.
- Validation means the requirement was actually proven by completed work and verification, not just discussed.

## Active

### R001 — Daily director intervention brief
- Class: primary-user-loop
- Status: active
- Description: Joydeep can open the system and immediately see which feature requests require intervention today, grouped by PM owner and ordered by risk severity.
- Why it matters: The product fails if it does not reduce morning triage and intervention effort.
- Source: user
- Primary owning slice: validated in prior implementation
- Supporting slices: M001/S01, M001/S02
- Validation: partial
- Notes: Existing V1 proves the base brief; M001 must make the brief operationally actionable through review and decision workflows.

### R002 — Feature-request-centric workspace
- Class: core-capability
- Status: validated
- Description: The top-level object is a feature request that merges execution, documentation, and local synthesis context rather than raw task lists.
- Why it matters: This is the core domain model around which all intervention, review, and drafting workflows depend.
- Source: user
- Primary owning slice: validated in prior implementation
- Supporting slices: M001/S01, M001/S02, M001/S03
- Validation: validated
- Notes: Prior implementation established the feature-request model, and M001 completed the operational layer by keeping review capture, assembled intervention/detail refresh, and review-aware artifact handoff on the same enriched feature-request contract.

### R003 — PM blocker and execution visibility
- Class: failure-visibility
- Status: active
- Description: The system surfaces where PMs are blocked, what dependencies are stale, and which asks are at risk of slipping.
- Why it matters: Joydeep’s manual dependency chasing and execution visibility burden is one of the main pain points.
- Source: user
- Primary owning slice: validated in prior implementation
- Supporting slices: M001/S01, M001/S02
- Validation: partial
- Notes: Existing V1 shows blockers; M001 should add review readiness and prioritization context.


### R007 — Approval-gated output and writeback behavior
- Class: constraint
- Status: validated
- Description: Any writeback, commitment, communication, prioritization, assignment, or formal record storage requires human review before execution.
- Why it matters: This is a hard trust and governance boundary stated by the user.
- Source: user
- Primary owning slice: validated in prior implementation
- Supporting slices: M001/S03, M003/S01
- Validation: validated
- Notes: S03 proved the current communication path preserves generated follow-up content as a draft, returns inspectable draft metadata, and still stops short of approval/send; later milestones extend the same boundary to broader writeback paths.

### R008 — Systems-of-record overlay model
- Class: integration
- Status: validated
- Description: Jira remains the execution system of record, Confluence remains the documentation system of record, and Personal OS remains the private synthesis and orchestration layer.
- Why it matters: This prevents scope confusion and preserves trust in official systems.
- Source: user
- Primary owning slice: validated in prior implementation
- Supporting slices: M001/S01, M004/S01
- Validation: validated
- Notes: M001 completed without mutating source records: readiness stayed derived, review decisions persisted in the local overlay store, and comms submission remained an approval-gated draft layer on top of the assembled feature-request workflow.

## Validated

### R101 — Read-first Jira and Confluence synthesis exists
- Class: integration
- Status: validated
- Description: The system can ingest Jira and Confluence context into the control tower experience without requiring autonomous writeback.
- Why it matters: This is the foundational proof that the control tower can sit above official systems of record.
- Source: execution
- Primary owning slice: prior implementation
- Supporting slices: none
- Validation: validated
- Notes: Established in the existing V1 implementation documented in repo summaries.

### R102 — Intervention view grouped by PM owner and risk exists
- Class: primary-user-loop
- Status: validated
- Description: The director can review intervention candidates grouped by PM owner and ordered by severity.
- Why it matters: This is the core morning scan behavior requested in discovery.
- Source: execution
- Primary owning slice: prior implementation
- Supporting slices: none
- Validation: validated
- Notes: Verified in prior slice completion summaries.

### R103 — Template-based artifact generation exists
- Class: core-capability
- Status: validated
- Description: The system can generate multiple structured product artifacts from feature request context using predefined templates.
- Why it matters: Draft acceleration is already proven and should be treated as an established capability.
- Source: execution
- Primary owning slice: prior implementation
- Supporting slices: none
- Validation: validated
- Notes: Verified by existing tests and build output documented in repo summaries.

### R005 — Grooming readiness and prioritization support
- Class: core-capability
- Status: validated
- Description: Joydeep can review feature requests for clarity, estimate readiness, dependency state, and prioritization posture before engineering grooming.
- Why it matters: The biweekly grooming session is a key control point in the real operating loop.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S02, M001/S03
- Validation: validated
- Notes: S01 proved the derived readiness evaluator, grooming summary wiring, machine-readable diagnostics, and actionable grooming UI/rendering contract through tests and typecheck.

### R004 — Structured artifact drafting from context
- Class: core-capability
- Status: validated
- Description: The system can draft PRDs, user stories, status updates, leadership updates, and related product artifacts from linked feature request context and templates.
- Why it matters: Draft acceleration and consistency are one of the highest-value user outcomes.
- Source: user
- Primary owning slice: validated in prior implementation
- Supporting slices: M001/S02
- Validation: validated
- Notes: Prior implementation proved baseline artifact generation; S02 proved review-aware drafting by routing artifact generation through the shared assembler and extending template context with persisted review decisions, pending decisions, and next actions.

### R006 — Explicit decision tracking for director review
- Class: operability
- Status: validated
- Description: The system records review outcomes, pending decisions, decision rationale, and recommended next actions at the feature-request level.
- Why it matters: Visibility alone is insufficient; Joydeep needs a durable operating layer for decisions and follow-through.
- Source: inferred
- Primary owning slice: M001/S02
- Supporting slices: M001/S03
- Validation: validated
- Notes: S02 proved durable local review persistence, server-side assembly onto feature requests, intervention/detail visibility, review-aware drafting inputs, and stable diagnostics for orphaned review state.

## Deferred

### R201 — PM people-management operating layer
- Class: admin/support
- Status: deferred
- Description: The system supports 1:1 preparation, PM coaching evidence, feedback synthesis, and IDP draft generation.
- Why it matters: This is valuable but not the immediate next milestone focus.
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: M002/S02
- Validation: unmapped
- Notes: Explicitly deferred into the next milestone sequence.

### R202 — Broader automation and audited writeback
- Class: operability
- Status: deferred
- Description: The system can package reviewed actions into auditable approval envelopes and safely write back to Jira, Confluence, or communication channels after approval.
- Why it matters: This is the trust-preserving path toward greater automation.
- Source: user
- Primary owning slice: M003/S01
- Supporting slices: M003/S02
- Validation: unmapped
- Notes: Not the focus of M001 even though some approval primitives already exist.

### R203 — Deeper Teams ingestion and channel orchestration
- Class: integration
- Status: deferred
- Description: The system ingests and reasons over Teams escalation threads directly rather than through manual summarization or pasted context.
- Why it matters: This would improve completeness of signal capture but should not block the current roadmap.
- Source: user
- Primary owning slice: M004/S01
- Supporting slices: none
- Validation: unmapped
- Notes: The requirements document explicitly recommends not blocking V1 on Teams integration.

## Out of Scope

### R301 — Generic personal productivity dashboard
- Class: anti-feature
- Status: out-of-scope
- Description: The product is not a generic task list, calendar planner, or personal productivity dashboard centered on arbitrary todos.
- Why it matters: This preserves the control-tower framing and prevents regression to a weaker product definition.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: The system must stay anchored on feature requests and leadership workflows.

### R302 — Autonomous unreviewed writeback
- Class: anti-feature
- Status: out-of-scope
- Description: The system must not autonomously send updates, change priority, assign work, create official records, or persist formal people-management records without approval.
- Why it matters: This is directly contrary to the user’s explicit trust boundary.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Approval remains mandatory for all commitment actions.

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | primary-user-loop | active | validated in prior implementation | M001/S01, M001/S02 | partial |
| R002 | core-capability | validated | validated in prior implementation | M001/S01, M001/S02, M001/S03 | validated |
| R003 | failure-visibility | active | validated in prior implementation | M001/S01, M001/S02 | partial |
| R004 | core-capability | validated | validated in prior implementation | M001/S02 | validated |
| R005 | core-capability | validated | M001/S01 | M001/S02, M001/S03 | validated |
| R006 | operability | validated | M001/S02 | M001/S03 | validated |
| R007 | constraint | validated | validated in prior implementation | M001/S03, M003/S01 | validated |
| R008 | integration | validated | validated in prior implementation | M001/S01, M004/S01 | validated |
| R101 | integration | validated | prior implementation | none | validated |
| R102 | primary-user-loop | validated | prior implementation | none | validated |
| R103 | core-capability | validated | prior implementation | none | validated |
| R201 | admin/support | deferred | M002/S01 | M002/S02 | unmapped |
| R202 | operability | deferred | M003/S01 | M003/S02 | unmapped |
| R203 | integration | deferred | M004/S01 | none | unmapped |
| R301 | anti-feature | out-of-scope | none | none | n/a |
| R302 | anti-feature | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 2
- Mapped to slices: 2
- Validated: 9
- Unmapped active requirements: 0
