# Setup Verification Runbook

Use this runbook after `./setup.sh` or after an AI agent walks through setup manually.

## Goal

Verify that a fresh Director-of-Products Personal OS workspace has the expected files, folders, and guidance.

## Expected Top-Level Files

After setup, confirm these exist:
- `AGENTS.md`
- `BACKLOG.md`
- `GOALS.md`
- `Tasks/`
- `Knowledge/`

## Expected Knowledge Structure

Confirm these subfolders exist under `Knowledge/`:
- `Knowledge/Feature-Requests/`
- `Knowledge/People/`
- `Knowledge/Learnings/`

Each should contain a starter `README.md` unless the user already had their own file.

## Expected Guidance Content

### 1. `AGENTS.md`
Confirm it references:
- Director Intervention Brief
- Today’s Three
- Documentation
- Stability
- New Business
- Team Leadership

### 2. `GOALS.md`
Confirm it contains:
- role / product scope
- Documentation goal
- Stability goal
- New Business goal
- Team Leadership goal
- Today’s Three rule
- current top interventions / priorities

### 3. `Knowledge/` starter files
Confirm the three starter README files explain:
- what belongs in Feature Requests
- what belongs in People
- what belongs in Learnings

## Quick Manual Checklist

- [ ] Top-level workspace files exist
- [ ] `Knowledge/Feature-Requests/README.md` exists
- [ ] `Knowledge/People/README.md` exists
- [ ] `Knowledge/Learnings/README.md` exists
- [ ] `AGENTS.md` reflects the Director-of-Products model
- [ ] `GOALS.md` reflects the operating-goal structure

## Failure Signals

Something is off if:
- setup produced only `Tasks/` and `Knowledge/` with no role-specific subfolders
- `AGENTS.md` still reads like a generic productivity assistant
- `GOALS.md` does not mention Documentation, Stability, New Business, or Today’s Three
- the starter README files are missing from the Knowledge subfolders

## Notes

This runbook verifies the markdown/setup scaffold only. It does not prove any web-app behavior.
