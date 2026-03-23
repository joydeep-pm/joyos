@AGENTS.md

# Purpose

This repo is evolving from a local-first Personal OS into a Product Control Tower for a Director of Products in B2B lending infrastructure. The primary user is Joydeep Sarkar at M2P Fintech. The system should help him decide where to intervene, track PM and engineering blockers, and draft structured product artifacts from feature-request context.

# Repo Map

1. `requirements.md`
The complete discovery and product-definition document. Read this first for business context and confirmed user needs.

2. `build-plan.md`
The implementation plan for the next product phase. Use this for execution sequencing.

3. `docs/architecture.md`
System overview, repo boundaries, and where core truth lives.

4. `docs/decisions/`
Architecture and product decisions that should not be rediscovered in prompts.

5. `docs/runbooks/`
Execution guidance, handoff notes, and developer workflows.

6. `web/`
The Next.js application. This is where most code changes should land.

7. `Tasks/`, `Knowledge/`, `GOALS.md`, `BACKLOG.md`
User-owned markdown content. Treat these as canonical personal data, not disposable fixture files.

# Rules

1. Feature request is the primary product unit. Do not reduce this system to a generic task planner.
2. Keep write actions approval-gated. Drafting and analysis can be automatic; changing commitments, priorities, client communications, Jira state, Confluence state, or people records must require explicit approval.
3. Jira is the execution system of record. Confluence is the requirements-doc system of record. This repo is the private orchestration and synthesis layer.
4. Preserve the existing local-first data model unless a change is explicitly required.
5. Do not silently rewrite user data in `Tasks/`, `Knowledge/`, `GOALS.md`, or `BACKLOG.md`.

# Commands

From `web/`:

1. `npm run typecheck`
2. `npm run test`
3. `npm run build`

Run all three before closing substantial work.

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

