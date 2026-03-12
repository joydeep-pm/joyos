# M003 — Research

**Date:** 2026-03-12

## Summary

The repo already contains the first real approval-governed execution path: assistant comms drafts. `web/lib/assistant/comms-engine.ts` stores draft state, approval state, send state, and audit entries, while the related routes already expose draft creation, approval, and send. M001 proved that artifact-authored follow-ups survive into this draft path without bypassing approval, and M002 reused the same draft-safe handling for people-management artifacts. That means M003 should not invent approval-governed automation from scratch. It should generalize the proven pieces into an explicit approval-envelope model and then extend the same discipline to one or more writeback-capable action families.

The primary recommendation is to retire the biggest risk early by formalizing one reusable automation envelope and using the current comms path as the first operational proof. The repo already has durable overlays, assembled workflow state, stable route codes, and audit-capable comms behavior. The milestone should leverage those patterns instead of scattering approval logic across isolated routes. Once proposal, approval, execution, and failure states are explicit and inspectable for one action family, downstream slices can safely extend that model to Jira and Confluence writeback.

## Recommendation

Take an envelope-first approach. Build a reusable approval-envelope seam that can represent proposed action intent, approval state, audit history, execution result, and failure diagnostics. Start by normalizing the current comms flow into that model, then extend it to the first safe writeback-capable target. Do not hand-roll separate approval logic per route.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Durable local orchestration state | `web/lib/control-tower/reviews.ts` and `web/lib/control-tower/people-store.ts` | The overlay pattern is already proven for private workflow state and should be reused for approval envelopes |
| Shared runtime workflow reads | `web/lib/control-tower/feature-request-assembler.ts` and `web/lib/control-tower/people-assembler.ts` | One assembled seam keeps UI, routes, and tests aligned |
| Approval and audit semantics | `web/lib/assistant/comms-engine.ts` | The comms engine already models draft → approve → send plus audit events, which is the closest existing approval-governed execution path |
| Stable route error contracts | control-tower and assistant routes returning `code` fields | This keeps execution failures inspectable and future-agent debugging efficient |

## Existing Code and Patterns

- `web/lib/assistant/comms-engine.ts` — strongest current example of approval-governed lifecycle state and audit recording
- `web/app/api/assistant/comms/draft/route.ts`, `web/app/api/assistant/comms/[id]/approve/route.ts`, `web/app/api/assistant/comms/[id]/send/route.ts` — existing route surfaces that likely inform the milestone’s envelope contract
- `web/components/artifacts/ArtifactViewer.tsx` — already hands generated artifacts into a draft-safe path and surfaces inline status/errors
- `web/lib/control-tower/reviews.ts` and `web/lib/control-tower/people-store.ts` — durable local overlay patterns that should guide envelope persistence
- `web/tests/control-tower/comms-integration.test.ts` and `web/tests/assistant.test.ts` — likely the best current contract signals for approval and audit semantics

## Constraints

- M003 must preserve R007: no communication, writeback, prioritization, assignment, or formal record change may execute without explicit approval.
- M003 must preserve R008: official systems remain systems of record even if Personal OS orchestrates approval and execution.
- The milestone must provide durable failure visibility and auditable state transitions, not just “button clicked” success paths.
- Runtime proof is mandatory because approval-governed automation is operational behavior, not only a type contract.

## Common Pitfalls

- **Generalizing too late** — if approval logic is added route by route, envelope semantics will drift immediately.
- **Treating audit as logging** — audit must be durable lifecycle state, not transient console output.
- **Hiding execution failures** — every failed or blocked action needs stable codes and inspectable state for retries.
- **Conflating proposal with execution** — artifact creation or draft creation is not the same as approved execution; keep those steps explicit.

## Open Risks

- The current comms path may already embody useful approval behavior but still be too specialized to serve as the general envelope model without refactoring.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Next.js / frontend UI | `frontend-design` | available |
| complex debugging | `debug-like-expert` | available |
| library/framework lookup | Context7 tools | available |

## Sources

- Existing comms approval lifecycle and audit behavior (source: `web/lib/assistant/comms-engine.ts`, assistant comms routes, `web/tests/assistant.test.ts`)
- Feature-request artifact-to-draft proof and approval-safe handoff (source: M001/S03 summaries and tests)
- People-management draft-safe reuse of the same pattern (source: M002 summaries and `/people` workflow code)
- Deferred requirement and project milestone framing for audited writeback (source: `.gsd/REQUIREMENTS.md`, `.gsd/PROJECT.md`)
