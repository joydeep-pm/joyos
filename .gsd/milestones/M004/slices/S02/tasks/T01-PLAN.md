---
estimated_steps: 5
estimated_files: 1
---

# T01: Update setup flow and generated goals for the director model

**Slice:** S02 — Role-aware setup and template alignment
**Milestone:** M004

## Description

Rewrite the interactive setup flow so a fresh workspace is clearly initialized for Joydeep’s Director-of-Products operating model, including role-aware framing, operating-goal questions, and a goals file that reinforces intervention priorities.

## Steps

1. Read `setup.sh` and identify the generic prompts, examples, and GOALS.md generation sections that no longer match the role-specific contract from S01.
2. Rewrite the setup intro and AI-agent instructions at the top of the script so they describe the Director-of-Products workspace shape and expected setup outputs.
3. Replace the user questions/examples with prompts tailored to product leadership: charter scope, operating goals, quarterly priorities, leadership artifacts, and current intervention pressure.
4. Rewrite the generated `GOALS.md` template sections and priority framework so they emphasize Documentation, Stability, New Business, Team Leadership, and Today’s Three.
5. Verify the script text now reflects the role-specific operating model end to end.

## Must-Haves

- [ ] The setup script clearly onboards a Director-of-Products workspace instead of a generic task manager.
- [ ] The generated `GOALS.md` structure reinforces the operating model introduced in S01.

## Verification

- `rg -n "Director of Products|Documentation|Stability|New Business|Today's Three|leadership|feature request|1:1" setup.sh`
- `git diff -- setup.sh | sed -n '1,240p'`

## Observability Impact

- Signals added/changed: None
- How a future agent inspects this: read `setup.sh` directly and grep for role-specific setup language
- Failure state exposed: generic prompts/examples or stale GOALS.md sections remain visible in the script diff

## Inputs

- `AGENTS.md` — the role-specific operating contract to mirror during setup
- `docs/role-profiles/director-of-products.md` — authoritative role context and priorities for the setup questions

## Expected Output

- `setup.sh` — role-aware setup flow and GOALS.md generator aligned to the Director-of-Products model
