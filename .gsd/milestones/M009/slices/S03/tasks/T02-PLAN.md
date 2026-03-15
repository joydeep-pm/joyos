---
estimated_steps: 6
estimated_files: 4
---

# T02: Surface quarterly collateral reminders in the Assistant workflow

**Slice:** S03 — Quarterly collateral reminders
**Milestone:** M009

## Description

Wire the new collateral reminder API into the Assistant page and render a dedicated reminder section that makes quarterly Product Deck / Product Factsheet refresh work visible without displacing higher-priority intervention workflows.

## Steps

1. Extend `web/lib/client-api.ts` with a typed `getCollateralReminders` helper.
2. Update `web/app/assistant/page.tsx` to load collateral reminders alongside existing assistant state.
3. Render a dedicated Assistant section for quarterly collateral reminders with vertical, asset type, due date, and quarter context.
4. Add a truthful empty state when no reminders are due or upcoming.
5. Add `web/tests/assistant-page-collateral-reminders.test.tsx` and update shared Assistant mocks if needed.
6. Run the targeted test command and fix failures until it passes.

## Must-Haves

- [ ] Assistant loads collateral reminders through the new API helper.
- [ ] Reminder cards clearly show asset type, vertical, and due timing.
- [ ] Empty-state behavior is visible and explicit when no reminders exist.

## Verification

- `cd web && npm run test -- --run tests/assistant-page-collateral-reminders.test.tsx`
- Assistant-page rendering assertions cover both populated and empty reminder states.

## Observability Impact

- Signals added/changed: Assistant UI now exposes collateral reminder state from the dedicated reminder API
- How a future agent inspects this: `/assistant` UI and the mocked client API expectations in `web/tests/assistant-page-collateral-reminders.test.tsx`
- Failure state exposed: missing reminders, broken API wiring, or empty-state regressions fail explicitly in the page test

## Inputs

- `web/lib/assistant/collateral-reminder-engine.ts` — provides the reminder data contract implemented in T01
- `web/app/assistant/page.tsx` — existing assistant layout and load orchestration
- `web/tests/assistant-page-alignment.test.tsx` — existing pattern for Assistant-page UI testing
- `.gsd/milestones/M009/slices/S03/tasks/T01-SUMMARY.md` — confirms the reminder API and cache contract now exist

## Expected Output

- `web/lib/client-api.ts` — typed helper for collateral reminder reads
- `web/app/assistant/page.tsx` — visible quarterly collateral reminder section and empty state
- `web/tests/assistant-page-collateral-reminders.test.tsx` — rendering tests for populated and empty reminder states
