---
id: S01
parent: M006
milestone: M006
provides:
  - A durable meeting-to-artifact markdown contract, runbook, and examples for meeting follow-up processing
requires:
  - slice: none
    provides: none
affects:
  - S02
  - S03
key_files:
  - examples/workflows/meeting-followup.md
  - docs/runbooks/meeting-followup-runbook.md
  - examples/example_files/meeting-note-example.md
  - examples/example_files/meeting-followup-output-example.md
  - core/integrations/granola/README.md
key_decisions:
  - Start meeting intelligence by making the markdown contract crisp before adding deeper integrations or app surfaces
patterns_established:
  - Meetings should produce durable outputs across tasks, feature requests, people notes, learnings, and leadership inputs
observability_surfaces:
  - workflow/runbook/example markdown artifacts
  - grep over meeting-contract terminology
  - .gsd/milestones/M006/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M006/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M006/slices/S01/tasks/T03-SUMMARY.md
drill_down_paths:
  - .gsd/milestones/M006/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M006/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M006/slices/S01/tasks/T03-SUMMARY.md
duration: 2h
verification_result: passed
completed_at: 2026-03-14
---

# S01: Meeting-to-artifact markdown contract

**Established a durable markdown contract for turning meetings into tasks, blockers, feature-request updates, people-note updates, learnings, and leadership inputs.**

## What Happened

This slice made meeting intelligence real at the markdown-contract level. The existing meeting-followup workflow was expanded into a clearer contract that defines the required input shape, explicit output targets, routing rules, and processing order for one meeting note or transcript.

A dedicated runbook was added to give future agents a practical checklist for processing meetings consistently. Two end-to-end example artifacts were also added: one example meeting note and one example downstream output document showing how that meeting should be transformed into durable operating artifacts.

Finally, the Granola integration docs were aligned so optional transcript sync now clearly feeds the same meeting-followup contract and durable markdown targets.

## Verification

- Verified workflow/runbook terminology and output targets with targeted `rg` checks.
- Verified example files directly and confirmed they demonstrate the intended meeting-to-artifact transformation.
- Verified Granola README updates align with the meeting contract and current Knowledge structure.

## Requirements Advanced

- R001 — advanced daily intervention quality by defining how meeting-derived commitments and blockers can become durable artifacts.
- R003 — advanced blocker visibility by making meeting-derived blockers part of the durable operating model instead of static notes.

## Requirements Validated

- none yet at live/runtime level; this slice establishes the contract and examples only.

## New Requirements Surfaced

- The next slice should decide which durable outputs become first-class updates in the operating graph: tasks, people notes, feature requests, or all of them.

## Requirements Invalidated or Re-scoped

- none.

## Deviations

None.

## Known Limitations

- No automatic meeting-to-artifact transformation engine exists yet.
- No app surface yet exposes unresolved meeting commitments.
- `Knowledge/Transcripts/` vs `Knowledge/Meetings/` may need a clearer convention in a later slice.

## Follow-ups

- Add a concrete integration path from meeting outputs into the broader operating graph.
- Decide whether the next slice should be markdown-first integration or a small assistant/app review surface for unresolved meeting commitments.

## Files Created/Modified

- `examples/workflows/meeting-followup.md` — explicit meeting-followup contract
- `docs/runbooks/meeting-followup-runbook.md` — practical runbook for processing one meeting
- `examples/example_files/meeting-note-example.md` — synthetic meeting input example
- `examples/example_files/meeting-followup-output-example.md` — synthetic downstream output example
- `core/integrations/granola/README.md` — aligned transcript sync with meeting follow-up outputs

## Forward Intelligence

### What the next slice should know
- The contract is now clear enough that the next slice should stop talking abstractly about meetings and start wiring them into the operating graph.

### What's fragile
- The meeting contract is still a documentation/workflow seam only; without integration, drift can return between notes and actual follow-up behavior.

### Authoritative diagnostics
- `docs/runbooks/meeting-followup-runbook.md` plus the two meeting example files are the fastest way to understand the intended transformation.

### What assumptions changed
- Original assumption: the existing meeting-followup workflow might already be specific enough.
- What actually happened: a much clearer contract/runbook/example set was needed before any deeper integration work would be trustworthy.
