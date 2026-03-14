---
id: T01
parent: S03
milestone: M004
provides:
  - Setup-time creation and seeding of the key role-specific Knowledge folders
key_files:
  - setup.sh
key_decisions:
  - A fresh workspace should materialize Feature Requests, People, and Learnings during setup instead of requiring manual folder creation
patterns_established:
  - Setup remains idempotent by copying scaffold README files only when missing and preserving existing user files on rerun
observability_surfaces:
  - setup.sh print messages for created directories and copied/preserved README files
duration: 40m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Auto-create role-specific Knowledge scaffolds in setup

**Updated setup to create and seed the key role-specific Knowledge subfolders automatically.**

## What Happened

`setup.sh` now includes a `Seeding Knowledge Structure` step that creates `Knowledge/Feature-Requests`, `Knowledge/People`, and `Knowledge/Learnings` during setup. For each folder, the script copies the corresponding template README when the file is missing and preserves the user’s existing version on reruns.

This closes the most obvious gap in the markdown setup flow: the documented knowledge model is now actually materialized by setup instead of being left as a manual post-setup instruction.

## Verification

- Ran `rg -n "Knowledge/Feature-Requests|Knowledge/People|Knowledge/Learnings|Copied: .*README|preserving your version|Seeding Knowledge Structure" setup.sh`
- Reviewed `git diff -- setup.sh`
- Confirmed the new logic is additive and idempotent.

## Diagnostics

Future agents should inspect the `Seeding Knowledge Structure` block in `setup.sh` and the `print_success` / `print_info` messages emitted for copied or preserved README files.

## Deviations

None.

## Known Issues

This task proves the scaffold path by code inspection, not by executing the setup script end to end.

## Files Created/Modified

- `setup.sh` — now creates and seeds role-specific Knowledge subfolders during setup
