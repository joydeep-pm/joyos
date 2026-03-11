# M001/S03 — Research

**Date:** 2026-03-11

## Summary

S03 owns the integration proof for the pre-grooming operating loop, not another domain-model rewrite. Based on S01 and S02, the core seams already exist: S01 established a reusable readiness contract and S02 established a durable review overlay plus the shared `assembleFeatureRequests(...)` seam that assembles readiness, intervention, and persisted review state. The biggest gap is the missing action layer in the live app: there is still no UI/API path to create or edit review records from the intervention flow, and there is no integrated browser-proven path that carries a request from review capture through follow-up drafting and approval-gated handoff.

The recommended S03 approach is to add a review-capture mutation path on top of the existing overlay store, wire that into the existing detail modal instead of creating a separate workflow surface, and then verify the full loop in the real app: open intervention detail → capture/update review decision → confirm review state reappears in assembled intervention/detail data → generate a follow-up/clarification artifact that uses the persisted review state → submit the artifact into the approval-gated comms flow without bypassing approval. This targets the slice’s supported requirements directly: R002 feature-request-centric workspace, R007 approval-gated output behavior, and R008 systems-of-record overlay discipline.

## Recommendation

Implement S03 as an integration slice centered on one shared workflow spine:

1. **Mutation seam:** add a control-tower review API that validates and persists review records via `upsertFeatureRequestReview(...)` / `updateFeatureRequestReview(...)`.
2. **UI seam:** embed review capture/editing directly inside `web/components/intervention/FeatureRequestDetail.tsx`, because that component already displays the persisted review record and already owns draft-generation actions.
3. **Read seam:** keep all downstream reads on `assembleFeatureRequests(...)`; do not let any new route or component read raw cached feature requests directly.
4. **Follow-up seam:** continue using artifact generation plus `ArtifactViewer` submission to `/api/assistant/comms/draft`, because that already preserves the approval gate instead of directly sending.
5. **Proof seam:** verify with browser/runtime that the live intervention experience supports the end-to-end loop, then backstop with focused contract tests for review mutation and any new route.

This approach reuses the established overlay architecture, avoids duplicating review state across client and cache, and keeps the systems-of-record boundary intact. The main engineering risk is not missing primitives; it is workflow drift if S03 introduces a parallel review form, bypasses the assembler, or shortcuts the approval gate when turning generated artifacts into outbound comms drafts.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Enriching feature requests with readiness + review + intervention state | `web/lib/control-tower/feature-request-assembler.ts` | This is already the authoritative seam from S02 and emits diagnostics for orphaned review state. |
| Persisting private director review data | `web/lib/control-tower/reviews.ts` | It already writes the local overlay, preserves stable timestamps, and avoids mutating Jira/Confluence-backed cache data. |
| Approval-gated outbound follow-up | `web/components/artifacts/ArtifactViewer.tsx` + `web/app/api/assistant/comms/draft/route.ts` + `web/lib/assistant/comms-engine.ts` | This path creates drafts only and requires explicit approval before send, matching R007. |
| Review-aware drafting context | `web/lib/control-tower/artifacts/generator.ts` | Artifact content already consumes review summary, rationale, pending decisions, next actions, and readiness signals. |

## Existing Code and Patterns

- `web/lib/control-tower/feature-request-assembler.ts` — canonical server-side composition seam; S03 should continue routing all workflow-state reads through this function so readiness, review overlay, and diagnostics stay aligned.
- `web/lib/control-tower/reviews.ts` — JSON-backed private review overlay store with `upsertFeatureRequestReview(...)` and `updateFeatureRequestReview(...)`; this is the natural mutation backend for live review capture.
- `web/components/intervention/FeatureRequestDetail.tsx` — already renders explicit review presence/absence and already hosts artifact-generation actions, making it the right place to add review capture/editing rather than creating a new page.
- `web/app/api/control-tower/intervention/route.ts` — already returns assembled review-aware intervention data plus diagnostics; likely the main runtime surface to refresh after review mutation.
- `web/app/api/control-tower/artifacts/generate/route.ts` — already uses assembled feature requests and returns stable failure codes; reuse this as the drafting entrypoint after review capture.
- `web/components/artifacts/ArtifactViewer.tsx` — already converts generated artifacts into approval-gated comms drafts; S03 should preserve this gate instead of adding direct-send behavior.
- `web/lib/control-tower/artifacts/comms-integration.ts` — maps artifact types to comms draft types and destinations; if S03 broadens the loop, extend this mapping rather than inventing a second comms conversion path.
- `web/lib/control-tower/index.ts` — still re-exports server-only modules such as cache/reviews. S01 already proved that client components must not import the barrel.
- `web/tests/control-tower/review-store.test.ts` — authoritative contract for overlay persistence semantics, timestamps, and single-record-per-feature-request behavior.
- `web/tests/control-tower/feature-request-assembler.test.ts` — authoritative contract for assembled review state and orphaned-review diagnostics.

## Constraints

- S03 must preserve the **feature-request-centric overlay model** from R002/R008: review decisions live in the private overlay and must not mutate Jira/Confluence-backed cache records.
- Approval-gated behavior from R007 is mandatory: generated follow-ups may become comms drafts, but actual send must still go through `/api/assistant/comms/[id]/approve` and `/api/assistant/comms/[id]/send`.
- `FeatureRequestDetail.tsx` is a client component, so it must not import the `@/lib/control-tower` barrel because `web/lib/control-tower/index.ts` re-exports server-only modules.
- Existing review persistence is **one review record per feature request**, updated in place by `upsertFeatureRequestReview(...)`; S03 should design the editor around “current review state” rather than a multi-entry history UI unless the scope explicitly expands.
- The current intervention route summary is still locally composed inside the route; if S03 adds richer narrative/status language, route and engine can drift unless consolidated.

## Common Pitfalls

- **Bypassing the assembler for convenience** — avoid reading raw cached feature requests in new routes or UI loaders; use `assembleFeatureRequests(...)` so review/readiness/intervention state stays consistent and diagnostics survive.
- **Reintroducing client-bundle breakage through barrel imports** — keep client code on browser-safe direct imports from `types`, UI-safe helpers, or explicit API calls; do not import `@/lib/control-tower` from client components.
- **Accidentally bypassing approval** — `ArtifactViewer` submits to `/api/assistant/comms/draft`, which only creates a draft. Do not add a “send now” shortcut from the control tower workflow.
- **Treating missing review state implicitly** — preserve the explicit `{ present: false, record: null }` shape from S02 so the UI can distinguish “not reviewed yet” from “load failed” or “field missing”.
- **Over-modeling review history** — the store upserts by `featureRequestId`; a lightweight edit/update flow fits the current contract better than a timeline/history subsystem.

## Open Risks

- The slice’s definition of done requires live app proof, but S02 explicitly noted that review-aware runtime behavior is still contract-backed rather than browser-exercised. If the current local data does not make the loop easy to exercise, S03 may need a deterministic mock-data/bootstrap step for browser verification.
- There is no current review mutation API contract, so validation, status-code design, and refresh behavior remain open. Poor mutation contracts could weaken the otherwise strong diagnostics introduced in S02.
- `ArtifactViewer` uses browser alerts for submission success/failure and closes immediately after draft submission. This may make browser verification of the pre-grooming loop more awkward unless the parent workflow surfaces the created draft state more explicitly.
- The current comms draft API accepts only `type`, `destination`, `date`, and `actor`, while `ArtifactViewer` posts a fuller draft-shaped object. The route currently ignores extra fields and creates a fresh assistant-generated draft instead of faithfully persisting the submitted artifact content. That is a likely integration bug or mismatch S03 should inspect before claiming the follow-up drafting loop is truly assembled.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Frontend UI / React UI integration | `frontend-design` | installed |
| Next.js | `vercel/next.js@update-docs` | available via `npx skills add vercel/next.js@update-docs` |
| Next.js runtime debugging | `vercel/next.js@runtime-debug` | available via `npx skills add vercel/next.js@runtime-debug` |
| React | `reactjs/react.dev@react-expert` | available via `npx skills add reactjs/react.dev@react-expert` |
| Tailwind CSS | `josiahsiegel/claude-plugin-marketplace@tailwindcss-advanced-layouts` | available via `npx skills add josiahsiegel/claude-plugin-marketplace@tailwindcss-advanced-layouts` |
|
Core directly relevant installed skills from the current environment are limited to `frontend-design`; no dedicated installed skill exists for Next.js or React runtime workflow work, but the skills above are the most relevant external candidates by install count and fit.

## Sources

- S03 should build on the shared assembled feature-request seam and preserve orphaned-review diagnostics rather than introducing parallel reads (source: repo code — `web/lib/control-tower/feature-request-assembler.ts`)
- Review persistence already supports create/update semantics with stable timestamps and one-record-per-feature-request behavior (source: repo code — `web/lib/control-tower/reviews.ts`)
- The live detail modal already renders review state and hosts artifact-generation actions, making it the natural review-capture surface (source: repo code — `web/components/intervention/FeatureRequestDetail.tsx`)
- Approval-gated comms behavior already exists through draft → approve → send routes and engine functions (source: repo code — `web/components/artifacts/ArtifactViewer.tsx`, `web/app/api/assistant/comms/draft/route.ts`, `web/app/api/assistant/comms/[id]/approve/route.ts`, `web/app/api/assistant/comms/[id]/send/route.ts`, `web/lib/assistant/comms-engine.ts`)
- Review-aware artifact generation is already wired and tested; S03 should reuse this instead of inventing a separate follow-up renderer (source: repo code — `web/app/api/control-tower/artifacts/generate/route.ts`, `web/tests/control-tower/artifact-generator.test.ts`)
- Client code must avoid the control-tower barrel because it re-exports server-only modules (source: repo code — `web/lib/control-tower/index.ts`; corroborated by S01 forward intelligence)
- Candidate ecosystem skills were discovered via `npx skills find "Next.js"`, `npx skills find "React"`, and `npx skills find "Tailwind CSS"` run in the repo.
