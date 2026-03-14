---
id: T02
parent: S03
milestone: M004
provides:
  - Truthful post-setup verification guidance for the generated markdown workspace
key_files:
  - docs/runbooks/setup-verification.md
  - README.md
key_decisions:
  - The markdown setup path should have an explicit artifact-driven verification runbook instead of relying on implied expectations
patterns_established:
  - Setup-oriented slices should leave behind a concrete verification document describing expected files, folders, and role-specific content
observability_surfaces:
  - docs/runbooks/setup-verification.md
  - README.md role-specific notes section
duration: 20m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Add first-run verification guidance for the generated workspace

**Added a setup verification runbook and linked it from the README.**

## What Happened

A new runbook was added at `docs/runbooks/setup-verification.md` describing exactly what should exist after setup: top-level files, role-specific Knowledge subfolders, expected guidance inside `AGENTS.md` and `GOALS.md`, and the most important failure signals.

`README.md` was also updated to point to this runbook from the role-specific notes section so the verification path is discoverable.

## Verification

- Ran `rg -n "setup verification|Feature-Requests|People|Learnings|GOALS.md|AGENTS.md" docs/runbooks/setup-verification.md README.md`
- Reviewed `git diff -- docs/runbooks/setup-verification.md README.md`
- Confirmed the runbook truthfully describes the current markdown/setup scaffold and does not claim any web-app proof.

## Diagnostics

Future agents should start with `docs/runbooks/setup-verification.md` when checking whether the markdown Personal OS scaffold was generated correctly.

## Deviations

None.

## Known Issues

The README diff also reflects prior role-specific changes from earlier slices; this task only added the runbook reference needed for setup verification.

## Files Created/Modified

- `docs/runbooks/setup-verification.md` — post-setup verification runbook for the markdown workspace
- `README.md` — linked the setup verification runbook from role-specific notes
