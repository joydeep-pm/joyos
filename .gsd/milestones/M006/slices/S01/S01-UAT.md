# S01: Meeting-to-artifact markdown contract — UAT

**Milestone:** M006
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: this slice establishes the meeting intelligence contract, examples, and runbook rather than a running app feature.

## Preconditions

- The new workflow, runbook, and example files exist in the repo.
- The Granola integration docs are available for comparison.

## Smoke Test

Read `examples/workflows/meeting-followup.md` and confirm it now clearly states what one meeting should produce.

## Test Cases

### 1. Contract clarity

1. Open `examples/workflows/meeting-followup.md`.
2. Confirm it includes a required input contract and explicit output targets.
3. **Expected:** A future agent can tell exactly how to process one meeting into durable artifacts.

### 2. Example transformation

1. Open `examples/example_files/meeting-note-example.md`.
2. Open `examples/example_files/meeting-followup-output-example.md`.
3. **Expected:** The second file clearly reads like the result of processing the first through the meeting-followup contract.

### 3. Integration-path consistency

1. Open `core/integrations/granola/README.md`.
2. Confirm it now references routing synced meeting notes into tasks, feature requests, people notes, or learnings.
3. **Expected:** Optional transcript sync is aligned to the same contract as manual meeting processing.

## Edge Cases

### Ambiguous meeting notes

1. Read the contract sections on missing or weak input fields.
2. **Expected:** The workflow tells the agent to call out ambiguity instead of inventing missing facts.

## Failure Signals

- The meeting workflow still reads like a loose suggestion instead of a contract.
- The examples do not show durable outputs beyond a vague summary.
- Granola remains documented as note-only sync with no follow-up path.

## Requirements Proved By This UAT

- R001 — proves the repo now has a durable meeting-to-follow-up contract supporting daily intervention quality.
- R003 — proves meeting-derived blockers can now be expressed as durable markdown outputs.

## Not Proven By This UAT

- No automatic transformation engine is proven.
- No app-facing meeting review surface is proven.

## Notes for Tester

This slice intentionally stops at the markdown contract layer. The next slice should integrate these meeting outputs into the broader operating graph or a visible review surface.
