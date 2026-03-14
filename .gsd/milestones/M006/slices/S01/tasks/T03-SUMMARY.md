---
id: T03
parent: S01
milestone: M006
provides:
  - Alignment between the new meeting contract, existing Granola docs, and current Knowledge scaffolds
key_files:
  - core/integrations/granola/README.md
  - Knowledge/README.md
  - examples/workflows/meeting-followup.md
key_decisions:
  - Meeting intelligence should fit the current repo shape and optional Granola path instead of introducing a competing structure
patterns_established:
  - Optional transcript sync should feed the same meeting-followup contract and durable markdown targets
observability_surfaces:
  - `core/integrations/granola/README.md`
  - `Knowledge/README.md`
  - grep across meeting-related docs
duration: 25m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T03: Cross-check meeting contract against existing integrations and knowledge scaffolds

**Aligned the meeting contract with the current Granola integration path and Knowledge structure.**

## What Happened

The Granola integration docs were updated so synced meeting notes are now explicitly connected to the meeting follow-up workflow and its durable output targets. This keeps the optional transcript-sync path consistent with the new meeting intelligence contract instead of leaving Granola as a note-only import.

The resulting guidance now matches the current Knowledge structure and the new meeting-followup contract across the repo.

## Verification

- `rg -n "Granola|Knowledge/Meetings|Feature-Requests|People|Learnings" core/integrations/granola/README.md Knowledge/README.md examples/workflows/meeting-followup.md`
- Direct diff review of the Granola README updates

## Diagnostics

Future agents should inspect the Granola README when deciding how synced transcripts should flow into the rest of the operating graph.

## Deviations

None.

## Known Issues

Granola remains optional and transcript sync still lands under `Knowledge/Transcripts/`, so future slices may want to clarify how that relates to `Knowledge/Meetings/` in practice.

## Files Created/Modified

- `core/integrations/granola/README.md` — aligned transcript sync with the meeting follow-up contract
- `examples/workflows/meeting-followup.md` — cross-checked against current repo structure
