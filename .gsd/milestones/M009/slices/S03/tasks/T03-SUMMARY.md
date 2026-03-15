---
id: T03
parent: S03
milestone: M009
provides:
  - Resolution loop for collateral reminders with persisted resolved state and verified Assistant refresh behavior
key_files:
  - web/lib/assistant/collateral-reminder-engine.ts
  - web/app/api/assistant/collateral-reminders/[id]/resolve/route.ts
  - web/lib/client-api.ts
  - web/app/assistant/page.tsx
  - web/tests/assistant/collateral-reminder-engine.test.ts
  - web/tests/assistant-page-collateral-reminders.test.tsx
key_decisions:
  - Hide resolved reminders from default reads while preserving them in persisted state for inspection
patterns_established:
  - Reminder families should expose a small resolve route plus default-hidden resolved items and includeResolved inspection support
observability_surfaces:
  - .cache/assistant-collateral-reminders.json
  - POST /api/assistant/collateral-reminders/[id]/resolve
  - tests/assistant/collateral-reminder-engine.test.ts
  - tests/assistant-page-collateral-reminders.test.tsx
duration: 25m
verification_result: passed
completed_at: 2026-03-15
blocker_discovered: false
---

# T03: Add reminder resolution loop and verify milestone coverage

**Added collateral reminder resolution, hid resolved reminders from default Assistant reads, and verified the full reminder loop end-to-end at test level.**

## What Happened

This task extended the collateral reminder engine with `resolveCollateralReminder`, which stamps `resolvedAt` into persisted reminder state and returns a resolved reminder object. A new resolve route was added under `web/app/api/assistant/collateral-reminders/[id]/resolve/route.ts`, and the typed client API plus Assistant page were updated so users can mark reminders resolved directly from the reminder card.

The default reminder list now hides resolved reminders, while `includeResolved` still exposes them for inspection and testing. Test coverage was expanded to prove engine-level resolution behavior, route-level resolution behavior, and Assistant-page refresh behavior after a reminder is resolved.

## Verification

- `cd web && npm run typecheck`
- `cd web && npm run test -- --run tests/assistant/collateral-reminder-engine.test.ts tests/assistant-page-collateral-reminders.test.tsx`

## Diagnostics

Inspect `.cache/assistant-collateral-reminders.json` to confirm the resolved record is preserved under `resolved`. Use `POST /api/assistant/collateral-reminders/[id]/resolve` plus `GET /api/assistant/collateral-reminders` to verify default-hidden resolved behavior without relying on UI state.

## Deviations

The initial implementation used an array `map(...).filter(...)` pattern that widened nullability under typecheck. I simplified it to an explicit loop to keep the reminder list strongly typed and avoid noisy predicates.

## Known Issues

None for the planned slice scope.

## Files Created/Modified

- `web/lib/assistant/collateral-reminder-engine.ts` — added reminder resolution and default-hidden resolved behavior
- `web/app/api/assistant/collateral-reminders/[id]/resolve/route.ts` — added stable resolve endpoint
- `web/lib/client-api.ts` — added typed resolve helper
- `web/app/assistant/page.tsx` — added resolve action on reminder cards and reload behavior
- `web/tests/assistant/collateral-reminder-engine.test.ts` — added resolution and route contract coverage
- `web/tests/assistant-page-collateral-reminders.test.tsx` — added UI resolution-loop coverage
