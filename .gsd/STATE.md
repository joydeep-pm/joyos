# GSD State

**Active Milestone:** M015
**Active Slice:** S01
**Active Task:** Planning
**Phase:** M015 planned and ready to execute
**Next Action:** Build the structured strategy command-center data model and wire roadmap/deep-dive/AOP/risk sections into `/strategy`.

## Recent Decisions

- Preserve Jira as execution truth, Confluence as documentation truth, and Personal OS as the orchestration overlay
- Approval envelopes are the shared governing seam for approval-gated automation
- Route-backed persisted state is the source of truth after approval-envelope transitions
- The live `/assistant` UI must only create comms approval envelopes from already-approved drafts
- M003 is complete and future orchestration work should build on the shipped approval-envelope lifecycle, audit model, and browser verification pattern

## Blockers

- None
