---
id: T02
parent: S02
milestone: M009
provides:
  - Feature-request detail actions for drafting roadmap updates and roadmap deck outlines
key_files:
  - web/components/intervention/FeatureRequestDetail.tsx
  - web/components/artifacts/ArtifactViewer.tsx
key_decisions:
  - Roadmap drafting should start from the same feature-request detail workflow already used for PRDs and status artifacts
patterns_established:
  - New artifact types should be discoverable from the existing intervention/control-tower modal rather than hidden in a separate route
observability_surfaces:
  - UI test coverage for roadmap draft buttons and generated artifact modal
verification_result: passed
completed_at: 2026-03-15
---

# T02: Expose roadmap draft actions in the feature request workflow

Added visible actions in `FeatureRequestDetail` for:
- Draft Roadmap Update
- Draft Roadmap Deck

This keeps roadmap communication work inside the existing feature-request workflow and makes the drafting path discoverable without adding a separate surface first.
