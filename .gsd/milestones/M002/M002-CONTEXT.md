# M002: People management intelligence — Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

## Project Description

This milestone extends the Product Control Tower from feature-request decision support into a people-management operating layer for Joydeep’s PM team. It should help Joydeep prepare for 1:1s, synthesize coaching evidence from the same execution context already tracked in the system, and draft feedback or IDP material without turning Personal OS into a formal system of record for people-management decisions.

## Why This Milestone

The current product now covers intervention, review, grooming readiness, and approval-gated drafting around feature requests. The next user-value gap is recurring PM management work: 1:1 prep, feedback synthesis, coaching evidence, and development-plan drafting. Repo evidence shows early placeholders already exist in `web/app/people/page.tsx`, `web/lib/control-tower/people-engine.ts`, and `web/lib/control-tower/people-types.ts`, but they are still mock-driven and disconnected from assembled runtime data. M002 should turn that placeholder area into a real intelligence layer that reuses the feature-request operating seams proven in M001.

## User-Visible Outcome

### When this milestone is complete, the user can:

- open a real people-management workspace and see which PMs need attention, why they need it, and what evidence supports that assessment
- generate 1:1 prep and draft feedback/IDP material from live PM portfolio context while keeping any formal storage or outward sharing approval-gated

### Entry point / environment

- Entry point: local Next.js web app in `web/`, likely centered on `/people`
- Environment: local dev and browser
- Live dependencies involved: existing feature-request cache, assembled control-tower data, local overlay persistence, approval-gated drafting flows

## Completion Class

- Contract complete means: PM profile, evidence, coaching summary, and people-draft contracts exist with tests and stable serialization shapes
- Integration complete means: the people workspace uses real assembled data rather than mock PMs and can generate 1:1 prep and feedback/IDP drafts from that data
- Operational complete means: any formal people note storage or outward sharing remains draft-only or approval-gated, with inspectable persisted state and failure diagnostics

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- Joydeep can open the people workspace and identify which PMs need a 1:1 or coaching attention based on real synthesized portfolio evidence
- Joydeep can open a PM detail or equivalent review surface, inspect evidence and current development signals, and draft 1:1 prep plus feedback/IDP content from live context
- the assembled app preserves the trust boundary by keeping people-management outputs private or draft-only until explicitly approved

## Risks and Unknowns

- Existing people-management code may be too placeholder-heavy to reuse directly — if the current types and page are mock-shaped, M002 may need a cleaner assembled model
- PM evidence derived only from feature-request data may be too shallow for useful coaching — if the rubric is weak, the milestone will not reduce prep effort
- People-management storage boundaries may be ambiguous — storing director notes, feedback drafts, and formal records incorrectly could violate the overlay and approval constraints

## Existing Codebase / Prior Art

- `web/app/people/page.tsx` — existing mock people-management page with placeholder 1:1 prep and IDP draft generation
- `web/lib/control-tower/people-engine.ts` — current PM evidence extraction and 1:1 overdue helpers based on feature-request data
- `web/lib/control-tower/people-types.ts` — draft PM profile, 1:1 note, IDP feedback, and performance summary types
- `web/lib/control-tower/feature-request-assembler.ts` — authoritative server-side seam for enriched feature-request state from M001
- `web/components/artifacts/ArtifactViewer.tsx` and artifact templates — existing draft presentation path, including `idp_feedback`
- `build-plan.md` — identifies people-management support as the next value-bearing workstream with 1:1 notes, feedback synthesis, IDP drafting, and evidence logs
- `requirements.md` — source discovery notes for 1:1 workflow, feedback summary generation, and IDP draft support

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R201 — directly implements the PM people-management operating layer
- R007 — must preserve approval-gated behavior for any formal feedback storage or sharing path
- R008 — must keep Personal OS as the private overlay rather than a new formal HR system of record
- R002 — should reuse the assembled control-tower model where people-management views depend on live feature-request context

## Scope

### In Scope

- real PM portfolio and coaching evidence synthesis from live control-tower data
- people workspace UI for PM attention status, 1:1 readiness, and evidence review
- draft generation for 1:1 prep and PM feedback/IDP artifacts from assembled context
- private overlay persistence for people-management drafts or notes if needed
- approval-gated treatment for any formal people-management storage or outward sharing path

### Out of Scope / Non-Goals

- autonomous storage of formal performance records without approval
- replacing HR, spreadsheet, or official performance-management systems
- broad writeback into Jira, Confluence, or communication channels beyond existing approved draft paths
- unrelated feature-request intervention enhancements unless they are required as direct inputs to people-management intelligence

## Technical Constraints

- preserve the existing feature-request-centric control-tower architecture while adding a PM-oriented operating layer on top
- reuse assembled server-side seams where people workflows depend on runtime feature-request state
- keep people-management outputs private, local-first, and approval-gated for any formal record transition
- avoid mock-only proof; milestone completion must exercise the live browser path with real synthesized context

## Integration Points

- feature-request cache and assembled state — source for PM portfolio evidence, blockers, delivery signals, and development patterns
- people-management page and UI components — runtime presentation layer for coaching status and draft flows
- artifact generation/viewer path — delivery surface for 1:1 prep and IDP/feedback drafts
- local overlay persistence — likely storage for private notes, drafts, or review metadata if durable people state is added
- approval-gated comms or future formal-storage envelope — constraint boundary for any share/save action

## Open Questions

- what is the authoritative PM identity source in the current dataset — likely `pmOwner` on feature requests, but this may need normalization beyond the placeholder `PMProfile` shape
- whether M002 should persist raw 1:1 notes, only derived summaries/drafts, or both — this affects the overlay contract and approval boundary
- whether the existing `idp_feedback` artifact template is sufficient for live drafting or needs restructuring around real evidence and approval semantics
