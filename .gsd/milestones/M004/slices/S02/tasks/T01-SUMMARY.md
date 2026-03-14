---
id: T01
parent: S02
milestone: M004
provides:
  - Role-aware setup flow and GOALS scaffolding for the Director-of-Products model
key_files:
  - setup.sh
key_decisions:
  - The setup flow should ask about charter scope, operating goals, leadership rhythm, and current interventions instead of generic career-vision prompts
patterns_established:
  - Generated GOALS.md should reinforce Documentation, Stability, New Business, Team Leadership, and Today’s Three
observability_surfaces:
  - setup.sh text
  - grep/diff on setup language
duration: 45m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T01: Update setup flow and generated goals for the director model

**Reworked the setup script so a fresh workspace onboards the Director-of-Products operating model.**

## What Happened

`setup.sh` was rewritten to stop asking generic professional-vision questions and instead collect the inputs that matter for Joydeep’s role: current scope/charter, what success looks like across Documentation, Stability, and New Business, quarterly priorities, leadership rhythm, and current top interventions.

The generated `GOALS.md` template now reflects the operating model from S01. It explicitly defines Documentation, Stability, New Business, and Team Leadership, adds a Today’s Three rule, and uses a priority framework oriented around intervention needs, leadership artifacts, and blocker removal rather than generic personal productivity.

The setup copy and next-step guidance were also updated so the user is pointed toward backlog processing, intervention planning, and durable knowledge notes for feature requests, meetings, people, and learnings.

## Verification

- Ran `rg -n "Director of Products|Documentation|Stability|New Business|Today's Three|leadership|feature request|1:1" setup.sh`
- Reviewed `git diff -- setup.sh`
- Confirmed the setup flow and generated GOALS sections now align with the Director-of-Products contract from S01.

## Diagnostics

Future agents should inspect `setup.sh` directly. The strongest signals are the top-of-file agent instructions, the five interactive questions, and the `cat > "GOALS.md"` block.

## Deviations

None.

## Known Issues

The reusable template files in `core/templates/` are still generic; they remain for T02 and T03.

## Files Created/Modified

- `setup.sh` — role-aware onboarding flow and GOALS.md generator for the Director-of-Products model
