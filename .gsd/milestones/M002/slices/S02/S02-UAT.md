# S02: Durable people workflow state and review surfaces — UAT

**Milestone:** M002
**Written:** 2026-03-12

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S02 proves durable private PM state, mutation routing, and assembled refresh through route/component tests and typecheck; full live draft-generation proof is intentionally deferred to S03.

## Preconditions

- `web/` dependencies are installed
- the local app can run if a human wants to inspect `/people`
- feature-request cache includes at least one PM-owned feature request for a meaningful PM panel

## Smoke Test

Open `/people`, enter private notes for a PM, save them, and confirm the page refreshes with persisted 1:1 status instead of only showing missing-history diagnostics.

## Test Cases

### 1. Save private PM notes

1. Start the web app locally.
2. Open `/people`.
3. Enter a last 1:1 date, coaching focus, private notes, and updater name for one PM.
4. Click the save button.
5. **Expected:** inline success feedback appears and the refreshed PM panel reflects persisted note state.

### 2. Refresh from assembled state

1. Save PM notes successfully.
2. Observe the updated PM panel after refresh.
3. **Expected:** one-on-one status and persisted-note fields are reloaded from the assembled people read path rather than only reflecting optimistic local edits.

## Edge Cases

### Unknown PM target

1. Attempt to post a people note mutation for a PM name that is not present in the assembled workspace.
2. **Expected:** the mutation returns the stable `control_tower_people_pm_not_found` code and no record is written.

## Failure Signals

- notes appear saved in the UI but disappear after refresh
- `/api/control-tower/people/notes` returns a generic error instead of a stable code
- `/people` never transitions from missing-history even after a successful save
- persisted note fields are overwritten incorrectly on partial updates

## Requirements Proved By This UAT

- R201 — proves the people workspace now carries durable PM coaching/1:1 state instead of only derived portfolio summaries
- R007 — proves saved PM notes remain private local workflow state rather than formalized or auto-shared output

## Not Proven By This UAT

- server-backed generation of 1:1 prep or IDP content from persisted people state
- approval-gated sharing or outbound handoff for people-management drafts

## Notes for Tester

PM identity is still based on `pmOwner` names from feature-request data. If names vary across records, you may see fragmented PM panels until later normalization work lands.
