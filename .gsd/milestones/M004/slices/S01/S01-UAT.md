# S01: Director-of-products role scaffolding and workflow uplift — UAT

**Milestone:** M004
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: this slice only changes markdown guidance, workflows, and example artifacts; there is no live runtime behavior to exercise yet.

## Preconditions

- The updated markdown files are present in the repo.
- The reader has access to `requirements.md` for comparison against the resulting operating model.

## Smoke Test

Read `AGENTS.md` and confirm it clearly behaves like a Director-of-Products operating contract for Joydeep rather than a generic productivity assistant.

## Test Cases

### 1. Core role alignment

1. Open `AGENTS.md`.
2. Confirm the document references Joydeep’s role, Director Intervention Briefs, and Today’s Three.
3. **Expected:** The assistant contract is explicitly role-specific and grounded in Documentation, Stability, New Business, and Team Leadership.

### 2. Planning workflow alignment

1. Open `examples/workflows/morning-standup.md`.
2. Open `examples/workflows/weekly-review.md`.
3. **Expected:** Morning planning is intervention-first, and weekly review reflects operating goals, blocker patterns, and system learnings.

### 3. Continuity scaffold coverage

1. Open `examples/workflows/meeting-followup.md` and `examples/workflows/one-on-one-prep.md`.
2. Open the example files under `examples/example_files/`.
3. **Expected:** Meetings, people context, feature requests, and weekly review artifacts have concrete markdown patterns that a future user or agent can follow.

## Edge Cases

### Generic-language regression

1. Search the updated docs for broad generic productivity phrasing.
2. **Expected:** The dominant framing remains Director-of-Products-specific and intervention-oriented.

## Failure Signals

- `AGENTS.md` still reads like a generic personal productivity assistant.
- Morning or weekly workflows do not mention intervention, Today’s Three, or operating goals.
- The workflow index references missing files.
- The example artifacts do not reflect feature requests, PM coaching, or weekly review patterns.

## Requirements Proved By This UAT

- R001 — proves the markdown-side daily intervention brief behavior is now explicitly defined.

## Not Proven By This UAT

- No setup scaffolding is proven.
- No live web-app behavior is proven.
- No automation or runtime persistence is proven.

## Notes for Tester

This slice intentionally stops at the markdown contract and example-artifact level. Future slices should decide whether to continue with setup/template alignment or return to the earlier web-app orchestration plan under a new slice boundary.
