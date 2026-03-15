---
id: M009
provides:
  - Distinct roadmap communication workflows for monthly updates, roadmap updates, roadmap deck outlines, and quarterly collateral reminders
key_decisions:
  - Keep Product Update and Roadmap Update as separate artifact/workflow concepts
  - Reuse the existing artifact system for roadmap drafting instead of creating a roadmap-only subsystem
  - Model quarterly Product Deck / Factsheet maintenance as a dedicated reminder workflow in Assistant
patterns_established:
  - New roadmap communication capabilities can ship by combining taxonomy grounding, artifact-type extension, and dedicated reminder seams rather than one monolithic subsystem
observability_surfaces:
  - tests/control-tower/artifact-generator.test.ts
  - tests/control-tower/roadmap-artifact-ui.test.tsx
  - tests/assistant/collateral-reminder-engine.test.ts
  - tests/assistant-page-collateral-reminders.test.tsx
  - GET /api/assistant/collateral-reminders
  - POST /api/assistant/collateral-reminders/[id]/resolve
requirement_outcomes:
  - id: M009-roadmap-comms
    from_status: active
    to_status: validated
    proof: S01 separated Product Update vs Roadmap Update taxonomy, S02 proved roadmap update and roadmap deck drafting through tests/typecheck, and S03 proved quarterly collateral reminder visibility and resolution through Assistant tests and typecheck
duration: 1d
verification_result: passed
completed_at: 2026-03-15
---

# M009: Roadmap communications and collateral operations

**Established roadmap communication as a first-class workflow with distinct roadmap drafts and quarterly collateral reminders.**

## What Happened

M009 completed the roadmap communications operating layer in three connected slices. S01 grounded the taxonomy: Monthly Product Update, Roadmap Update, roadmap deck, and Product Deck / Product Factsheet refreshes are now explicitly treated as different jobs. That removed the earlier ambiguity between reporting, forward-looking roadmap communication, and recurring collateral maintenance.

S02 then proved roadmap drafting could reuse the existing artifact workflow. Two distinct artifact outputs — `roadmap_update` and `roadmap_deck_outline` — were added and exposed through the feature-request workflow so Joydeep can draft a vertical-specific roadmap update and a business/RFP-facing roadmap deck outline without a new subsystem.

S03 completed the reminder half of the milestone by introducing a dedicated Assistant reminder engine for quarterly Product Deck and Product Factsheet refreshes. The Assistant page now surfaces due/upcoming collateral reminders with clear timing context and lets the user mark them resolved while preserving inspectable persisted state.

Taken together, the milestone now treats roadmap communication as a real operating loop instead of ad hoc manual formatting work.

## Cross-Slice Verification

- Taxonomy and format grounding verified via roadmap/requirements grep checks in S01:
  - `rg -n "Product Update|Roadmap Update|roadmap deck|Product Deck|Factsheet|quarterly" requirements.md .gsd/milestones/M009 docs .config/templates/m2p`
  - `rg -n "Gold Loan|LAMF|BNPL|LOS|Collections|Co-Lending|Legal" .gsd/milestones/M009`
- Roadmap drafting verified in S02:
  - `cd web && npm run test -- --run tests/control-tower/artifact-generator.test.ts tests/control-tower/roadmap-artifact-ui.test.tsx`
  - `cd web && npm run typecheck`
- Quarterly collateral reminder visibility and resolution verified in S03:
  - `cd web && npm run test -- --run tests/assistant/collateral-reminder-engine.test.ts tests/assistant-page-collateral-reminders.test.tsx`
  - `cd web && npm run typecheck`

## Requirement Changes

- M009-roadmap-comms: active → validated — S01 defined the roadmap communication taxonomy, S02 proved roadmap update and roadmap deck drafting, and S03 proved quarterly collateral reminders in Assistant with resolution support.

## Forward Intelligence

### What the next milestone should know
- Roadmap drafting and roadmap collateral maintenance now have separate seams: artifact generation for drafts, Assistant reminders for recurring refresh work.
- The reminder engine already supports persisted resolved state and `includeResolved`, so a future audit/reporting view can reuse it directly.

### What's fragile
- Seeded collateral inventory in code — it works for current proof but becomes awkward if vertical coverage, ownership, or cadence changes frequently.
- Roadmap drafting still depends on feature-request-centric context — broader roadmap source integration may be needed later for richer deck content.

### Authoritative diagnostics
- `tests/control-tower/roadmap-artifact-ui.test.tsx` — best signal for roadmap artifact action exposure in the feature-request workflow
- `tests/assistant/collateral-reminder-engine.test.ts` — best signal for reminder cadence, visibility window, and resolution behavior
- `.cache/assistant-collateral-reminders.json` — source of truth for persisted collateral reminder state during debugging

### What assumptions changed
- Original assumption: reminder work might fit inside the existing alert model — what actually happened: a dedicated reminder seam was cleaner and better matched quarterly collateral maintenance semantics.
- Original assumption: roadmap comms might require a dedicated subsystem — what actually happened: the existing artifact workflow was sufficient once roadmap-specific artifact types were added.

## Files Created/Modified

- `.gsd/milestones/M009/M009-CONTEXT.md` — milestone context for roadmap comms taxonomy, drafting, and reminder scope
- `.gsd/milestones/M009/M009-ROADMAP.md` — milestone roadmap and slice sequencing
- `.gsd/milestones/M009/M009-SUMMARY.md` — milestone closeout summary
- `web/lib/control-tower/artifacts/types.ts` — added roadmap-specific artifact types
- `web/lib/control-tower/artifacts/generator.ts` — added roadmap update and roadmap deck outline generation
- `web/components/intervention/FeatureRequestDetail.tsx` — added roadmap draft actions in the feature-request flow
- `web/lib/assistant/collateral-reminder-engine.ts` — added quarterly collateral reminder engine and resolution behavior
- `web/app/assistant/page.tsx` — surfaced quarterly collateral reminders in Assistant
