# M001/S02 — Research

**Date:** 2026-03-11

## Summary

S02 owns the durable operating layer that S01 explicitly left undone: review outcomes, pending decisions, rationale, and next actions need to persist at the feature-request level and then show up in both intervention and detail workflows. The active requirements most directly targeted here are **R006** (primary ownership), plus supporting coverage for **R001**, **R002**, **R003**, **R004**, and **R008**. Research shows the current codebase already has a strong derived read model for readiness (`readiness-evaluator.ts` + `grooming-engine.ts`), a stable intervention overlay (`intervention-engine.ts`), and an existing local persistence precedent for private orchestration metadata (`notes.ts`). What is missing is a review record model and a composition seam that merges persisted review metadata with derived feature-request intelligence before UI rendering.

The cleanest path is to keep Jira and Confluence as upstream systems of record and add a **private local review store** beside the existing cache/notes files. That review store should hold only director-orchestration metadata: review status, decision rationale, pending decisions, next actions, timestamps, and review provenance. The intervention and artifact flows should then consume an enriched feature-request shape assembled server-side, rather than forcing client components or artifact generation routes to cast plain cached requests into richer types. This preserves the overlay model, reuses S01’s readiness contract as the canonical prep signal, and avoids duplicating truth in Jira/Confluence.

## Recommendation

Implement S02 around a new **review overlay module** with three layers:

1. **Persisted review record store**: local JSON-backed storage similar to `web/lib/control-tower/notes.ts`, but scoped to feature-request review metadata.
2. **Assembler/enricher layer**: server-side functions that take cached/ingested `FeatureRequest`s, compute readiness/intervention as needed, attach persisted review records, and expose a stable enriched type for API/UI consumers.
3. **Surface integration**: intervention brief/detail views and artifact-generation context should read from the assembled enriched shape, not from bare cached requests or unsafe casts.

Do not hand-roll review state inside React component state or attach it ad hoc to the existing feature-request cache object. That would create inconsistent read paths, make persistence fragile, and increase the odds of parallel type shapes drifting across grooming, intervention, and artifact flows.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Private orchestration metadata persistence | `web/lib/control-tower/notes.ts` | Already establishes the local JSON file pattern for director-only overlay data without violating systems-of-record boundaries. |
| Readiness evaluation logic | `web/lib/control-tower/readiness-evaluator.ts` + `web/lib/control-tower/grooming-engine.ts` | S01 already proved this contract; S02 should reference it instead of inventing a second readiness or review-prep model. |
| Intervention ranking/grouping | `web/lib/control-tower/intervention-engine.ts` | Existing intervention brief behavior should be extended by composition, not replaced or forked. |
| Cache access for base feature requests | `web/lib/control-tower/cache.ts` | Centralizes local feature-request loading; use it as the base input, then enrich in a dedicated overlay layer. |

## Existing Code and Patterns

- `web/lib/control-tower/types.ts` — base `FeatureRequest` domain object plus the S01 readiness contract. This is the correct place to extend shared review-facing types carefully, but avoid polluting the raw cache shape with derived/persisted overlays unless the distinction stays explicit.
- `web/lib/control-tower/readiness-evaluator.ts` — authoritative readiness/rubric logic. S02 should store review decisions *against* this evaluator output, not recompute or paraphrase readiness rules in UI code.
- `web/lib/control-tower/grooming-engine.ts` — preserves `readiness.evaluations` and grouped summaries. This is the established seam for downstream decision workflows to consume per-request readiness diagnostics.
- `web/lib/control-tower/intervention-engine.ts` — currently enriches `FeatureRequest` into `FeatureRequestWithIntervention` using derived intervention reasons only. This is the natural place to either compose in review state or to be wrapped by a higher-level assembler that returns a richer feature-request detail model.
- `web/app/api/control-tower/intervention/route.ts` — currently reads cached feature requests and returns a derived intervention brief. This route is a prime integration point for adding persisted review metadata to the intervention surfaces.
- `web/components/intervention/FeatureRequestDetail.tsx` — today it shows action buttons, blockers, notes, and linked sources, but no durable review decision state. It is the main user-visible detail surface S02 needs to upgrade.
- `web/app/intervention/page.tsx` — already has a modal-driven workflow and is the live entry point for director operations; S02 should wire review outcomes here instead of creating a separate disconnected page.
- `web/lib/control-tower/artifacts/generator.ts` — artifact drafts currently use intervention context, blockers, and risks but know nothing about review rationale, pending decisions, or recommended follow-up actions. S02 can materially advance R004 by feeding review metadata into template context.
- `web/app/api/control-tower/artifacts/generate/route.ts` — currently performs an unsafe cast from cached `FeatureRequest` to `FeatureRequestWithIntervention`. This is a real structural warning for S02: more overlays will make this cast even less trustworthy unless the route switches to a proper assembler.
- `web/lib/control-tower/notes.ts` — demonstrates the local-cache persistence pattern for private metadata with add/update/delete semantics and timestamps. Reuse this approach for review records.
- `web/lib/control-tower/index.ts` — barrel export is server-capable but unsafe for client imports, as S01 already proved. Any S02 client components should keep browser-safe imports explicit.

## Constraints

- **Systems-of-record boundary is fixed.** S02 must preserve D004/R008: Jira remains execution truth, Confluence remains documentation truth, and review metadata stays a private orchestration overlay.
- **S01 readiness types are authoritative.** Per S01 forward intelligence, `GroomingReadinessEntry` and `FeatureRequestReadinessEvaluation` should be reused rather than replaced.
- **Client import boundaries remain fragile.** `web/app/grooming/page.tsx` cannot safely import the whole control-tower barrel; any new client review UI must keep browser-safe imports explicit.
- **Current intervention route reads from cache, while grooming route re-ingests live data.** S02 needs to choose and document a consistent base data source for decision surfaces, or stale/partial review overlays will appear inconsistent across pages.
- **Artifact generation currently expects enriched data but reads raw cache.** Without a shared assembler, review-aware artifact generation will drift or break.
- **Approval-gated behavior must remain intact.** Review recording is allowed as private local orchestration metadata; anything implying external commitment or send/writeback must still stay approval-gated.

## Common Pitfalls

- **Creating a second readiness model inside review state** — avoid storing duplicated verdict/rubric copies unless you explicitly need snapshot history. Prefer referencing current evaluator output and persisting only director decisions/rationale.
- **Mutating the raw feature-request cache into a mixed source-of-truth blob** — keep persisted review metadata separate from synced feature-request cache data so refresh/sync flows do not accidentally wipe or overwrite review state.
- **Unsafe type casting in API routes** — `artifacts/generate/route.ts` already casts cached feature requests to `FeatureRequestWithIntervention`; S02 should replace casts with explicit enrichment before more overlays are added.
- **Attaching review logic directly to client state** — decision tracking must survive reloads and syncs, so local component state is insufficient except for transient form UX.
- **Reintroducing barrel imports into client code** — S01 already found a real bundle failure caused by server-only exports leaking into the client bundle.
- **Letting intervention and detail views diverge** — if one route assembles review state and another does not, the operating loop will become untrustworthy.

## Open Risks

- The repo currently has two different data acquisition patterns: intervention uses cached requests, while grooming uses fresh ingestion. If review records key off feature-request IDs but one flow sees stale or different request sets, the user may perceive missing decisions or inconsistent readiness.
- It is not yet decided whether review state should snapshot the readiness verdict at review time or always render against the latest derived readiness. Always-latest is simpler, but snapshotting may be necessary for auditability and rationale context.
- Artifact templates and generator context will likely need extension for pending decisions and next actions; if that is not done carefully, S02 may partially deliver R004 only in UI surfaces but not in drafting workflows.
- Existing intervention tests do not cover review metadata, persistence, or enriched detail flows. S02 will need new contract tests around assembly and persistence, not just UI rendering.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Next.js | `vercel/next.js@runtime-debug` | available via `npx skills add vercel/next.js@runtime-debug` |
| React | `reactjs/react.dev@react-expert` | available via `npx skills add reactjs/react.dev@react-expert` |
| TypeScript | `spillwavesolutions/mastering-typescript-skill@mastering-typescript` | available via `npx skills add spillwavesolutions/mastering-typescript-skill@mastering-typescript` |
| Frontend UI work | `frontend-design` | installed in system context |

## Sources

- S02 requirement and boundary ownership were derived from the inlined roadmap, milestone context, requirements, and S01 forward-intelligence summary (preloaded slice context).
- Review persistence precedent and private-overlay pattern came from `web/lib/control-tower/notes.ts`.
- Base feature-request cache boundaries came from `web/lib/control-tower/cache.ts`.
- Existing intervention derivation and grouping behavior came from `web/lib/control-tower/intervention-engine.ts` and `web/tests/control-tower/intervention-engine.test.ts`.
- Existing readiness contract and downstream reuse seam came from `web/lib/control-tower/readiness-evaluator.ts`, `web/lib/control-tower/grooming-engine.ts`, and `web/app/grooming/page.tsx`.
- Current intervention API/detail workflow integration points came from `web/app/api/control-tower/intervention/route.ts`, `web/app/intervention/page.tsx`, `web/components/intervention/FeatureRequestCard.tsx`, and `web/components/intervention/FeatureRequestDetail.tsx`.
- Artifact-generation coupling and unsafe cast risk came from `web/lib/control-tower/artifacts/generator.ts`, `web/lib/control-tower/artifacts/types.ts`, and `web/app/api/control-tower/artifacts/generate/route.ts`.
