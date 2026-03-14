---
id: S02
parent: M004
milestone: M004
provides:
  - Role-aware setup and reusable templates aligned to the Director-of-Products markdown operating model
requires:
  - slice: S01
    provides: Director-of-Products operating contract, workflows, and knowledge conventions
affects:
  - S03
key_files:
  - setup.sh
  - core/templates/AGENTS.md
  - core/templates/config.yaml
  - core/templates/Knowledge/Feature-Requests/README.md
  - core/templates/Knowledge/People/README.md
  - core/templates/Knowledge/Learnings/README.md
key_decisions:
  - Setup and templates should inherit the S01 role-specific operating model rather than preserving generic PM/task-system defaults
patterns_established:
  - Generated workspaces should scaffold operating goals, intervention-first planning, and durable continuity notes by default
observability_surfaces:
  - setup.sh
  - core/templates/*
  - .gsd/milestones/M004/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M004/slices/S02/tasks/T02-SUMMARY.md
  - .gsd/milestones/M004/slices/S02/tasks/T03-SUMMARY.md
drill_down_paths:
  - .gsd/milestones/M004/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M004/slices/S02/tasks/T02-SUMMARY.md
  - .gsd/milestones/M004/slices/S02/tasks/T03-SUMMARY.md
duration: 2h
verification_result: passed
completed_at: 2026-03-14
---

# S02: Role-aware setup and template alignment

**Aligned setup and reusable templates so new workspaces scaffold the Director-of-Products operating model instead of the old generic defaults.**

## What Happened

This slice took the operating contract defined in S01 and pushed it into the parts of the repo that actually create fresh workspaces. `setup.sh` was rewritten around the questions and output structure that matter for Joydeep’s role: current charter/scope, what success looks like across Documentation, Stability, and New Business, quarterly priorities, leadership rhythm, and current intervention pressure.

The generated `GOALS.md` template now reinforces the intended operating model by defining the four operating goals explicitly, adding a Today’s Three rule, and using a priority framework oriented around leadership urgency, blocker removal, and high-leverage interventions.

The reusable template files were then updated to match. `core/templates/AGENTS.md` now carries the role-aware assistant contract, and `core/templates/config.yaml` now includes a people-aware category model, operating-goal defaults, and daily planning settings that prefer intervention-first behavior. Finally, starter README scaffolds were added for `Feature-Requests`, `People`, and `Learnings` so the documented knowledge structure is available directly from the template tree.

## Verification

- Verified setup language and GOALS generation in `setup.sh` with targeted `rg` checks and diff review.
- Verified the role-specific terms and defaults in:
  - `core/templates/AGENTS.md`
  - `core/templates/config.yaml`
- Verified the new scaffoldable knowledge guidance under:
  - `core/templates/Knowledge/Feature-Requests/README.md`
  - `core/templates/Knowledge/People/README.md`
  - `core/templates/Knowledge/Learnings/README.md`

## Requirements Advanced

- R001 — advanced the daily intervention brief concept by making setup and template defaults scaffold it into new workspaces.
- R003 — advanced continuity and blocker-awareness by templating people, learnings, and feature-request note structures that feed director visibility.

## Requirements Validated

- R001 — validated at the setup/template contract level because a fresh workspace now inherits the intervention-first operating model by default.

## New Requirements Surfaced

- Setup may later need to auto-create the new `Knowledge/` subfolders so the starter README files become active immediately on first run.

## Requirements Invalidated or Re-scoped

- none — this slice followed the user-directed markdown/setup alignment path established after S01 re-scoped the milestone.

## Deviations

None.

## Known Limitations

- `setup.sh` still only creates `Tasks/` and `Knowledge/`; it does not yet auto-create the new `Knowledge/Feature-Requests/`, `Knowledge/People/`, or `Knowledge/Learnings/` folders.
- No live runtime or browser flow has been updated yet; this slice remains markdown/setup focused.
- The original M004 vision around orchestration in the web app is still deferred.

## Follow-ups

- Decide whether S03 should add a minimal generated-workspace proof for the markdown OS or formally pivot back to web-app orchestration work using the new role contract as source material.
- Optionally teach `setup.sh` to create the role-specific `Knowledge/` subfolders automatically.

## Files Created/Modified

- `setup.sh` — Director-of-Products setup flow and GOALS generator
- `core/templates/AGENTS.md` — reusable role-aware assistant template
- `core/templates/config.yaml` — role-aware config defaults for categories, priorities, and planning
- `core/templates/Knowledge/Feature-Requests/README.md` — starter scaffold for feature-request notes
- `core/templates/Knowledge/People/README.md` — starter scaffold for people notes
- `core/templates/Knowledge/Learnings/README.md` — starter scaffold for learnings notes

## Forward Intelligence

### What the next slice should know
- The markdown OS is now coherent both in live docs and in scaffold defaults; future work should preserve this contract instead of partially reverting to generic templates.

### What's fragile
- `setup.sh` describes and generates the role model, but it still does not auto-create the new knowledge subfolders, so the on-disk scaffold is one step behind the docs.

### Authoritative diagnostics
- `setup.sh` and `core/templates/AGENTS.md` are now the most authoritative source for what a fresh workspace will become.

### What assumptions changed
- Original assumption: M004 would continue directly into web-app orchestration after S01.
- What actually happened: the user wanted the Director-of-Products markdown OS made real first, so S02 extended that role-specific contract into setup and template scaffolding.
