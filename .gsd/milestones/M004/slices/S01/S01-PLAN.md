# S01: Director-of-products role scaffolding and workflow uplift

**Goal:** Reframe the markdown-first Personal OS guidance around Joydeep's Director of Products operating model so daily planning, weekly review, and meeting follow-up workflows reflect intervention-driven product leadership instead of generic task management.
**Demo:** Reading the role/profile and workflow docs shows a coherent Director-of-Products operating system with Today’s Three, OKR-aware weekly review, meeting follow-up capture, and people/feature-request knowledge conventions that can guide both the markdown assistant and future web-app alignment.

## Must-Haves

- Rewrite the assistant/workflow documentation so it explicitly optimizes for Joydeep’s Director of Products role, OKRs, and recurring intervention patterns.
- Add director-specific workflow artifacts for meeting follow-up and 1:1 prep plus lightweight knowledge-structure conventions for people, feature requests, and learnings.

## Proof Level

- This slice proves: contract
- Real runtime required: no
- Human/UAT required: no

## Verification

- `git diff -- AGENTS.md README.md Knowledge/README.md examples/workflows/README.md examples/workflows/morning-standup.md examples/workflows/weekly-review.md examples/workflows/meeting-followup.md examples/workflows/one-on-one-prep.md docs/role-profiles/director-of-products.md examples/example_files/feature-request-example.md examples/example_files/people-note-example.md examples/example_files/weekly-review-example.md | sed -n '1,260p'`
- `rg -n "Director of Products|Today's Three|Documentation|Stability|New Business|meeting follow-up|1:1 prep|Learnings|Feature-Requests|People" AGENTS.md README.md Knowledge/README.md examples/workflows docs/role-profiles examples/example_files`

## Observability / Diagnostics

- Runtime signals: none
- Inspection surfaces: git diff and targeted ripgrep across updated markdown artifacts
- Failure visibility: missing role-specific terms, absent workflow files, or stale generic guidance visible directly in the docs
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: `requirements.md`, `build-plan.md`, existing workflow docs, Granola integration guidance
- New wiring introduced in this slice: documentation-level operating model that future setup/app work can consume
- What remains before the milestone is truly usable end-to-end: role-aware setup scaffolding and live web-app alignment still need later slices

## Tasks

- [x] **T01: Rewrite core assistant and planning guidance for the director role** `est:45m`
  - Why: The current assistant contract and core docs are still generic and do not encode Joydeep’s operating model, OKRs, or intervention-first daily guidance.
  - Files: `AGENTS.md`, `README.md`, `Knowledge/README.md`, `docs/role-profiles/director-of-products.md`
  - Do: Rewrite the assistant instructions to emphasize Director-of-Products behavior, Today’s Three, intervention prioritization, PM leadership, and markdown conventions; update the main README and Knowledge guidance; add a durable role profile doc that captures responsibilities, recurring inputs/outputs, and decision lenses from `requirements.md`.
  - Verify: `rg -n "Director of Products|Today's Three|Documentation|Stability|New Business|Feature-Requests|People|Learnings" AGENTS.md README.md Knowledge/README.md docs/role-profiles/director-of-products.md`
  - Done when: The repo’s core guidance reads as explicitly built for Joydeep’s role rather than a generic personal productivity assistant.
- [x] **T02: Upgrade daily and weekly workflows into director intervention loops** `est:35m`
  - Why: Morning planning and weekly review must produce intervention-grade guidance around blockers, PM ownership, and strategic OKRs instead of generic productivity prompts.
  - Files: `examples/workflows/morning-standup.md`, `examples/workflows/weekly-review.md`, `examples/workflows/README.md`
  - Do: Rewrite the morning standup workflow around a Director intervention brief and Today’s Three; expand weekly review to cover documentation/stability/new-business progress, recurring blocker patterns, PM coaching signals, and system learnings; update the workflow index so these paths are discoverable.
  - Verify: `rg -n "intervention|Today's Three|Documentation|Stability|New Business|PM|blocker|learning" examples/workflows/morning-standup.md examples/workflows/weekly-review.md examples/workflows/README.md`
  - Done when: The planning workflows clearly guide a director-level operating rhythm and no longer read like generic task prompts.
- [x] **T03: Add meeting, 1:1, and knowledge-structure scaffolds for continuity** `est:35m`
  - Why: Dex’s useful continuity ideas only help if this repo has explicit artifacts for meeting follow-up, PM 1:1 prep, and structured knowledge notes.
  - Files: `examples/workflows/meeting-followup.md`, `examples/workflows/one-on-one-prep.md`, `examples/example_files/feature-request-example.md`, `examples/example_files/people-note-example.md`, `examples/example_files/weekly-review-example.md`
  - Do: Add new workflow docs for meeting follow-up and PM 1:1 prep; add example markdown files showing feature-request notes, people notes, and a weekly review artifact aligned to the director operating model.
  - Verify: `rg -n "Meeting Follow-Up|1:1|Feature Request|coaching|follow-up|blocker|weekly review" examples/workflows/meeting-followup.md examples/workflows/one-on-one-prep.md examples/example_files`
  - Done when: The repo contains concrete scaffolds that operationalize meeting intelligence, people context, and reflection for Joydeep’s role.

## Files Likely Touched

- `AGENTS.md`
- `README.md`
- `Knowledge/README.md`
- `docs/role-profiles/director-of-products.md`
- `examples/workflows/morning-standup.md`
- `examples/workflows/weekly-review.md`
- `examples/workflows/README.md`
- `examples/workflows/meeting-followup.md`
- `examples/workflows/one-on-one-prep.md`
- `examples/example_files/feature-request-example.md`
- `examples/example_files/people-note-example.md`
- `examples/example_files/weekly-review-example.md`
