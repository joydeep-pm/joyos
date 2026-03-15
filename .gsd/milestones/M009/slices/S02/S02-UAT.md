# S02: Roadmap drafting through artifact workflows — UAT

**Milestone:** M009
**Written:** 2026-03-15

## UAT Type

- UAT mode: integration walkthrough
- Why this mode is sufficient: this slice proves draft generation and action exposure through the existing workflow.

## Preconditions

- A feature request is available in the Control Tower / intervention detail flow.
- The artifact generation route is working.

## Test Cases

### 1. Draft roadmap update

1. Open a feature request detail modal.
2. Click **Draft Roadmap Update**.
3. **Expected:** A generated artifact opens with roadmap-update wording, stakeholder summary, roadmap status, next-quarter focus, and evidence links.

### 2. Draft roadmap deck outline

1. Open a feature request detail modal.
2. Click **Draft Roadmap Deck**.
3. **Expected:** A generated artifact opens with a business/RFP-facing slide outline covering vertical coverage, platform strengths, roadmap themes, near-term highlights, and proof points.

## Failure Signals

- Buttons are missing from the detail modal.
- Artifact generation errors on unsupported types.
- Roadmap update content looks like the generic status update instead of a roadmap-specific artifact.

## Not Proven

- Reminder visibility for quarterly Product Deck / Product Factsheet refreshes.
- Slide-design automation or export.
