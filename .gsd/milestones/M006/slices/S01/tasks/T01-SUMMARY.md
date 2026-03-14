---
id: T01
parent: S01
milestone: M006
provides:
  - A crisp meeting-to-artifact markdown contract for turning meeting inputs into durable outputs
key_files:
  - examples/workflows/meeting-followup.md
  - docs/runbooks/meeting-followup-runbook.md
key_decisions:
  - Meeting follow-up should be treated as a contract with required inputs, explicit output targets, and a stable processing order
patterns_established:
  - Meeting processing should route outputs into tasks, feature requests, people notes, learnings, and leadership inputs instead of treating all points as tasks
observability_surfaces:
  - `examples/workflows/meeting-followup.md`
  - `docs/runbooks/meeting-followup-runbook.md`
duration: 40m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Tighten the meeting note and follow-up contract

**Reworked the meeting-followup workflow into a clearer meeting-to-artifact contract.**

## What Happened

The meeting follow-up workflow now explicitly defines the expected input shape, output targets, processing order, and routing rules for meeting-derived artifacts. It now makes clear that the goal is not to turn every meeting into a task list, but to decide which outputs become tasks, feature-request updates, people-note updates, learning notes, or leadership/status inputs.

A dedicated runbook was also added so a future agent can process one meeting note or transcript in a consistent way without reinterpreting the workflow each time.

## Verification

- `rg -n "Action items|Risks|Follow-ups|Feature-Requests|People|Learnings" examples/workflows/meeting-followup.md docs/runbooks/meeting-followup-runbook.md`
- Direct read/diff review of both files

## Diagnostics

Future agents should start with `docs/runbooks/meeting-followup-runbook.md` for the practical checklist and `examples/workflows/meeting-followup.md` for the durable contract.

## Deviations

None.

## Known Issues

This task defines the contract but does not yet automate updates into the broader operating graph.

## Files Created/Modified

- `examples/workflows/meeting-followup.md` — explicit meeting-to-artifact contract
- `docs/runbooks/meeting-followup-runbook.md` — practical processing checklist for one meeting
