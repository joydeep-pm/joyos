---
id: T01
parent: S03
milestone: M009
provides:
  - Persisted quarterly collateral reminder inventory, derivation logic, and read API contract for Assistant workflow consumption
key_files:
  - web/lib/assistant/collateral-reminder-engine.ts
  - web/app/api/assistant/collateral-reminders/route.ts
  - web/lib/types.ts
  - web/tests/assistant/collateral-reminder-engine.test.ts
key_decisions:
  - Keep collateral reminders as a dedicated reminder engine instead of folding them into the drift alert engine
  - Seed reminder inventory locally with lightweight vertical metadata and quarterly cadence rather than introducing a new external source of truth
patterns_established:
  - New assistant reminder families can ship as local cache-backed engines with dedicated API routes and deterministic time-based tests
observability_surfaces:
  - .cache/assistant-collateral-reminders.json
  - GET /api/assistant/collateral-reminders
  - tests/assistant/collateral-reminder-engine.test.ts
duration: 35m
verification_result: passed
completed_at: 2026-03-15
blocker_discovered: false
---

# T01: Implement persisted collateral reminder engine and API contract

**Added a cache-backed collateral reminder engine and stable read route for quarterly Product Deck / Factsheet refresh visibility.**

## What Happened

This task introduced explicit collateral reminder types in `web/lib/types.ts`, then implemented `web/lib/assistant/collateral-reminder-engine.ts` as the durable local source of truth for quarterly reminder inventory and derived reminder items. The engine seeds a lightweight inventory covering Product Deck and Product Factsheet refreshes by vertical, computes due dates from quarterly cadence, derives upcoming/due/overdue status plus severity, and persists reminder state in the assistant cache.

A new API route at `web/app/api/assistant/collateral-reminders/route.ts` now exposes those reminders through the same route contract pattern used elsewhere in Assistant. Targeted tests prove deterministic reminder derivation, persisted cache inspectability, and stable API response shape.

## Verification

- `cd web && npm run test -- --run tests/assistant/collateral-reminder-engine.test.ts`

## Diagnostics

Inspect `.cache/assistant-collateral-reminders.json` for the persisted inventory and resolution map. Use `GET /api/assistant/collateral-reminders` to inspect the current visible reminder list without relying on UI rendering.

## Deviations

The initial test expected an upcoming reminder beyond the engine's 30-day visibility window. I corrected the test to match the planned contract: only due, overdue, and near-term upcoming reminders should surface.

## Known Issues

Reminder resolution is not implemented yet; all reminders remain visible until T03 adds the resolve loop.

## Files Created/Modified

- `web/lib/types.ts` — added collateral reminder domain types and persisted state contracts
- `web/lib/assistant/collateral-reminder-engine.ts` — added seeded inventory, cadence derivation, cache persistence, and reminder listing logic
- `web/app/api/assistant/collateral-reminders/route.ts` — added stable read endpoint for collateral reminders
- `web/tests/assistant/collateral-reminder-engine.test.ts` — added deterministic engine and route tests
