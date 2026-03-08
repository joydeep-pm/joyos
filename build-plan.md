# Product Control Tower Build Plan

## Goal

Build the next major phase of the system as a director-level Product Control Tower. The system should center on feature requests, surface where Joydeep needs to intervene each day, help him track PM and engineering blockers, and draft structured artifacts from Jira, Confluence, and local context.

This plan assumes:

1. `requirements.md` is the product source of truth.
2. Existing `web/` assistant and review surfaces remain the base.
3. Writeback stays approval-gated.
4. V1 reads from Jira, Confluence, and local notes first.
5. Teams integration starts as manual or pasted context unless explicitly expanded.

## Current State

The repo already contains:

1. A Next.js local-first app in `web/`
2. Assistant context, brief, queue, review, alerts, trends, KPI, and comms engines
3. A markdown-first data plane for personal OS content
4. A module/action framework
5. An in-app copilot

What it does not yet contain:

1. Jira ingestion
2. Confluence ingestion
3. A normalized feature-request domain model
4. A PM-owner and risk-severity-first intervention layer
5. A true cross-client control-tower view
6. Formal people-management workflows

## Build Order

### Workstream 1: External Source Ingestion

Objective:
Bring in Jira and Confluence context without breaking the local-first architecture.

Deliverables:

1. `web/lib/integrations/jira/`
2. `web/lib/integrations/confluence/`
3. Config surface for project keys, board filters, and Confluence spaces
4. Cache layer for fetched objects under repo `.cache/`
5. A manual intake path for Teams escalation summaries

Notes:

1. Start read-only.
2. Prefer normalized pull + cache over direct live dependency in every request.
3. Treat auth/config as environment-driven.

### Workstream 2: Feature Request Domain Model

Objective:
Move from task-centric views to feature-request-centric orchestration.

Deliverables:

1. `web/lib/control-tower/feature-request-engine.ts`
2. Normalized feature request type with:
   - title
   - source type
   - client
   - product charter
   - PM owner
   - stage
   - Jira links
   - Confluence links
   - risk summary
   - blocker summary
   - latest update
   - recommended next step
3. Cross-source merge logic
4. Feature-request cache artifact

Notes:

1. This is the core domain object for the product.
2. Do not model the UI directly on raw Jira issues.

### Workstream 3: Daily Intervention Brief

Objective:
Create the primary morning screen Joydeep will use daily.

Deliverables:

1. `Intervention Brief` page or primary `/assistant` mode
2. Grouping by PM owner
3. Sorting by risk severity
4. Director intervention reasons such as:
   - PM blocked
   - engineering dependency stale
   - client escalation aging
   - unclear PRD / story
   - leadership update due
   - sprint grooming readiness issue
5. Quick actions:
   - open feature request
   - draft follow-up
   - request clarification
   - add director note

Notes:

1. This is the P0 user-facing outcome.
2. Optimize for scan speed and decision speed, not generic dashboard density.

### Workstream 4: PM Blocker Dashboard

Objective:
Give Joydeep a live view of where PMs are stuck.

Deliverables:

1. PM-owner dashboard
2. Aging blocker logic
3. State buckets:
   - waiting on PM
   - waiting on engineering
   - waiting on client / implementation
   - ready for grooming
   - in delivery but slipping
4. Metrics:
   - number of red items by PM
   - average blocker age
   - feature requests without update
   - grooming-ready percentage

### Workstream 5: Artifact Drafting Workspace

Objective:
Generate the right artifact from feature-request context and templates.

Deliverables:

1. PRD drafting
2. User-story drafting
3. Internal status update drafting
4. Leadership monthly product update drafting
5. Client escalation summary drafting
6. Engineering clarification note drafting

Implementation guidance:

1. Use template-aware generation.
2. Keep source links visible.
3. Show missing-context warnings rather than overconfident prose.

### Workstream 6: Pre-Grooming Review Support

Objective:
Help Joydeep prepare for the biweekly engineering grooming session.

Deliverables:

1. Grooming readiness view
2. Estimate coverage summary
3. Missing-clarity checklist
4. Bandwidth-aware prioritization prep notes
5. Risks for items likely to be deferred

### Workstream 7: People Management Support

Objective:
Support 1:1 prep, feedback notes, and IDP drafting without auto-writing formal records.

Deliverables:

1. PM profile view
2. 1:1 note capture
3. Feedback synthesis
4. IDP draft generator
5. Evidence log for coaching patterns

Notes:

1. Keep formal storage approval-gated.
2. Default to draft mode only.

### Workstream 8: Approval-Gated Writeback

Objective:
Prepare the system for later Jira/Confluence actions without losing trust.

Deliverables:

1. Approval envelope for every write-capable action
2. Audit log for proposed actions
3. Explicit review state before:
   - Jira create/update
   - Confluence create/update
   - leadership update send
   - client update send
   - PM feedback save

## Suggested Parallelization

Work can be split safely like this:

1. Stream A
External ingestion + normalized feature-request model

2. Stream B
Intervention brief + PM blocker dashboard UI

3. Stream C
Artifact drafting + template application

4. Stream D
People-management support + approval workflow

## Acceptance Criteria

1. The top-level object in the UI is a feature request, not a task.
2. Joydeep can open the morning brief and immediately see where to intervene, grouped by PM owner and ranked by severity.
3. Jira and Confluence context can be read and merged into a feature-request view.
4. PRD and user-story drafts can be generated from linked context and templates.
5. PM blockers and stale engineering dependencies are visible without manual chasing.
6. No external or system-of-record write happens without explicit approval.

## Verification

At minimum, for each substantial milestone:

1. `npm run typecheck`
2. `npm run test`
3. `npm run build`

## Read Next

1. `requirements.md`
2. `docs/architecture.md`
3. `docs/runbooks/claude-handoff.md`
