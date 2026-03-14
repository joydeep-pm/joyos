# S02: Role-aware setup and template alignment — UAT

**Milestone:** M004
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: this slice changes setup and template artifacts, not a running UI or service.

## Preconditions

- The updated `setup.sh` and `core/templates/` files exist in the repo.
- The reviewer has access to the role-specific docs from S01 for comparison.

## Smoke Test

Read `setup.sh` and confirm it clearly onboards a Director-of-Products workspace rather than a generic productivity system.

## Test Cases

### 1. Setup flow alignment

1. Open `setup.sh`.
2. Review the intro text, five questions, and `GOALS.md` template block.
3. **Expected:** The script is framed around role scope, Documentation, Stability, New Business, leadership rhythm, and current interventions.

### 2. Template contract alignment

1. Open `core/templates/AGENTS.md`.
2. Open `core/templates/config.yaml`.
3. **Expected:** The templates reinforce intervention-first planning, Today’s Three, operating goals, and people-aware categories.

### 3. Knowledge scaffold coverage

1. Open the new README files under `core/templates/Knowledge/`.
2. **Expected:** Feature Requests, People, and Learnings all have starter guidance that matches the role-specific knowledge model.

## Edge Cases

### Generic-template regression

1. Search the setup and template files for broad generic task-manager phrasing.
2. **Expected:** The dominant framing remains Director-of-Products-specific.

## Failure Signals

- `setup.sh` still asks generic career-vision questions.
- The generated GOALS structure does not mention Documentation, Stability, New Business, or Today’s Three.
- `core/templates/AGENTS.md` still reads like the old generic PM task system.
- The knowledge template tree lacks starter guidance for the documented folders.

## Requirements Proved By This UAT

- R001 — proves that new workspaces now inherit the intervention-first planning contract at setup/template level.

## Not Proven By This UAT

- No live runtime or browser flow is proven.
- The setup script is not executed end to end in this slice.
- The knowledge subfolders are not proven to auto-create yet.

## Notes for Tester

This slice intentionally stops at truthful setup/template alignment. Future work must decide whether to add a minimal generated-workspace proof or return to the earlier web-app orchestration roadmap.
