# S01: Meeting-to-artifact markdown contract

**Goal:** Define and implement the repo’s first durable meeting intelligence contract so a meeting note can be converted into structured follow-up artifacts instead of remaining a static document.
**Demo:** The repo contains a concrete meeting note template, follow-up extraction workflow, and example outputs showing how one meeting produces tasks, blockers, people updates, feature-request updates, and learnings.

## Must-Haves

- Create or refine a durable meeting note contract that supports post-meeting extraction.
- Define explicit output targets for meeting-derived follow-ups.
- Add example artifacts that demonstrate a complete meeting → follow-up transformation.
- Verify the workflow/docs are internally consistent and usable by a future agent.

## Proof Level

- This slice proves: contract
- Real runtime required: no
- Human/UAT required: no

## Verification

- `rg -n "Meeting|Action items|Risks|Follow-ups|Feature Request|People|Learnings|blocker" examples/workflows/meeting-followup.md examples/example_files docs core/integrations/granola`
- `git diff -- examples/workflows/meeting-followup.md examples/example_files docs/runbooks/meeting-followup-runbook.md | sed -n '1,260p'`

## Observability / Diagnostics

- Runtime signals: none
- Inspection surfaces: workflow docs, example files, meeting follow-up runbook
- Failure visibility: inconsistent note structures or missing output targets visible directly in the docs/examples
- Redaction constraints: examples must stay synthetic and avoid real sensitive meeting content

## Integration Closure

- Upstream surfaces consumed: existing meeting-followup workflow, Knowledge scaffolds, optional Granola docs
- New wiring introduced in this slice: a concrete markdown contract for meeting-derived follow-ups
- What remains before the milestone is truly usable end-to-end: actual integration into the operating graph and a later visible review path

## Tasks

- [x] **T01: Tighten the meeting note and follow-up contract** `est:40m`
  - Why: The current meeting-followup workflow exists, but the repo still needs a crisp, reusable contract for how meeting notes should be structured and what outputs they should produce.
  - Files: `examples/workflows/meeting-followup.md`, `docs/runbooks/meeting-followup-runbook.md`
  - Do: Refine the workflow into a more explicit contract, including expected meeting note sections, extraction order, and durable output targets.
  - Verify: `rg -n "Action items|Risks|Follow-ups|Feature-Requests|People|Learnings" examples/workflows/meeting-followup.md docs/runbooks/meeting-followup-runbook.md`
  - Done when: A future agent can reliably read the workflow and know exactly how to process one meeting into durable outputs.
- [x] **T02: Add end-to-end example meeting artifacts** `est:35m`
  - Why: The contract should be demonstrated with concrete markdown examples, not just prose.
  - Files: `examples/example_files/meeting-note-example.md`, `examples/example_files/meeting-followup-output-example.md`
  - Do: Add a representative meeting note example plus a downstream example showing the resulting tasks/context updates derived from that meeting.
  - Verify: `rg -n "Meeting Note Example|Action items|Open questions|Feature Request|People Note|Learning" examples/example_files/meeting*`
  - Done when: The repo contains a clear example of the meeting-to-artifact transformation.
- [x] **T03: Cross-check meeting contract against existing integrations and knowledge scaffolds** `est:25m`
  - Why: The meeting contract should fit the current Granola/docs/setup structure instead of diverging from it.
  - Files: `core/integrations/granola/README.md`, `Knowledge/README.md`, `examples/workflows/meeting-followup.md`
  - Do: Adjust references or guidance where needed so the meeting contract matches the current repo structure and optional Granola path.
  - Verify: `rg -n "Granola|Knowledge/Meetings|Feature-Requests|People|Learnings" core/integrations/granola/README.md Knowledge/README.md examples/workflows/meeting-followup.md`
  - Done when: The meeting contract fits the repo’s actual scaffolds and optional transcript-sync path.

## Files Likely Touched

- `examples/workflows/meeting-followup.md`
- `docs/runbooks/meeting-followup-runbook.md`
- `examples/example_files/meeting-note-example.md`
- `examples/example_files/meeting-followup-output-example.md`
- `core/integrations/granola/README.md`
