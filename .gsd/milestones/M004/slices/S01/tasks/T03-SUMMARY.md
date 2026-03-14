---
id: T03
parent: S01
milestone: M004
provides:
  - Meeting follow-up, 1:1 prep, and example markdown scaffolds for director-role continuity work
key_files:
  - examples/workflows/meeting-followup.md
  - examples/workflows/one-on-one-prep.md
  - examples/example_files/feature-request-example.md
  - examples/example_files/people-note-example.md
  - examples/example_files/weekly-review-example.md
key_decisions:
  - Add continuity-oriented workflow and note scaffolds before changing setup so the role model is concrete and inspectable
patterns_established:
  - Meetings should update tasks, people notes, feature-request notes, and learnings instead of remaining static transcripts
observability_surfaces:
  - workflow/example markdown files
  - grep over continuity and coaching terms
duration: 35m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T03: Add meeting, 1:1, and knowledge-structure scaffolds for continuity

**Added continuity workflows and example markdown artifacts for meetings, people, feature requests, and weekly review.**

## What Happened

Two new workflows were added. `examples/workflows/meeting-followup.md` now shows how to turn meeting notes or synced transcripts into action items, blocker visibility, feature-request updates, people-note updates, and leadership/status inputs. `examples/workflows/one-on-one-prep.md` now shows how to prepare PM 1:1s using tasks, people notes, blockers, and recent evidence.

Three example files were also added so the role model is concrete rather than purely conceptual: a feature-request note example, a people-note example for a PM, and a weekly-review example artifact aligned to Documentation, Stability, New Business, and Team Leadership.

## Verification

- Ran `rg -n "Meeting Follow-Up|1:1|Feature Request|coaching|follow-up|blocker|weekly review" examples/workflows/meeting-followup.md examples/workflows/one-on-one-prep.md examples/example_files`
- Reviewed the new files directly and confirmed they match the director operating model and workflow language introduced in T01/T02.

## Diagnostics

Future agents should inspect:
- `examples/workflows/meeting-followup.md` when converting meetings into execution updates
- `examples/workflows/one-on-one-prep.md` before PM coaching or support prep
- `examples/example_files/*` for the intended note shapes and language patterns

If future docs drift, grep for `follow-up`, `coaching`, `Feature Request`, and `1:1` across the new files.

## Deviations

None.

## Known Issues

The setup script and reusable core templates still do not scaffold these role-specific files automatically. That remains for a later pass.

## Files Created/Modified

- `examples/workflows/meeting-followup.md` — workflow for converting meetings into tasks and durable knowledge updates
- `examples/workflows/one-on-one-prep.md` — workflow for PM 1:1 preparation and follow-through
- `examples/example_files/feature-request-example.md` — example durable feature-request note
- `examples/example_files/people-note-example.md` — example PM people note
- `examples/example_files/weekly-review-example.md` — example weekly review artifact aligned to the director operating model
