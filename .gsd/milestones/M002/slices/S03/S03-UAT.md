# S03: 1:1 and IDP drafting loop integration — UAT

**Milestone:** M002
**Written:** 2026-03-12

## UAT Type

- UAT mode: mixed
- Why this mode is sufficient: S03 required both contract proof and live browser proof because milestone completion depends on the assembled `/people` workflow, not only route or component fixtures.

## Preconditions

- `web/` dependencies are installed
- the local app is running and reachable at `/people`
- at least one PM-owned feature request exists so the people workspace has a real PM panel

## Smoke Test

Open `/people`, save notes for one PM, click “Draft IDP,” and confirm the artifact viewer opens with server-authored content that includes persisted PM notes.

## Test Cases

### 1. Save PM notes and refresh the assembled workspace

1. Open `/people`.
2. Enter or update private notes, coaching focus, and updater name for one PM.
3. Click the save button.
4. **Expected:** inline success feedback appears and the workspace refreshes from `GET /api/control-tower/people`.

### 2. Generate a server-backed people draft

1. From the same PM panel, click `1:1 Prep` or `Draft IDP`.
2. Wait for the artifact viewer to open.
3. **Expected:** the artifact viewer shows a server-authored draft whose content includes persisted PM notes and live portfolio evidence.

## Edge Cases

### Unknown PM target

1. Trigger the people draft route with a PM name not present in the assembled people workspace.
2. **Expected:** the route returns `control_tower_people_draft_pm_not_found` and no draft artifact is created.

## Failure Signals

- clicking `Draft IDP` opens no artifact viewer and no draft route request is visible
- generated draft content does not reflect persisted PM notes
- `/people` falls back to local placeholder draft strings despite the server route existing
- route errors are generic instead of exposing stable draft failure codes

## Requirements Proved By This UAT

- R201 — proves the people workspace supports real 1:1 and IDP drafting from persisted PM notes plus live portfolio context
- R007 — proves the workflow stays draft-only and inspectable rather than silently creating a formal performance record

## Not Proven By This UAT

- audited formal sharing or writeback of people-management outputs into external systems
- normalized PM identity beyond raw `pmOwner` naming

## Notes for Tester

The most reliable runtime proof is the network sequence `POST /api/control-tower/people/notes` → `GET /api/control-tower/people` → `POST /api/control-tower/people/drafts`. If the visible UI feels wrong, check that sequence first.
