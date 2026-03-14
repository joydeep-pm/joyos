---
id: T02
parent: S02
milestone: M004
provides:
  - Role-aware template defaults for new Director-of-Products workspaces
key_files:
  - core/templates/AGENTS.md
  - core/templates/config.yaml
key_decisions:
  - The reusable templates should mirror the live Director-of-Products contract instead of preserving the old generic PM-task-system template
patterns_established:
  - Template defaults now encode operating goals, intervention-first planning, and a people-aware category model
observability_surfaces:
  - core template files
  - grep/diff on role-specific terms
duration: 35m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Align reusable templates with the role-specific contract

**Replaced the generic reusable templates with Director-of-Products defaults.**

## What Happened

The reusable `core/templates/AGENTS.md` file was rewritten to encode the same role-specific operating model introduced in S01: Director Intervention Briefs, Today’s Three, operating-goal alignment, and lightweight knowledge conventions for feature requests, meetings, people, leadership updates, and learnings.

`core/templates/config.yaml` was also retuned around the same model. It now includes a `people` category, stronger product-leadership keyword hints, operating-goal guidance, and daily planning defaults that favor intervention-first behavior with a three-item focus cap.

## Verification

- Ran `rg -n "Director of Products|Documentation|Stability|New Business|people|leadership|Feature-Requests|Learnings" core/templates/AGENTS.md core/templates/config.yaml`
- Reviewed `git diff -- core/templates/AGENTS.md core/templates/config.yaml`
- Confirmed the template defaults no longer push the old generic task-management framing.

## Diagnostics

Future agents should inspect:
- `core/templates/AGENTS.md` for the default assistant contract
- `core/templates/config.yaml` for category/priority/daily-planning defaults

## Deviations

None.

## Known Issues

The template tree still lacks scaffoldable starter files for the new `Knowledge/` subfolders; that remains for T03.

## Files Created/Modified

- `core/templates/AGENTS.md` — reusable Director-of-Products assistant template
- `core/templates/config.yaml` — role-aware config defaults for categories, priorities, and daily planning
