---
id: S01
parent: M001
milestone: M001
provides:
  - Derived grooming readiness evaluator and rubric-driven grooming review contract wired through tests, API output, exports, and the grooming UI
affects:
  - S02
  - S03
key_files:
  - web/lib/control-tower/readiness-evaluator.ts
  - web/lib/control-tower/grooming-engine.ts
  - web/app/grooming/page.tsx
  - web/app/api/control-tower/grooming/route.ts
  - web/tests/control-tower/readiness-evaluator.test.ts
  - web/tests/control-tower/grooming-engine.test.ts
  - .gsd/REQUIREMENTS.md
key_decisions:
  - Model grooming readiness as a derived evaluator module consumed by the grooming engine and route instead of expanding coarse bucket rules in place.
  - Keep the client grooming page on browser-safe imports rather than the control-tower barrel so the real page does not pull server-only modules into the bundle.
patterns_established:
  - Grooming summaries preserve per-request readiness evaluations with verdict, dimensions, missing-input codes, blocker class, prioritization posture, and recommended next step for downstream reuse.
  - Grooming review cards render the evaluator contract directly so the UI and exports do not recompute ad hoc readiness rules.
observability_surfaces:
  - web/tests/control-tower/readiness-evaluator.test.ts
  - web/tests/control-tower/grooming-engine.test.ts
  - web/app/api/control-tower/grooming/route.ts
  - web/app/grooming/page.tsx
  - cd web && npm test -- --run tests/control-tower/readiness-evaluator.test.ts tests/control-tower/grooming-engine.test.ts tests/control-tower/intervention-engine.test.ts
  - cd web && npm run typecheck
drill_down_paths:
  - .gsd/milestones/M001/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S01/tasks/T03-SUMMARY.md
duration: 1h31m
verification_result: passed
completed_at: 2026-03-12
---

# S01: Grooming readiness engine and review rubric

**Shipped a derived readiness evaluator and rubric-driven grooming review workflow that exposes verdicts, missing inputs, blocker classes, prioritization posture, and recommended next steps across tests, API payloads, exports, and the grooming UI.**

## What Happened

T01 locked the slice boundary first with failing contract tests. The new readiness-evaluator suite defined the required verdicts, dimensions, missing-input codes, blocker classes, prioritization posture, and next-step outputs, while the grooming-engine suite forced grouped grooming summaries to consume evaluator output instead of coarse bucket logic.

T02 implemented `web/lib/control-tower/readiness-evaluator.ts` as an overlay on top of existing `FeatureRequest` inputs and signals. The evaluator derives machine-readable rubric dimensions for documentation, scope, stage, unblock status, prioritization, and freshness, then computes verdict, blocker class, prioritization posture, missing inputs, and recommended next step. `web/lib/control-tower/grooming-engine.ts` was reworked to preserve per-request evaluation entries alongside category groupings, and the grooming API route now returns the richer serialized contract.

T03 rebuilt the grooming page into a substantive review surface. The page now renders verdict-aware review lanes, per-request review calls, dimension rationale, weak-signal summaries, missing-input guidance, blocker details, prioritization posture, and source coverage. During runtime verification, a real bundle failure exposed that the client page was importing from a barrel that re-exported server-only modules. The page was moved to browser-safe imports from `types` and `grooming-engine`, fixing the root cause and preserving the slice contract.

The slice stayed overlay-only: no system-of-record ownership changed, and no durable review-decision storage was added ahead of S02.

## Verification

Passed slice-level checks:

- `cd web && npm test -- --run tests/control-tower/readiness-evaluator.test.ts tests/control-tower/grooming-engine.test.ts tests/control-tower/intervention-engine.test.ts`
- `cd web && npm run typecheck`

Observability and diagnostic inspection confirmed:

- `evaluateReadiness()` emits machine-readable verdicts, dimension statuses, missing-input codes, blocker classes, prioritization posture, and recommended next steps.
- `generateGroomingSummary()` preserves `readiness.evaluations` so downstream UI and future slices can inspect failure state without recomputing rules.
- `GET /api/control-tower/grooming` serializes the richer readiness payload.
- `web/app/grooming/page.tsx` renders explicit low-readiness and blocked explanations instead of opaque buckets.
- The browser-bundle failure path is now externally visible and avoidable because the client import boundary is explicit and covered by the shipped code shape.

## Requirements Advanced

- R001 — Made the intervention-oriented control tower more actionable by adding rubric-driven grooming readiness and next-step signals that can feed later review workflows.
- R002 — Extended the feature-request object with a derived readiness overlay without breaking the feature-request-centric operating model.
- R003 — Added explicit blocker class, weak-signal, and stale-input visibility to grooming preparation.
- R008 — Preserved the overlay model by deriving readiness from existing Jira, Confluence, and local synthesis inputs rather than creating a new system of record.

## Requirements Validated

- R005 — Validated by passing readiness evaluator and grooming-engine tests plus typecheck, proving that real feature requests can be assessed for clarity, dependency state, readiness, prioritization posture, and recommended next step through API and UI contracts.

## New Requirements Surfaced

- none

## Requirements Invalidated or Re-scoped

- none

## Deviations

- Browser/runtime verification was performed during T03 even though the slice proof level did not require runtime proof, because the rebuilt grooming page surfaced a real client-bundle failure that needed root-cause correction before the slice could be considered shippable.

## Known Limitations

- S01 does not persist review outcomes, pending decisions, or rationale; that durable operating layer remains for S02.
- The current local dataset can leave the grooming page showing empty review lanes, so populated-card behavior is proven primarily by contract tests and typed rendering rather than live seeded data.
- Approval-gated downstream action flows and end-to-end pre-grooming loop assembly remain for S03.

## Follow-ups

- Build S02 around the shipped readiness contract so review records can store decision status, rationale, pending decisions, and next actions without recomputing readiness.
- Consider adding a stable seeded/demo dataset for browser verification so populated grooming cards can be exercised in runtime, not just via tests.

## Files Created/Modified

- `web/lib/control-tower/readiness-evaluator.ts` — added the derived readiness evaluator and rubric contract.
- `web/lib/control-tower/grooming-engine.ts` — moved grooming categorization and exports onto evaluator-driven grouped summaries.
- `web/app/api/control-tower/grooming/route.ts` — returns the richer serialized readiness summary.
- `web/app/grooming/page.tsx` — rebuilt the grooming dashboard into a rubric-driven review workflow and fixed the browser-safe import boundary.
- `web/tests/control-tower/readiness-evaluator.test.ts` — defines the readiness contract for verdicts, dimensions, missing inputs, blocker classes, posture, and next-step behavior.
- `web/tests/control-tower/grooming-engine.test.ts` — verifies grouped summary wiring and preservation of actionable diagnostics for UI and export consumers.
- `.gsd/REQUIREMENTS.md` — moved R005 to validated based on slice evidence.

## Forward Intelligence

### What the next slice should know
- S02 should treat `GroomingReadinessEntry` and `FeatureRequestReadinessEvaluation` as the authoritative read model for review prep; reuse them instead of introducing a parallel readiness shape.
- The grooming page is a client component, so importing from the `@/lib/control-tower` barrel is unsafe unless the barrel is split or made browser-safe.

### What's fragile
- `web/app/grooming/page.tsx` import boundaries — reintroducing barrel imports can pull server-only modules like `fs` into the client bundle and break runtime immediately.
- Live grooming verification with local data — empty-state runtime checks can hide regressions in populated-card rendering unless tests continue covering the detailed card contract.

### Authoritative diagnostics
- `web/tests/control-tower/readiness-evaluator.test.ts` — this is the fastest trustworthy signal for readiness-contract regressions.
- `web/tests/control-tower/grooming-engine.test.ts` — this proves grouped summary preservation and the diagnostics the UI depends on.
- `web/app/api/control-tower/grooming/route.ts` payload shape — this is the canonical integration seam between engine output and UI consumption.

### What assumptions changed
- The grooming page could safely import from the control-tower barrel — in reality the barrel re-exported server-only modules and broke the client bundle, so browser-safe direct imports are required.
