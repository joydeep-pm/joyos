# M001 / S01 — Research

**Date:** 2026-03-11

## Summary

Slice S01 owns the first substantive step toward M001’s decision-and-review operating system: it must make grooming readiness operational for real feature requests, not just provide a coarse dashboard bucket. From the preloaded roadmap and requirements, the slice directly owns **R005 (Grooming readiness and prioritization support)** and materially supports **R001 (daily intervention brief)**, **R002 (feature-request-centric workspace)**, **R003 (PM blocker and execution visibility)**, and **R008 (systems-of-record overlay model)**. The existing codebase already has a useful base: a feature-request domain model, risk scoring, blocker detection, an intervention engine, a grooming engine, a grooming page, and artifact generation. But the current grooming logic is too shallow to satisfy the slice promise of a “substantive decision rubric” with explicit missing inputs, blocker classification, prioritization posture, and recommended next step.

The strongest recommendation is to evolve S01 around a **derived readiness evaluation model** rather than bolting more conditions directly into the existing `grooming-engine.ts` buckets. The current implementation classifies readiness mostly from stage, PRD existence, and blocker presence. That is enough for a simple checklist, but not enough for director-grade pre-grooming review. S01 should introduce a stable evaluation contract that can explain *why* an item is or is not ready, which dimensions are weak, what inputs are missing, what blocker classes matter, how prioritization posture looks, and what next action is recommended — while still remaining a derived overlay on top of Jira, Confluence, and local orchestration state.

## Recommendation

Implement S01 as a new **readiness evaluation layer** over `FeatureRequest`, with explicit rubric dimensions and machine-readable outputs that downstream surfaces can render consistently.

Recommended shape:
- keep `FeatureRequest` as the top-level domain object
- add a derived readiness contract, likely in a new module adjacent to `grooming-engine.ts`
- make the contract richer than the current `GroomingReadiness` buckets by including:
  - verdict (`ready`, `needs_inputs`, `blocked`, `hold`, similar)
  - rubric dimensions with per-dimension status and rationale
  - missing inputs array
  - blocker classification array
  - prioritization posture summary
  - recommended next step
  - optionally a confidence/explanation field for UI and tests
- have `grooming-engine.ts` consume this evaluation layer instead of embedding ad hoc rules
- keep the result derived and ephemeral in S01; durable review storage belongs in S02

This approach best fits the roadmap boundary map. S01 is supposed to *produce* a readiness evaluation model and derived review dimensions that S02/S03 can reuse. If the team instead expands the current bucket logic in place, S02 will likely need to reverse-engineer or replace it. A dedicated evaluation model gives a clean seam between domain ingestion and future decision tracking/UI work.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Feature request normalization across Jira and Confluence | `web/lib/control-tower/feature-request-engine.ts` | Already establishes the feature-request-centric overlay and should remain the upstream source for S01-derived evaluation |
| Risk severity inference | `web/lib/control-tower/risk-scorer.ts` | Reuse as an input signal into readiness/posture rather than creating a second risk system |
| Blocker classification | `web/lib/control-tower/blocker-detector.ts` | Already produces blocker summaries; S01 should extend or reinterpret these outputs, not duplicate parsing logic |
| Lifecycle semantics | `web/lib/control-tower/stage-config.ts` | Central source for stage meaning and expected flow; readiness rules should align to this config |
| Intervention surfacing | `web/lib/control-tower/intervention-engine.ts` | Existing intervention model already uses readiness-adjacent signals; S01 should feed it better derived signals instead of forking logic |
| Approval-gated outward actions | assistant/comms policy and artifact approval flow | Protects R007 boundary; S01 should remain read/evaluate/recommend only |

## Existing Code and Patterns

- `web/lib/control-tower/types.ts` — Core `FeatureRequest` model. Important constraint: it currently lacks explicit readiness-review fields beyond `recommendedNextStep?`, so S01 should prefer a derived evaluator over mutating the base object prematurely.
- `web/lib/control-tower/feature-request-engine.ts` — Builds `FeatureRequest` from Jira/Confluence matches. Good reuse point for upstream signals; weak point is that it only populates a small set of derived intelligence today.
- `web/lib/control-tower/grooming-engine.ts` — Current grooming logic. Useful as a baseline, but too coarse: “ready” means right stage + any Confluence page + no blockers; “needs estimate” is inferred entirely from `stage === estimation`; estimate coverage is really “ready coverage,” not actual estimate coverage.
- `web/lib/control-tower/intervention-engine.ts` — Shows the current pattern for derived analysis layered on `FeatureRequest`. Strong precedent for S01: add structured reasoning without changing systems of record.
- `web/lib/control-tower/stage-config.ts` — Encodes stage ownership, descriptions, duration, and transitions. Readiness rules should key off this instead of scattering stage assumptions.
- `web/components/intervention/FeatureRequestDetail.tsx` — Current detail surface already exposes risk, blockers, Jira, Confluence, notes, and quick actions. It is the obvious eventual consumer for S01 evaluation output.
- `web/app/grooming/page.tsx` — Current grooming dashboard surface. It can render richer readiness dimensions later, but today it only supports simple category lists.
- `web/lib/control-tower/notes.ts` — Local private orchestration data store for director notes. Relevant because it proves the pattern for overlay-only data, though durable review decisions themselves belong to S02.
- `web/tests/control-tower/intervention-engine.test.ts` — Existing test style for derived intelligence logic. S01 should follow this pattern with deterministic readiness-evaluator tests.
- `web/tests/control-tower/blocker-detector.test.ts` and `web/tests/control-tower/risk-scorer.test.ts` — Confirm that risk/blocker primitives are already unit-tested and should be treated as composable inputs.

## Constraints

- **Feature-request-centric model must remain primary.** The roadmap and requirements explicitly reject regression to a generic task system. S01 outputs must hang off `FeatureRequest`, not create a parallel review object model yet.
- **Systems-of-record boundary must hold.** Jira remains execution truth and Confluence documentation truth. S01 can derive judgments from those signals plus local notes, but should not pretend to authoritatively replace them.
- **Approval-gated behavior remains mandatory.** S01 can recommend actions and support drafting, but should not auto-send, auto-writeback, or auto-commit anything outward.
- **Current domain shape is intentionally sparse.** There is no explicit estimate field, acceptance criteria field, or review history field on `FeatureRequest`; readiness has to be inferred from available signals unless the slice introduces new derived fields sourced from existing data.
- **Current grooming route is runtime-derived.** `web/app/api/control-tower/grooming/route.ts` ingests feature requests and immediately summarizes them; any richer evaluator should preserve this simple integration path.

## Common Pitfalls

- **Treating “has a Confluence page” as equivalent to clarity** — The current grooming engine does this, but a linked page is only evidence that documentation exists, not that the item is ready. Avoid by modeling clarity/documentation as a dimension with rationale, not a boolean shortcut.
- **Equating stage with estimate readiness** — Current logic uses `stage === estimation` to infer “needs estimate,” and `readyCount / withEstimates.length` as “estimate coverage.” Avoid by separating lifecycle stage from estimate confidence/availability in the readiness contract.
- **Forking risk/blocker logic inside readiness rules** — That would create multiple inconsistent truth sources. Avoid by composing outputs from `risk-scorer.ts` and `blocker-detector.ts`.
- **Smuggling durable decision tracking into S01** — Notes persistence already exists, but roadmap boundaries say durable review records belong in S02. Avoid by keeping S01 focused on derived evaluation and rubric outputs.
- **Making rubric language too generic** — The main milestone risk is that criteria become too vague to reduce decision effort. Avoid by forcing each rubric dimension to produce explicit missing input / blocker / action language.

## Open Risks

- The current feature-request model may not expose enough evidence to support a truly strong rubric without introducing new derived parsing from Jira comments, issue links, or Confluence content.
- “Prioritization posture” is not represented today. It will need a careful derived definition to avoid pretending to know priority decisions that have not yet been captured.
- Because `recommendedNextStep?` already exists on `FeatureRequest` but is unused, there is a risk of inconsistent ownership between the base domain object and the new evaluator unless one source is designated canonical.
- The existing grooming UI is built around four coarse categories, so even with a strong backend evaluator, S01 may initially need contract-first delivery before the UI fully reflects rubric richness.
- There is currently no S01-specific test coverage for grooming/readiness behavior. Without dedicated tests, the slice will be fragile and future S02/S03 work may break invariants.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Frontend UI / React dashboard work | `frontend-design` | installed / available in system prompt |
| Next.js | `vercel/next.js@update-docs` | discovered, not installed |
| Next.js | `vercel/next.js@runtime-debug` | discovered, not installed |
| Tailwind CSS | `josiahsiegel/claude-plugin-marketplace@tailwindcss-advanced-layouts` | discovered, not installed; high installs but more UI-oriented than core S01 logic |
| Jira | `netresearch/jira-skill@jira-syntax` | discovered, not installed |
| Jira | `spillwavesolutions/jira@jira` | discovered, not installed |
| Confluence | `spillwavesolutions/confluence-skill@confluence` | discovered, not installed |

Recommended only if later execution needs them:
- `npx skills add vercel/next.js@update-docs`
- `npx skills add spillwavesolutions/jira@jira`
- `npx skills add spillwavesolutions/confluence-skill@confluence`

## Sources

- Slice ownership, risks, and boundary expectations from M001 roadmap and context (source: preloaded milestone artifacts)
- Requirement ownership and supporting coverage for R001/R002/R003/R005/R008 (source: preloaded `REQUIREMENTS.md`)
- Existing research artifact format (source: `~/.gsd/agent/extensions/gsd/templates/research.md`)
- Existing feature-request domain model and cache shape (source: `web/lib/control-tower/types.ts`, `web/lib/control-tower/cache.ts`)
- Existing grooming logic and current limitations (source: `web/lib/control-tower/grooming-engine.ts`, `web/app/grooming/page.tsx`, `web/app/api/control-tower/grooming/route.ts`)
- Existing derived-analysis pattern for intervention reasoning (source: `web/lib/control-tower/intervention-engine.ts`, `web/tests/control-tower/intervention-engine.test.ts`)
- Existing upstream signal sources for risk, blockers, and lifecycle (source: `web/lib/control-tower/risk-scorer.ts`, `web/lib/control-tower/blocker-detector.ts`, `web/lib/control-tower/stage-config.ts`)
- Existing local-private overlay pattern and approval boundary evidence (source: `web/lib/control-tower/notes.ts`, `web/tests/assistant.test.ts`, `web/lib/assistant/comms-engine.ts`, `web/lib/assistant/policy-engine.ts`)
- Skill discovery results (source: `npx skills find "Next.js"`, `npx skills find "Tailwind CSS"`, `npx skills find "Jira"`, `npx skills find "Confluence"`)
