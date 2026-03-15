# S02: Roadmap drafting through artifact workflows

**Goal:** Prove roadmap communications can be drafted through the existing artifact workflow by adding explicit roadmap update and roadmap deck outline outputs.
**Demo:** From a feature request detail view, Joydeep can draft a vertical-specific roadmap update and a business-facing roadmap deck outline without creating a separate subsystem.

## Must-Haves

- Reuse the existing artifact generation flow.
- Add distinct roadmap drafting outputs for stakeholder roadmap updates and roadmap deck outlines.
- Keep Product Update vs Roadmap Update distinct in content shape and naming.
- Verify both generator coverage and UI action exposure.

## Proof Level

- This slice proves: integration
- Real runtime required: no
- Human/UAT required: light artifact walkthrough only

## Verification

- `cd web && npm run test -- --run tests/control-tower/artifact-generator.test.ts tests/control-tower/roadmap-artifact-ui.test.tsx`
- `cd web && npm run typecheck`

## Observability / Diagnostics

- Runtime signals: generator and UI tests
- Inspection surfaces: `FeatureRequestDetail`, artifact generator, artifact viewer, comms integration
- Failure visibility: unsupported artifact types or missing UI actions fail explicitly in tests and typecheck

## Tasks

- [x] **T01: Extend artifact typing and generation for roadmap drafts** `est:50m`
- [x] **T02: Expose roadmap draft actions in the feature request workflow** `est:30m`
- [x] **T03: Verify roadmap draft generation with tests** `est:35m`

## Files Touched

- `web/lib/control-tower/artifacts/types.ts`
- `web/lib/control-tower/artifacts/generator.ts`
- `web/lib/control-tower/artifacts/templates.ts`
- `web/lib/control-tower/artifacts/comms-integration.ts`
- `web/components/intervention/FeatureRequestDetail.tsx`
- `web/components/artifacts/ArtifactViewer.tsx`
- `web/tests/control-tower/artifact-generator.test.ts`
- `web/tests/control-tower/roadmap-artifact-ui.test.tsx`
