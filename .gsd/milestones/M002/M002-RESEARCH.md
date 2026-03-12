# M002 — Research

**Date:** 2026-03-12

## Summary

The codebase already contains a thin people-management stub, but it is not yet a real operating layer. `web/app/people/page.tsx` renders hard-coded PMs and locally generated placeholder documents, while `web/lib/control-tower/people-engine.ts` derives only a narrow set of evidence directly from raw feature requests. That means M002 should not be planned as a greenfield milestone, but it also should not assume the current `/people` page is close to done. The highest-value path is to reuse the proven M001 patterns: assemble authoritative runtime state server-side, preserve private people-management data in local overlay storage if needed, and keep every formal output draft-only or approval-gated.

The strongest recommendation is to make M002 about one assembled PM operating model rather than separate disconnected utilities. The milestone should first prove that real PM portfolio evidence and 1:1 urgency signals can be derived from live data and rendered usefully, then add durable private notes or draft state, and finally close the loop with draft generation and approval-safe handling. That sequence retires the biggest risk early: whether the product can turn feature-request context into genuinely useful people-management intelligence instead of another mock dashboard.

## Recommendation

Take an assembled-model-first approach. Build a server-side people intelligence seam that groups enriched feature requests by PM owner, derives coaching evidence and 1:1 readiness from that grouped state, and exposes stable diagnostics for missing PM identity or weak evidence. Reuse the M001 overlay and approval patterns for any durable people notes or draft state instead of embedding client-local state or mutating source records directly.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Runtime workflow state drifting across routes and UI | `web/lib/control-tower/feature-request-assembler.ts` | M001 already proved that one assembled seam keeps APIs, UI, and tests aligned |
| Private orchestration state living in source data | `web/lib/control-tower/reviews.ts` overlay pattern | The overlay model already matches the user’s trust boundary and local-first architecture |
| Approval-safe delivery of drafted output | `web/lib/assistant/comms-engine.ts` + artifact viewer submission flow | M001 already proved draft-only handoff and inspectable status for outbound content |
| Route failure ambiguity | Stable `code` + diagnostics envelopes from M001 routes | This gives future agents and users inspectable failure state without guessing |

## Existing Code and Patterns

- `web/lib/control-tower/feature-request-assembler.ts` — authoritative pattern for assembling runtime workflow state from cached feature requests plus overlay metadata
- `web/lib/control-tower/reviews.ts` — model for local persisted overlay data with stable timestamps and deterministic tests
- `web/lib/control-tower/people-engine.ts` — starting point for PM evidence extraction, but currently too narrow and raw-feature-request-centric for milestone completion by itself
- `web/app/people/page.tsx` — existing user-visible entrypoint, but it currently uses mock PM profiles and locally generated placeholder draft content
- `web/components/artifacts/ArtifactViewer.tsx` — reusable draft surface for 1:1 prep or IDP/feedback artifacts once live data drives content
- `web/lib/control-tower/artifacts/templates.ts` — already includes `idp_feedback`, which should be reused or tightened rather than replaced casually

## Constraints

- M002 must not turn the app into an HR system of record; formal performance records still need approval-gated handling and should remain separate from private local synthesis.
- M002 should not rely on mock PM profiles for milestone proof; the live `/people` experience needs to be driven from actual synthesized portfolio context.
- PM identity likely originates from `pmOwner` on feature requests, so normalization and missing-data handling will matter.
- Any durable people-management data should preserve the same local-first overlay discipline already established in M001.

## Common Pitfalls

- **Treating the existing `/people` page as mostly complete** — it is a placeholder shell with mock profiles and hard-coded draft content, so planning should assume substantial rewiring.
- **Deriving people intelligence from too-thin signals** — feature-request evidence alone can become generic unless the slice makes missing evidence and low-confidence states explicit.
- **Mixing private notes with formal records** — keep draft notes, coaching synthesis, and any formal share/save action clearly separated by approval state.
- **Creating a parallel assembly path** — reuse M001’s assembled-state pattern instead of adding route-specific PM calculations in multiple places.

## Open Risks

- The current dataset may not contain enough stable PM identity or longitudinal context to make coaching evidence persuasive without adding local overlays or explicit low-confidence handling.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Next.js / frontend UI | `frontend-design` | available |
| complex debugging | `debug-like-expert` | available |
| library/framework lookup | Context7 tools | available |

## Sources

- Current people-management objective and deliverables (source: `build-plan.md`)
- 1:1 workflow expectations and people-management requirements (source: `requirements.md`)
- Existing mock `/people` implementation and placeholder people types/engine (source: `web/app/people/page.tsx`, `web/lib/control-tower/people-engine.ts`, `web/lib/control-tower/people-types.ts`)
- Reusable runtime patterns for assembled state, overlays, diagnostics, and approval-gated handoff (source: M001 slice summaries and shipped files)
