---
estimated_steps: 4
estimated_files: 1
---

# T01: Auto-create role-specific Knowledge scaffolds in setup

**Slice:** S03 — Minimal markdown runtime proof
**Milestone:** M004

## Description

Make the setup script materialize the most important Director-of-Products knowledge folders and starter README scaffolds so a fresh workspace matches the documented operating model without extra manual steps.

## Steps

1. Read the current `setup.sh` flow and identify where workspace directories and starter files are created.
2. Add creation logic for `Knowledge/Feature-Requests`, `Knowledge/People`, and `Knowledge/Learnings`.
3. Copy the matching starter README files from `core/templates/Knowledge/` when they do not already exist, preserving user-created files on rerun.
4. Verify the script text clearly reflects the new scaffold behavior and remains idempotent.

## Must-Haves

- [ ] The key role-specific Knowledge subfolders are created during setup.
- [ ] Starter README files are copied only when missing, never overwriting user content.

## Verification

- `rg -n "Feature-Requests|People|Learnings|preserving your version|Copied:" setup.sh`
- `git diff -- setup.sh | sed -n '1,220p'`

## Observability Impact

- Signals added/changed: setup terminal output for created folders and copied/preserved scaffold files
- How a future agent inspects this: read `setup.sh` and inspect the emitted print messages
- Failure state exposed: missing folder/file creation or overwrite-unsafe behavior remains visible in the script logic

## Inputs

- `setup.sh` — current setup flow
- `core/templates/Knowledge/*` — scaffold sources for copied README files

## Expected Output

- `setup.sh` — idempotent setup logic that creates and seeds the role-specific Knowledge folder structure
