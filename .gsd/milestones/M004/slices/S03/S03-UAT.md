# S03: Minimal markdown runtime proof — UAT

**Milestone:** M004
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: this slice proves setup/path scaffolding and verification guidance rather than a running UI.

## Preconditions

- The updated `setup.sh`, template Knowledge README files, and `docs/runbooks/setup-verification.md` exist.

## Smoke Test

Read `setup.sh` and confirm there is an explicit `Seeding Knowledge Structure` step that creates the role-specific Knowledge folders.

## Test Cases

### 1. Setup scaffold creation

1. Open `setup.sh`.
2. Find the `Seeding Knowledge Structure` section.
3. **Expected:** The script creates `Knowledge/Feature-Requests`, `Knowledge/People`, and `Knowledge/Learnings` and copies starter README files only when missing.

### 2. Verification path discoverability

1. Open `README.md`.
2. Confirm the role-specific notes section links to `docs/runbooks/setup-verification.md`.
3. **Expected:** A future user or agent can discover how to verify the generated scaffold.

### 3. Runbook correctness

1. Open `docs/runbooks/setup-verification.md`.
2. Compare it with the current repo files and setup behavior.
3. **Expected:** The runbook accurately describes the current markdown/setup scaffold and does not claim any web-app proof.

## Edge Cases

### Rerun safety

1. Read the scaffold copy logic in `setup.sh`.
2. **Expected:** Existing user README files are preserved rather than overwritten.

## Failure Signals

- The role-specific Knowledge folders are still only documented, not created by setup.
- The setup runbook is missing or not linked from the README.
- The runbook claims live runtime or web-app behavior that this slice did not prove.

## Requirements Proved By This UAT

- R001 — proves the markdown setup path now materializes the role-specific intervention-first workspace.

## Not Proven By This UAT

- No browser flow or web-app behavior is proven.
- The setup script is not executed in a clean temporary workspace in this slice.

## Notes for Tester

The code and docs are now consistent for the markdown Personal OS. The remaining truth gap is milestone naming and future direction, not the generated workspace scaffold itself.
