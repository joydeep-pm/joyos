---
id: S03
parent: M009
milestone: M009
provides:
  - Quarterly Product Deck and Product Factsheet refresh reminders surfaced and resolvable through the Assistant workflow
requires:
  - slice: S01
    provides: Roadmap comms taxonomy and reminder-first collateral scope
  - slice: S02
    provides: Roadmap drafting through the existing artifact workflow
affects:
  - none
key_files:
  - web/lib/assistant/collateral-reminder-engine.ts
  - web/app/api/assistant/collateral-reminders/route.ts
  - web/app/api/assistant/collateral-reminders/[id]/resolve/route.ts
  - web/lib/client-api.ts
  - web/app/assistant/page.tsx
  - web/tests/assistant/collateral-reminder-engine.test.ts
  - web/tests/assistant-page-collateral-reminders.test.tsx
key_decisions:
  - Model quarterly collateral maintenance as a dedicated reminder engine instead of mixing it into drift alerts
  - Hide resolved reminders from default reads while preserving them in persisted state for inspection
patterns_established:
  - New Assistant reminder workflows should use cache-backed engines, typed client helpers, dedicated routes, and focused UI tests for populated, empty, and resolved states
observability_surfaces:
  - .cache/assistant-collateral-reminders.json
  - GET /api/assistant/collateral-reminders
  - POST /api/assistant/collateral-reminders/[id]/resolve
  - tests/assistant/collateral-reminder-engine.test.ts
  - tests/assistant-page-collateral-reminders.test.tsx
drill_down_paths:
  - .gsd/milestones/M009/slices/S03/tasks/T01-SUMMARY.md
  - .gsd/milestones/M009/slices/S03/tasks/T02-SUMMARY.md
  - .gsd/milestones/M009/slices/S03/tasks/T03-SUMMARY.md
duration: 1h20m
verification_result: passed
completed_at: 2026-03-15
---

# S03: Quarterly collateral reminders

**Made quarterly Product Deck and Product Factsheet refresh work visible and resolvable in the Assistant workflow.**

## What Happened

S03 completed the reminder half of M009. A dedicated collateral reminder engine now seeds a lightweight quarterly inventory for Product Deck and Product Factsheet refreshes by vertical, derives due/upcoming/overdue reminders from quarterly cadence, and persists reminder state in the assistant cache.

That reminder data is exposed through dedicated assistant routes and surfaced in a new `Quarterly collateral reminders` section on `/assistant`. The UI shows asset type, vertical, quarter label, due timing, and refresh history, plus an explicit empty state when no reminder is currently due. The slice also added a reminder resolution loop so handled reminders disappear from default reads while remaining inspectable in persisted state.

## Verification

- `cd web && npm run test -- --run tests/assistant/collateral-reminder-engine.test.ts tests/assistant-page-collateral-reminders.test.tsx`
- `cd web && npm run typecheck`

## Requirements Advanced

- M009 quarterly collateral refresh reminder requirement — now operationally visible in the Assistant workflow instead of relying on memory.

## Requirements Validated

- M009 milestone requirement that quarterly Product Deck / Product Factsheet refresh work becomes visible through reminders or review surfaces.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

none

## Known Limitations

- The reminder inventory is still locally seeded rather than derived from a dedicated roadmap/collateral source of truth.
- Reminder resolution only marks the reminder handled; it does not yet draft refreshed collateral artifacts automatically.

## Follow-ups

- Reassess whether future roadmap milestones should let reminder cards create collateral refresh drafts directly.
- If collateral inventory grows, move the seeded inventory into explicit config instead of code.

## Files Created/Modified

- `web/lib/assistant/collateral-reminder-engine.ts` — added reminder inventory, cadence derivation, persistence, and resolution behavior
- `web/app/api/assistant/collateral-reminders/route.ts` — added read route for Assistant collateral reminders
- `web/app/api/assistant/collateral-reminders/[id]/resolve/route.ts` — added reminder resolution route
- `web/lib/client-api.ts` — added typed read and resolve helpers for collateral reminders
- `web/app/assistant/page.tsx` — added quarterly collateral reminder section and resolve action
- `web/tests/assistant/collateral-reminder-engine.test.ts` — added deterministic engine and route verification
- `web/tests/assistant-page-collateral-reminders.test.tsx` — added Assistant reminder rendering and resolution coverage

## Forward Intelligence

### What the next slice should know
- The reminder engine already supports `includeResolved`, so future reporting or audit views can reuse it without duplicating state handling.

### What's fragile
- Seeded reminder inventory in code — future changes to vertical coverage or ownership require code edits until the inventory is externalized.

### Authoritative diagnostics
- `tests/assistant/collateral-reminder-engine.test.ts` — fastest signal for cadence, visibility-window, and resolution behavior
- `.cache/assistant-collateral-reminders.json` — source of truth for persisted reminder state during local debugging

### What assumptions changed
- Original assumption: reminder visibility might need to piggyback on the existing alert model — what actually happened: a dedicated reminder seam was simpler, clearer, and better aligned with roadmap collateral maintenance semantics
