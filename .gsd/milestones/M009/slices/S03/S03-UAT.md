# S03: Quarterly collateral reminders — UAT

**Milestone:** M009
**Written:** 2026-03-15

## UAT Type

- UAT mode: mixed
- Why this mode is sufficient: this slice needs both artifact/state verification for cadence logic and a human-visible check that reminders appear in the Assistant workflow.

## Preconditions

- The Assistant feature surface is enabled.
- The app is running locally.
- The collateral reminder seed data includes at least one vertical with a due or overdue Product Deck / Product Factsheet refresh.

## Smoke Test

Open `/assistant` and confirm a quarterly collateral reminder section is visible with at least one reminder card or a truthful “no reminders due” empty state.

## Test Cases

### 1. View due quarterly collateral reminders

1. Open `/assistant`.
2. Scroll to the quarterly collateral reminder section.
3. **Expected:** Each visible reminder shows the vertical, asset type, quarter or cadence context, and due/overdue timing label.

### 2. Resolve a collateral reminder

1. Open `/assistant`.
2. Click the resolve action on one visible collateral reminder.
3. Refresh the page if needed.
4. **Expected:** The resolved reminder no longer appears in the default reminder list.

## Edge Cases

### No reminders due

1. Use reminder state where all collateral reminders are resolved or not yet due.
2. Open `/assistant`.
3. **Expected:** The page renders a clear empty state instead of a broken or missing section.

## Failure Signals

- No quarterly collateral reminder section exists on the Assistant page.
- Reminder cards omit which vertical or asset needs refresh.
- Resolving a reminder does nothing or the same reminder reappears immediately without explanation.
- The reminder list is only visible in cache state and not in a real UI surface.

## Requirements Proved By This UAT

- M009 quarterly collateral refresh reminder requirement — proves Product Deck / Product Factsheet refresh work is visible through reminders instead of memory.

## Not Proven By This UAT

- Slide export or presentation design automation.
- Automatic artifact generation for Product Deck or Product Factsheet refreshes.
- External delivery or send workflows for refreshed collateral.

## Notes for Tester

Treat this slice as reminder visibility and reminder closure only. It should not be judged on polished collateral authoring or outbound communication automation.
