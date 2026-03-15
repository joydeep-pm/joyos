---
id: T02
parent: S03
milestone: M009
provides:
  - Assistant-page visibility for quarterly collateral reminders with populated and empty reminder states
key_files:
  - web/app/assistant/page.tsx
  - web/lib/client-api.ts
  - web/tests/assistant-page-alignment.test.tsx
  - web/tests/assistant-page-collateral-reminders.test.tsx
key_decisions:
  - Surface collateral reminders in a dedicated Assistant section rather than hiding them inside generic alerts
patterns_established:
  - New Assistant side-panel work should add typed client API helpers plus focused page tests for both data-present and empty-state rendering
observability_surfaces:
  - /assistant UI
  - tests/assistant-page-collateral-reminders.test.tsx
duration: 20m
verification_result: passed
completed_at: 2026-03-15
blocker_discovered: false
---

# T02: Surface quarterly collateral reminders in the Assistant workflow

**Added a dedicated Assistant sidebar section that displays quarterly Product Deck and Product Factsheet reminders with due timing context.**

## What Happened

This task wired the new collateral reminder route into `web/lib/client-api.ts` and loaded reminder data as part of the Assistant page fetch sequence. The Assistant sidebar now renders a dedicated `Quarterly collateral reminders` card showing asset type, vertical, quarter label, due timing, and refresh dates.

It also added a truthful empty state for periods when no Product Deck or Product Factsheet refresh is currently due. Focused page tests now verify both a populated reminder state and the explicit no-reminders state.

## Verification

- `cd web && npm run test -- --run tests/assistant-page-collateral-reminders.test.tsx`

## Diagnostics

Use `/assistant` to inspect the live reminder section. The page test `web/tests/assistant-page-collateral-reminders.test.tsx` is the fastest signal when reminder rendering or API wiring regresses.

## Deviations

None.

## Known Issues

Reminder cards are read-only until T03 adds the resolution loop.

## Files Created/Modified

- `web/lib/client-api.ts` — added typed collateral reminder fetch helper
- `web/app/assistant/page.tsx` — added reminder state loading and quarterly collateral reminder UI section
- `web/tests/assistant-page-alignment.test.tsx` — updated Assistant page mocks to include collateral reminder loading
- `web/tests/assistant-page-collateral-reminders.test.tsx` — added dedicated rendering coverage for populated and empty reminder states
