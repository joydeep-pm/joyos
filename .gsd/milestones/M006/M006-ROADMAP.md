# M006: Meeting intelligence and follow-up orchestration

**Vision:** Make meetings a first-class execution input by turning notes and transcripts into durable follow-ups, blockers, people context, and feature-request updates that feed the Director-of-Products operating model.

## Success Criteria

- Joydeep can process a meeting and get structured follow-ups instead of a static note.
- Meeting-derived action items and blockers can connect to the existing markdown operating model.
- At least one visible workflow or surface proves that unresolved meeting commitments can be inspected later.

## Key Risks / Unknowns

- Raw meeting notes may be too inconsistent without a small normalization convention.
- Overly aggressive automation could create task noise.
- App work may be premature before the meeting-to-artifact model is stable.

## Proof Strategy

- meeting follow-up can be expressed as a durable markdown contract → retire in S01 by defining and proving the meeting-to-artifact model and templates/workflows
- meeting outputs can update the broader operating graph → retire in S02 by connecting meetings to tasks, people, feature requests, or learnings
- meeting-derived obligations can be surfaced for intervention → retire in S03 by proving a visible review/check workflow, likely in the app or assistant surface

## Verification Classes

- Contract verification: markdown/workflow/template and transformation logic checks
- Integration verification: durable updates to the existing operating artifacts
- Operational verification: inspectable follow-up state from recent meetings
- UAT / human verification: walkthrough of meeting note → follow-up outputs → later inspection

## Milestone Definition of Done

This milestone is complete only when all are true:

- meeting follow-up is treated as a durable operating workflow rather than a note-only activity
- meeting outputs connect to the current Personal OS model in a way that survives the meeting itself
- there is a clear inspection path for unresolved meeting commitments

## Requirement Coverage

- Covers: R001, R003
- Partially covers: R008
- Leaves for later: any deeper external/system-of-record automation triggered by meetings
- Orphan risks: none

## Slices

- [x] **S01: Meeting-to-artifact markdown contract** `risk:medium` `depends:[]`
  > After this: the repo has a clear, reusable contract for turning meeting notes into action items, blockers, and durable context updates.
- [x] **S02: Meeting continuity integration** `risk:medium` `depends:[S01]`
  > After this: meetings can update the operating graph through tasks, people notes, feature-request notes, or learnings in a consistent way.
- [x] **S03: Visible review of unresolved meeting commitments** `risk:medium` `depends:[S01,S02]`
  > After this: there is a concrete way to inspect meeting-derived open loops later instead of losing them in static notes.
