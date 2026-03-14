---
id: T01
parent: S01
milestone: M004
provides:
  - Director-of-Products-specific core guidance for the markdown Personal OS
key_files:
  - AGENTS.md
  - README.md
  - Knowledge/README.md
  - docs/role-profiles/director-of-products.md
key_decisions:
  - Reframe the markdown assistant around Joydeep’s Director-of-Products operating model instead of generic personal productivity
patterns_established:
  - Encode role goals, intervention-first planning, and lightweight knowledge conventions directly in core docs before changing setup or app flows
observability_surfaces:
  - grep/diff over markdown artifacts
  - docs/role-profiles/director-of-products.md
duration: 45m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Rewrite core assistant and planning guidance for the director role

**Rewrote the core markdown guidance to operate as a Director-of-Products system for Joydeep.**

## What Happened

The generic assistant contract was replaced with a role-specific one that centers Joydeep’s operating goals: Documentation, Stability, New Business, and Team Leadership. `AGENTS.md` now prioritizes Director Intervention Briefs, Today’s Three, blocker-aware daily guidance, and durable knowledge structures for feature requests, meetings, people, leadership updates, and learnings.

The repo-level `README.md` was also rewritten to position the project as a local-first operating system for a Director of Products rather than a generic task manager. `Knowledge/README.md` now defines a concrete knowledge model for feature requests, meetings, people, leadership updates, grooming notes, and learnings. A new durable role profile was added at `docs/role-profiles/director-of-products.md` to capture Joydeep’s responsibilities, recurring inputs/outputs, decision lenses, and operating rhythm from `requirements.md`.

## Verification

- Ran `rg -n "Director of Products|Today's Three|Documentation|Stability|New Business|Feature-Requests|People|Learnings" AGENTS.md README.md Knowledge/README.md docs/role-profiles/director-of-products.md`
- Reviewed `git diff -- AGENTS.md README.md Knowledge/README.md docs/role-profiles/director-of-products.md`
- Confirmed the updated docs no longer read as generic productivity guidance and instead reflect the Director-of-Products operating model.

## Diagnostics

Future agents should first read:
- `AGENTS.md` for runtime assistant behavior
- `docs/role-profiles/director-of-products.md` for the durable role contract
- `Knowledge/README.md` for folder/note conventions

Use ripgrep on the role terms above to confirm the docs remain aligned if later edits drift.

## Deviations

None.

## Known Issues

The role-aware setup scaffolding and workflow/example files are not updated yet; those remain for T02 and T03.

## Files Created/Modified

- `AGENTS.md` — rewritten assistant contract for Joydeep’s Director-of-Products operating model
- `README.md` — repositioned the repo around intervention-first product leadership workflows
- `Knowledge/README.md` — defined role-specific knowledge structures and note conventions
- `docs/role-profiles/director-of-products.md` — added a durable role profile derived from `requirements.md`
