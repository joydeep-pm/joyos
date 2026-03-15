---
id: T01
parent: S02
milestone: M009
provides:
  - New artifact types and generator paths for roadmap updates and roadmap deck outlines
key_files:
  - web/lib/control-tower/artifacts/types.ts
  - web/lib/control-tower/artifacts/generator.ts
  - web/lib/control-tower/artifacts/templates.ts
  - web/lib/control-tower/artifacts/comms-integration.ts
key_decisions:
  - Reuse the existing artifact workflow instead of introducing a separate roadmap drafting subsystem
  - Keep custom roadmap content generation distinct even when template metadata falls back to existing generic template registration
patterns_established:
  - Roadmap outputs can be added as new artifact types with dedicated content generators and shared delivery plumbing
observability_surfaces:
  - artifact generator tests
  - typecheck
verification_result: passed
completed_at: 2026-03-15
---

# T01: Extend artifact typing and generation for roadmap drafts

Added two explicit artifact types:
- `roadmap_update`
- `roadmap_deck_outline`

The generator now produces distinct content for each:
- roadmap update = vertical/stakeholder-facing status and forward plan
- roadmap deck outline = business/RFP-facing slide structure across verticals and platform strengths

Comms integration and viewer labels were updated so these artifacts travel through the existing flow cleanly.
