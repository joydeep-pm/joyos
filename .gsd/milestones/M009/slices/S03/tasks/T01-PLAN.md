---
estimated_steps: 7
estimated_files: 4
---

# T01: Implement persisted collateral reminder engine and API contract

**Slice:** S03 — Quarterly collateral reminders
**Milestone:** M009

## Description

Create the durable local-first reminder model for quarterly Product Deck and Product Factsheet refreshes. This task establishes the reminder inventory, cadence derivation, persisted resolution state, and stable API contract that later UI work will consume.

## Steps

1. Extend `web/lib/types.ts` with collateral reminder item and persisted state contracts, including asset type, vertical, quarter label, due date, status/severity, and resolution metadata.
2. Implement `web/lib/assistant/collateral-reminder-engine.ts` to seed a lightweight per-vertical inventory, derive deterministic due/upcoming/overdue reminders from quarterly cadence, and persist reminder state under the assistant cache.
3. Add `web/app/api/assistant/collateral-reminders/route.ts` to expose the reminder list through a stable assistant API response.
4. Write `web/tests/assistant/collateral-reminder-engine.test.ts` to prove reminder derivation, persisted inspectability, and the route contract.
5. Run the targeted test command and fix failures until it passes.
6. Mark the slice plan task checkbox complete.
7. Write a task summary capturing the engine contract, cache file, and API diagnostics.

## Must-Haves

- [ ] Reminder generation is deterministic for a fixed date and seeded inventory.
- [ ] The API returns stable reminder metadata suitable for Assistant-page rendering.
- [ ] Persisted state remains inspectable in cache and does not contain outbound content.

## Verification

- `cd web && npm run test -- --run tests/assistant/collateral-reminder-engine.test.ts`
- Inspect `.cache/assistant-collateral-reminders.json` shape indirectly via test assertions against persisted state.

## Observability Impact

- Signals added/changed: persisted reminder records with stable ids, due dates, status, severity, and resolvedAt metadata
- How a future agent inspects this: `GET /api/assistant/collateral-reminders` and `.cache/assistant-collateral-reminders.json`
- Failure state exposed: missing or malformed reminder inventory, due-date derivation, and route-contract regressions fail explicitly in tests

## Inputs

- `web/lib/assistant/storage.ts` — existing local cache helpers for durable assistant state
- `web/app/api/assistant/alerts/route.ts` and `web/lib/assistant/alert-engine.ts` — prior pattern for assistant API wrapping around local engine logic
- `web/tests/assistant/approval-envelope-store.test.ts` — pattern for cache-isolated persisted-state tests
- `.gsd/milestones/M009/slices/S03/S03-PLAN.md` — defines the reminder engine contract and verification target

## Expected Output

- `web/lib/assistant/collateral-reminder-engine.ts` — reminder inventory, cadence derivation, cache read/write helpers, and reminder listing function
- `web/app/api/assistant/collateral-reminders/route.ts` — stable read route for collateral reminders
- `web/tests/assistant/collateral-reminder-engine.test.ts` — deterministic tests for engine output and API contract
- `.gsd/milestones/M009/slices/S03/tasks/T01-SUMMARY.md` — execution summary and diagnostics handoff
