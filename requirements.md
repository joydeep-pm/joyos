# Product Control Tower Requirements

## Document Purpose

This document captures the full discovery context for evolving the current Personal OS / assistant dashboard into a product-leadership execution system for Joydeep Sarkar. It is intended as a handoff-grade requirements document for parallel implementation by another agent or engineer such as Claude.

The goal is completeness, not brevity. This document includes:

1. User-provided background
2. Inferred operating model
3. Confirmed workflows
4. Tool and system-of-record mapping
5. Pain points
6. Assistant behavior expectations
7. Product direction recommendations
8. V1 / near-term implementation guidance
9. Approval boundaries
10. Design principles and non-goals

---

## User Identity And Role

### Confirmed User Details

1. Name: Joydeep Sarkar
2. Preferred short name: Joy / Joydeep
3. Current role: Director of Products at M2P Fintech
4. Experience:
   - 15 years total work experience
   - 8 years of product management experience
   - Domain concentration in digital lending infrastructure
5. Functional specialization:
   - Loan Origination Systems (LOS)
   - Loan Management Systems (LMS)
   - Collections
   - Lending infrastructure / core lending suite products

### Org / Market Context

1. Company serves 45+ clients
2. Geographic coverage includes:
   - India
   - Middle East / North Africa region references
   - Philippines
3. Enterprise tooling in use:
   - Microsoft suite
   - Teams
   - Outlook

---

## Product Org Context

### Joydeep's Organizational Responsibility

1. Joydeep manages the Core Lending Suite product
2. There are multiple directors; one other director handles MFI and retail/business client areas
3. Joydeep personally owns / oversees these vertical charters:
   - Co-Lending
   - Loan Against Securities (LAS)
   - BNPL

### Team Structure

1. 5 SPM / APM / PM team members report to Joydeep
2. All client requests for Joydeep's charters are routed to PMs under him
3. Monthly 1:1s are conducted with direct reports
4. Feedback is first shared verbally, then journalized in an McKinsey-style IDP feedback format

---

## Confirmed OKRs / Leadership Expectations

User stated that the major OKRs are:

1. Documentation
2. Stability
3. New Business

Additional context:

1. AOP planning for next year was just completed
2. Monthly product updates are prepared for leadership

Implication:

The system must support not just execution tracking, but also artifact quality, stability/risk visibility, and leadership communication.

---

## Current AI And Working Style Context

### Current AI Usage

1. User has access to Gemini Enterprise via company
2. User is not happy with Gemini output quality
3. User uses BMAD-style approaches to draft PRDs
4. User uses CLI-based AI workflows heavily
5. User currently prefers Antigravity Claude Sonnet for better output

### What This Means

1. User is already AI-native enough to use multiple models and CLI tooling
2. The opportunity is not "introduce AI"
3. The opportunity is "embed AI into real product leadership workflows"
4. Deliverables should be structured for parallel agent execution, codebase-aware analysis, and artifact drafting

---

## Discovered Notion Evidence

### Notion Tasks Database

The referenced Notion URL resolved to a `Tasks` database with fields such as:

1. Category
2. Deadline
3. Notes
4. Parent item
5. Priority
6. Project/Product
7. Status
8. Sub-item
9. Tasks (title)

Confirmed project/product examples in that database include:

1. Product Enhancement
2. Carbay
3. CIM CFA
4. CIM BNPL
5. CIM SME
6. FiGlobal
7. Vista Global
8. NBB
9. Seven Belton
10. UNO
11. Mynt
12. Credila
13. Flexiloans
14. Pargro
15. Tapstart
16. Volt
17. Trucap
18. ABFL
19. Respo
20. Team Process
21. Personal

Implication:

User naturally operates across many parallel workstreams and already thinks in structured task and project dimensions.

### Specific Notion Page Evidence

The page `GSD (1)` showed:

1. Structured Jira user story style thinking
2. Lending / on-lending / co-lending problem statements
3. Business use cases around:
   - repayment strategy ordering
   - waivers of penalties/charges
   - penalty application and apportionment visibility
4. Requirement authoring grounded in platform behavior
5. Prompting AI to:
   - read codebase
   - compare technical approaches
   - draft PRDs
   - produce API contracts
   - create sequence diagrams
   - estimate effort by SDLC phases

Implication:

This confirms the user's work is not generic task planning. It is systems/product reasoning for fintech infrastructure, grounded in codebase and implementation realities.

---

## User Memory Data Provided

The user shared Gemini and ChatGPT memory dumps.

### Relevant High-Signal Memory Themes

These themes are relevant to the work assistant:

1. Fintech product and lending systems
2. Product leadership trajectory
3. AI-driven development / vibe coding / CLI-heavy workflows
4. Personal knowledge management / second-brain building
5. Structured document preferences
6. Interest in implementation-ready artifacts
7. Side projects such as portfolio website and knowledge work tools

### Explicitly Treated As Noisy / Potentially Polluted

The following memory cluster should not be treated as core truth for this system without fresh confirmation:

1. The Kanika / KPMG tax-manager memory block

Reason:

This appears to mix another identity and domain context that is not consistent with the user's direct statements in this discovery.

### Additional Memory Signals Worth Keeping In Mind

These are not the core work system, but may matter later:

1. User is interested in AI-native product building
2. User wants a "Knowledge Work Center" type application
3. User values structured templates and reusable frameworks
4. User prefers clear, concise, human writing with low hype

---

## User-Provided Workflow Inputs

### Recurring Input Types Into The User's Week

User explicitly listed these recurring inputs:

1. Client escalation on Teams
2. Feature ask from PM
3. Sales / RFP ask
4. Implementation gap
5. Bug / stability issue
6. Engineering blocker
7. Leadership update request

Additional process input:

8. Every two weeks there is a long grooming session with engineering where prioritization happens in Jira based on available pod bandwidth

### Recurring Outputs Personally Produced By User

User explicitly listed these as recurring outputs:

1. PRD
2. User stories
3. Product update monthly for leadership
4. Internal status update
5. AOP / roadmap input
6. Team feedback note
7. Prioritization decision

### Confirmed End-To-End Operating Flow For A Typical Item

User described the common workflow as:

1. Ask arrives from client to implementation team including BA
2. Implementation / BA grooms to PM
3. PM explores
4. Joydeep reviews
5. Codebase / engineering validation happens
6. PRD / story is created
7. Estimate is created
8. Item is prioritized in grooming based on sprint bandwidth
9. Delivery tracking happens
10. Testing happens
11. Client update happens
12. UAT deploy happens
13. Prod deploy happens

This is the most important confirmed operational loop in the discovery.

---

## Current Systems Of Record

User confirmed the tool mapping:

1. Execution status: Jira
2. Backlog / prioritization: Jira
3. Requirements docs: Confluence
4. Team notes / 1:1s: Excel
5. Client communication: Teams groups specific to clients
6. Engineering work tracking: partly Jira effort estimates, but timelines are often missed and engineering sometimes misinforms product verbally

Important implication:

Engineering execution truth is partially formal and partially informal. This creates a major visibility gap for the user.

---

## Current Pain Points

The user listed these pain points:

1. Too many asks across clients
2. Status updates take too much time
3. Dependency chasing
4. Reviewing PM output quality
5. Switching between product and people management

The user repeated "too many asks across clients," which indicates it is likely the strongest pain point.

### Interpreted Root Problems

From the above, the likely root problems are:

1. Intake overload
2. Cross-client context switching
3. Weak blocker visibility
4. Time spent synthesizing status instead of making decisions
5. PM quality-control burden on the user
6. Fragmented system of record across Jira, Confluence, Teams, Excel, and verbal engineering inputs

---

## What The User Wants The Assistant To Do

### Explicitly Desired Assistant Behaviors

The user explicitly requested these top assistant behaviors:

1. Tell me where I need to intervene today
2. Draft the right artifact from context
3. Summarize risks across all client / product charters
4. Show where PMs are stuck
5. Prepare stakeholder / leadership updates automatically
6. Draft IDP after 1:1

### PM Team Support Expectations

When asked what the system should do for PMs / PM management, the user responded:

1. Preferably all of them

Interpreted requested PM-management support areas:

1. Daily blocker digest
2. Quality review of PRDs / stories
3. Aging requests
4. Client heatmap
5. Follow-up nudges
6. 1:1 prep
7. Performance evidence log

---

## Approval Boundaries

### Confirmed User Preference

The user explicitly stated that all write / commitment actions should require review first.

When asked whether all the following should require approval:

1. Sending updates externally
2. Sending internal leadership updates
3. Creating Jira items
4. Changing priority
5. Assigning work
6. Drafting PM feedback
7. Storing formal IDP / performance notes

The user responded in substance that all of them require review first.

### Therefore Approval Model Is

1. Read / analyze / summarize can be automatic
2. Drafting can be automatic
3. Any writeback, commitment, communication, prioritization, assignment, or people-record storage must be human-approved

This is a hard requirement, not a preference.

---

## Prioritization Of Desired V1 Capabilities

The user ranked the priorities roughly as follows:

### P0

1. Daily intervention brief
2. PM blocker dashboard
3. PRD / user-story drafting
4. Leadership monthly update drafting

### P1 / Secondary

1. Client escalation summarization
2. Other lower-priority items beyond the top items above

### Grouping Preference For Daily Intervention Brief

The user specified the preferred grouping / viewing lens:

1. PM owner
2. Risk severity

This is crucial for dashboard design.

---

## Confirmed Top-Level Unit Of Management

When asked what the natural top-level unit is, the user answered:

1. Feature request

This means the system should not be primarily organized around:

1. generic tasks
2. calendar blocks
3. projects only
4. clients only

Instead, the core unit should be:

1. Feature request

With secondary dimensions such as:

1. PM owner
2. Client
3. Product charter
4. Risk severity
5. Stage in lifecycle

---

## Product Direction Derived From Discovery

### Strong Conclusion

The user does not primarily need a personal task planner.

The user needs a:

## Director Of Product Control Tower

Alternative phrasing:

1. Product Leadership Control Tower
2. Feature Request Orchestration Assistant
3. Product Execution Control System

### Why This Is The Right Product

Because the real problem is:

1. intake overload across many clients
2. conversion of asks into structured artifacts
3. prioritization against engineering bandwidth
4. blocker / dependency tracking across PMs and engineering
5. leadership and client communication synthesis
6. PM quality review and people-management support

This is a product leadership orchestration problem, not a "today list" problem.

---

## Recommended Target Product Shape

### Core Product Definition

An AI product leadership copilot that helps a Director of Products decide where to intervene, turn feature requests into structured artifacts, and keep multi-client execution moving across PMs and engineering.

### Core Design Principles

1. Feature request is the primary object
2. PM owner and risk severity are primary lenses
3. Cross-tool orchestration is the real target architecture
4. Approval-gated writeback is mandatory
5. Artifact quality matters as much as status visibility
6. Product + people management should both be supported
7. The system must support messy, incomplete, partially verbal reality

---

## Recommended System Evolution

### V1 Source Inputs

Confirmed / recommended:

1. Jira
2. Confluence
3. Personal OS notes

### Teams Strategy For V1

Recommended:

1. Do not block V1 on full Teams integration
2. Support manual paste / summarized ingest of Teams escalation threads into the system
3. Add deeper Teams integration later

Reason:

Teams ingestion is typically harder and slower to integrate. Jira + Confluence + Personal OS can provide substantial initial value sooner.

### Personal OS Role In The Stack

Personal OS should become:

1. the private synthesis layer
2. the intervention dashboard
3. the draft-generation workspace
4. the director overlay above official systems of record

Meaning:

1. Jira remains the execution system of record
2. Confluence remains the documentation system of record
3. Personal OS becomes the orchestration and intelligence layer

---

## Recommended V1 Screens / Modules

### 1. Intervention Brief

Purpose:

Daily morning director view of where intervention is required.

Should show:

1. PM owner
2. Feature requests at risk
3. High-severity blockers
4. Aging items
5. Requests waiting on engineering
6. Requests waiting on PM
7. Requests waiting on client / implementation input
8. Stability / bug issues requiring attention
9. Items likely to slip

Sort / grouping:

1. Group by PM owner
2. Sort within group by risk severity

### 2. Feature Requests

Purpose:

Canonical workspace for a feature request as the top-level unit.

Each feature request should include:

1. Title
2. Source of ask
3. Client
4. Product charter
5. PM owner
6. Current lifecycle stage
7. Linked Jira tickets
8. Linked Confluence documents
9. Summary of current status
10. Risks / blockers
11. Latest known engineering signal
12. Recommended next step
13. Pending decisions

### 3. Drafts

Purpose:

Artifact drafting from context.

Artifacts to support:

1. PRD
2. User stories
3. Acceptance criteria
4. API contract note
5. Sequence diagram
6. Effort-estimation skeleton
7. Leadership update
8. Client issue summary
9. 1:1 / IDP note

### 4. Reviews

Purpose:

Operational review and pre-grooming support.

Should support:

1. Grooming readiness view
2. Feature requests lacking clarity
3. Feature requests blocked by engineering
4. Aging asks
5. PM quality review
6. Prioritization support before engineering grooming

### 5. People

Purpose:

PM-management support.

Should support:

1. 1:1 notes
2. Feedback summaries
3. IDP draft support
4. Evidence log for PM performance patterns
5. Coaching prompts / recurring themes

---

## Recommended End-User Workflows

### Morning Workflow

1. Open Intervention Brief
2. Review items grouped by PM owner
3. Identify where director intervention is needed today
4. Resolve or annotate top issues
5. Generate follow-up or review drafts as needed

### During-Day Workflow

1. Open a feature request
2. Review linked Jira / Confluence / notes context
3. Ask AI to draft:
   - PRD
   - stories
   - summary
   - response
4. Review manually before exporting or writing back

### Pre-Grooming Workflow

1. Open Reviews
2. See all items by readiness / blocker severity
3. Identify what is ready for prioritization
4. Flag what lacks estimate / clarity / PM prep / engineering validation

### Leadership Update Workflow

1. Pull from feature request state, risks, and movement
2. Draft leadership monthly update
3. Review and edit manually
4. Then send through approved channel

### 1:1 Workflow

1. Record rough notes in People area
2. Generate feedback summary
3. Generate IDP draft in preferred structure
4. Review before storing as formal record

---

## Derived Functional Requirements

### Intake And Classification

The system should:

1. Capture a new feature request or issue
2. Tag source:
   - client escalation
   - PM ask
   - sales / RFP
   - implementation gap
   - bug / stability issue
   - engineering blocker
   - leadership request
3. Assign PM owner
4. Assign product charter
5. Assign client if relevant
6. Track current stage in lifecycle

### Lifecycle Tracking

The system should model stages similar to:

1. Incoming
2. BA / implementation grooming
3. PM exploration
4. Director review
5. Engineering / codebase validation
6. PRD / story drafting
7. Estimation
8. Prioritized
9. In delivery
10. Testing
11. Client update
12. UAT deploy
13. Prod deploy

### Risk And Blocker Intelligence

The system should identify:

1. Feature requests with no update in X days
2. Feature requests waiting on engineering beyond threshold
3. Feature requests with unclear requirements
4. Feature requests with client urgency but no owner action
5. PMs with too many active red items
6. Repeated misses or misinformation from engineering inputs
7. Stability requests competing with new-business work

### Drafting

The system should generate:

1. PRDs
2. User stories
3. Internal status updates
4. Leadership monthly updates
5. Client escalation summaries
6. PM feedback notes
7. IDP drafts

All based on:

1. linked context
2. templates
3. prior examples
4. current feature request state

### Quality Review

The system should help review PM outputs by checking:

1. clarity of problem statement
2. missing acceptance criteria
3. missing scenarios
4. missing engineering dependencies
5. incomplete estimate logic
6. poor structure versus existing PRD / user-story templates

---

## Artifact Template Requirement

The user explicitly stated:

1. All artifacts follow templates
2. This includes:
   - OKRs
   - PRDs
   - User Stories
   - Product updates
   - and likely other structured docs

Therefore template support is mandatory.

The system should:

1. store or reference template baselines
2. draft into those structures
3. validate completeness against those structures

---

## Recommended V1 / P0 Capability Set

### Must-Have

1. Daily intervention brief
2. PM blocker dashboard
3. Feature request workspace
4. PRD / user-story drafting
5. Leadership monthly product update draft support
6. Approval-gated output workflow

### Nice-To-Have But Secondary

1. Client escalation summarization
2. IDP / 1:1 drafting
3. PM performance evidence log
4. Advanced Teams ingestion

---

## Recommended Technical Architecture Direction

### Architecture Role

This should be implemented as a cross-tool orchestration layer.

### Initial Integration Targets

1. Jira API / exported views / synced ingest
2. Confluence pages / docs
3. Local Personal OS markdown / cache / assistant context
4. Manual Teams summary input for V1

### Recommended Behavior Model

1. Read and analyze from systems of record
2. Build a synthesized feature-request-centric model
3. Draft artifacts and summaries
4. Present approval-ready actions
5. Only write back when explicitly approved

### Not Recommended For V1

1. Autonomous writeback
2. Full Teams bot / ingestion dependency
3. Calendar-first interface
4. Generic productivity app abstraction

---

## Open Technical Considerations For Implementation

These are not fully answered by discovery, so implementers should decide carefully:

1. Whether feature requests should be stored locally as a normalized cache object merged from Jira / Confluence / local notes
2. How to reconcile partial verbal engineering updates with formal Jira truth
3. Whether PM owner mapping should come from Jira assignee, local config, or a manual roster
4. How templates should be stored:
   - local markdown
   - Confluence references
   - structured JSON schema
5. How much of Teams content should be manually pasted versus integrated later

Recommended default:

1. Normalize everything into a local feature-request cache layer
2. Treat Jira as canonical for execution metadata
3. Treat Confluence as canonical for requirements docs
4. Treat Personal OS as private overlay and intelligence layer
5. Add manual notes channel for verbal engineering truth and client escalation context

---

## Explicit Recommendations From Discovery

These recommendations were made during the dialogue and should be preserved:

1. The system should not be framed as a generic personal task dashboard
2. It should be reframed as a Product Control Tower / Director Of Product Control Tower
3. Feature request should be the top-level unit
4. V1 should focus on daily intervention, blockers, and drafting
5. Teams should not block V1
6. Approval-gated writeback is the correct default
7. Personal OS should become the private synthesis and orchestration layer above Jira and Confluence

---

## What Success Looks Like

Although the user did not provide a formal KPI list for this exact system, success can be inferred as:

1. Joydeep can immediately see where to intervene each morning
2. PM blockers become visible without manual chasing across multiple people
3. Status synthesis time reduces materially
4. PRD / story drafting becomes faster and more consistent
5. Leadership update preparation time drops
6. PM review burden becomes more structured and evidence-based
7. Cross-client ask overload becomes manageable through prioritization and visibility

---

## Confidence Note For Handoff

This document reflects the state of discovery when confidence reached approximately 97% that the core problem, user operating model, product direction, and V1 value concentration are understood well enough to move into implementation and parallel design/build work.

Remaining unknowns are implementation details, not primary product-definition gaps.

---

## Short Form Product Statement

Build an AI-powered Product Control Tower for a Director of Products in B2B lending infrastructure, centered on feature requests, grouped by PM owner and risk severity, reading from Jira and Confluence first, drafting structured artifacts and status summaries, and requiring explicit approval before any writeback or communication action.

