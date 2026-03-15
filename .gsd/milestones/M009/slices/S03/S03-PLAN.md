# S03: Quarterly collateral reminders

**Goal:** Make quarterly Product Deck and Product Factsheet refresh work visible through the assistant workflow so collateral maintenance stops relying on memory.
**Demo:** On the Assistant page, Joydeep can see overdue or upcoming quarterly collateral refresh reminders for lending verticals, understand why each reminder is showing, and mark the reminder resolved once the refresh is handled.

## Must-Haves

- Add a lightweight collateral reminder model for Product Deck and Product Factsheet refreshes by vertical.
- Surface quarterly collateral reminders through an existing user-visible assistant surface instead of hidden cache state.
- Keep reminders local-first and reminder-only; do not imply outbound send or slide export automation.
- Verify both generation logic and Assistant-page visibility, including an inspectable empty state when no reminders are due.

## Proof Level

- This slice proves: operational
- Real runtime required: no
- Human/UAT required: yes

## Verification

- `cd web && npm run test -- --run tests/assistant/collateral-reminder-engine.test.ts tests/assistant-page-collateral-reminders.test.tsx`
- `cd web && npm run typecheck`

## Observability / Diagnostics

- Runtime signals: persisted collateral reminder state with due/overdue metadata and resolution timestamps
- Inspection surfaces: assistant alerts/reminders API response, Assistant page reminder cards, `.cache/assistant-collateral-reminders.json`
- Failure visibility: stable reminder ids, asset type, vertical, due date, status, and resolvedAt fields remain inspectable even when the UI is empty
- Redaction constraints: reminder state should contain only collateral metadata and dates, never external credentials or stakeholder message bodies

## Integration Closure

- Upstream surfaces consumed: assistant storage helpers, assistant alert/reminder route pattern, existing Assistant page loading flow, M009 roadmap artifact taxonomy
- New wiring introduced in this slice: collateral reminder engine plus Assistant page reminder section backed by a dedicated API route
- What remains before the milestone is truly usable end-to-end: nothing

## Tasks

- [x] **T01: Implement persisted collateral reminder engine and API contract** `est:1h`
  - Why: S03 needs a durable source of truth for quarterly Product Deck / Factsheet reminders instead of hard-coded UI-only placeholders.
  - Files: `web/lib/assistant/collateral-reminder-engine.ts`, `web/app/api/assistant/collateral-reminders/route.ts`, `web/lib/types.ts`
  - Do: Add reminder types and state contracts, seed a lightweight per-vertical collateral inventory for Product Deck and Product Factsheet, derive due/upcoming/overdue reminder items from quarterly cadence, persist resolution state in assistant cache, and expose a read API with stable reminder metadata.
  - Verify: `cd web && npm run test -- --run tests/assistant/collateral-reminder-engine.test.ts`
  - Done when: the engine returns deterministic reminder items with asset type, vertical, quarter label, due date, severity/status, and resolution metadata through a dedicated API contract.
- [x] **T02: Surface quarterly collateral reminders in the Assistant workflow** `est:45m`
  - Why: The milestone is only operationally true if reminder work is visible in a real user-facing assistant surface.
  - Files: `web/app/assistant/page.tsx`, `web/lib/client-api.ts`, `web/tests/assistant-page-collateral-reminders.test.tsx`
  - Do: Load collateral reminders alongside existing assistant state, render a dedicated section for due/upcoming refreshes with clear vertical/asset/date context, and include an empty-state message when nothing is due without displacing higher-priority intervention sections.
  - Verify: `cd web && npm run test -- --run tests/assistant-page-collateral-reminders.test.tsx`
  - Done when: the Assistant page shows reminder cards when present and a truthful no-reminders state when absent.
- [x] **T03: Add reminder resolution loop and verify milestone coverage** `est:45m`
  - Why: Reminder work should be explicitly closable so the system can show what has been handled instead of repeating stale prompts forever.
  - Files: `web/app/api/assistant/collateral-reminders/[id]/resolve/route.ts`, `web/lib/assistant/collateral-reminder-engine.ts`, `web/tests/assistant/collateral-reminder-engine.test.ts`, `web/tests/assistant-page-collateral-reminders.test.tsx`
  - Do: Add a resolve action that stamps resolvedAt for a reminder, hide resolved reminders from the default assistant view, and expand tests to prove both unresolved visibility and post-resolution disappearance while preserving inspectable cache state.
  - Verify: `cd web && npm run test -- --run tests/assistant/collateral-reminder-engine.test.ts tests/assistant-page-collateral-reminders.test.tsx && npm run typecheck`
  - Done when: users can resolve a collateral reminder and subsequent reads stop surfacing it by default while the resolved record remains inspectable in persisted state.

## Files Likely Touched

- `web/lib/assistant/collateral-reminder-engine.ts`
- `web/app/api/assistant/collateral-reminders/route.ts`
- `web/app/api/assistant/collateral-reminders/[id]/resolve/route.ts`
- `web/lib/types.ts`
- `web/lib/client-api.ts`
- `web/app/assistant/page.tsx`
- `web/tests/assistant/collateral-reminder-engine.test.ts`
- `web/tests/assistant-page-collateral-reminders.test.tsx`
