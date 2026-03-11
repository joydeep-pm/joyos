---
estimated_steps: 5
estimated_files: 5
---

# T02: Implement persisted review store and shared enriched feature-request assembler

**Slice:** S02 — Decision tracking in feature request workflows
**Milestone:** M001

## Description

Create the durable operating layer for S02 by adding a local JSON-backed review store, typed review models, and a shared assembler that merges cached feature requests with S01 readiness, intervention intelligence, and persisted review metadata into one server-side contract.

## Steps

1. Extend the control-tower types with explicit review-record and enriched feature-request interfaces that preserve the distinction between raw cached feature requests and private overlay metadata.
2. Implement `web/lib/control-tower/reviews.ts` using the existing notes-store pattern for reading, writing, upserting, and querying persisted review records by feature-request ID.
3. Build `web/lib/control-tower/feature-request-assembler.ts` to combine cached feature requests with readiness evaluations and persisted reviews, returning enriched records plus structured diagnostics for orphaned review entries.
4. Update intervention engine types/functions to consume the enriched assembled shape so review state travels with intervention analysis without breaking existing prioritization logic.
5. Export only the server-safe assembler/store seams needed by routes while preserving the client import boundary lessons from S01.

## Must-Haves

- [ ] Review metadata persists outside the feature-request cache and includes timestamps, rationale, pending decisions, next actions, and provenance.
- [ ] The assembler returns one enriched feature-request contract plus stable diagnostics for mismatched review records.
- [ ] Intervention analysis continues to work on top of the enriched shape without reintroducing unsafe client/server import coupling.

## Verification

- `cd web && npm test -- --run tests/control-tower/review-store.test.ts tests/control-tower/feature-request-assembler.test.ts tests/control-tower/intervention-engine.test.ts`
- `cd web && npm test -- --run tests/control-tower/feature-request-assembler.test.ts -t "returns structured review diagnostics when a persisted review targets a missing feature request"`

## Observability Impact

- Signals added/changed: Persisted review timestamps/status and structured assembler diagnostics for missing feature-request matches.
- How a future agent inspects this: Read review records through the new store helpers or inspect assembler output via tests and the routes that consume it.
- Failure state exposed: Orphaned review records and missing assembly matches are returned as explicit diagnostic objects instead of disappearing silently.

## Inputs

- `web/lib/control-tower/types.ts` — existing feature-request and readiness contract from S01 that must remain authoritative.
- `web/lib/control-tower/notes.ts` — local JSON persistence pattern to reuse for private orchestration metadata.
- `web/lib/control-tower/intervention-engine.ts` — downstream analysis surface that must accept the enriched shape.
- T01 failing tests — the contract this implementation must satisfy.

## Expected Output

- `web/lib/control-tower/types.ts` — typed review-record and enriched feature-request interfaces.
- `web/lib/control-tower/reviews.ts` — working persisted review overlay store.
- `web/lib/control-tower/feature-request-assembler.ts` — shared server-side enrichment and diagnostics seam.
- `web/lib/control-tower/intervention-engine.ts` — intervention analysis updated to operate on the enriched feature-request contract.
- `web/lib/control-tower/index.ts` — exports adjusted so server consumers can use the new assembler/store safely.
