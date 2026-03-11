---
estimated_steps: 5
estimated_files: 5
---

# T03: Wire enriched review state into intervention APIs, detail UI, and artifact drafting

**Slice:** S02 — Decision tracking in feature request workflows
**Milestone:** M001

## Description

Close the loop on S02 by replacing raw-cache consumption with the shared assembler in the live intervention and artifact flows, extending artifact context with review fields, and rendering durable review decisions directly in the intervention detail experience.

## Steps

1. Update the intervention API route to assemble enriched feature requests server-side before generating the brief so downstream views receive review-aware data consistently.
2. Replace the unsafe cast in the artifact generation route with assembler-backed lookup and return stable error payloads when the feature request or review-aware assembly is missing.
3. Extend artifact template context and generator logic so follow-ups, clarification requests, and status-oriented drafts can reference review rationale, pending decisions, and next actions where appropriate.
4. Upgrade `FeatureRequestDetail` to render a real review decision section showing review status, rationale, pending decisions, next actions, and review timing using the assembled contract.
5. Run the named slice tests and typecheck to prove the real UI/API wiring now consumes the shared enriched shape end to end at integration level.

## Must-Haves

- [ ] Intervention and artifact routes both use the shared assembler instead of raw cache casts or duplicate enrichment logic.
- [ ] The intervention detail UI shows persisted review outcomes and recommended next actions as user-visible workflow state, not hidden metadata.
- [ ] Review-aware artifact generation exposes stable invalid-request errors and includes director review context in the template input.

## Verification

- `cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts tests/control-tower/artifact-generator.test.ts tests/control-tower/intervention-engine.test.ts`
- `cd web && npm run typecheck`

## Observability Impact

- Signals added/changed: Review metadata becomes visible in intervention API payloads, detail UI state, and artifact-generation error responses.
- How a future agent inspects this: Check the intervention route payload, artifact route errors, or the rendered review section in `FeatureRequestDetail`.
- Failure state exposed: Missing assembled feature requests and invalid generation requests produce stable API error codes/details instead of unsafe-cast runtime ambiguity.

## Inputs

- `web/app/api/control-tower/intervention/route.ts` — current raw-cache brief route to rewire through the assembler.
- `web/app/api/control-tower/artifacts/generate/route.ts` — current unsafe cast boundary that must be replaced.
- `web/components/intervention/FeatureRequestDetail.tsx` — live intervention detail surface that needs durable review-state rendering.
- T02 assembler/store implementation — the shared enriched contract this task wires into the app.

## Expected Output

- `web/app/api/control-tower/intervention/route.ts` — intervention brief route backed by the assembled enriched feature-request shape.
- `web/app/api/control-tower/artifacts/generate/route.ts` — artifact generation route using assembler-backed lookup and stable review-aware errors.
- `web/lib/control-tower/artifacts/types.ts` — template context extended with review fields.
- `web/lib/control-tower/artifacts/generator.ts` — review-aware drafting context consumption.
- `web/components/intervention/FeatureRequestDetail.tsx` — visible review decision section in the real intervention workflow.
