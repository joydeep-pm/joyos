# S02: Role-aware setup and template alignment

**Goal:** Align the setup script and reusable templates with Joydeep’s Director-of-Products operating model so new workspaces scaffold the same role-specific structure, guidance, and defaults introduced in S01.
**Demo:** Running through the setup and template artifacts on paper shows that a fresh workspace would generate Director-of-Products-specific guidance, operating-goal framing, and starter folder/file conventions instead of the prior generic task-manager defaults.

## Must-Haves

- Update `setup.sh` so its interactive prompts, generated `GOALS.md`, and suggested next steps reflect the Director-of-Products operating model.
- Replace the generic template defaults in `core/templates/` with role-aware guidance and starter configuration aligned to S01.
- Add starter README/scaffold files for the new `Knowledge/` sub-areas so the documented structure is actually scaffoldable.

## Proof Level

- This slice proves: contract
- Real runtime required: no
- Human/UAT required: no

## Verification

- `rg -n "Director of Products|Documentation|Stability|New Business|Today's Three|Feature-Requests|People|Learnings|leadership" setup.sh core/templates examples`
- `git diff -- setup.sh core/templates/AGENTS.md core/templates/config.yaml core/templates/Knowledge/Feature-Requests/README.md core/templates/Knowledge/People/README.md core/templates/Knowledge/Learnings/README.md | sed -n '1,260p'`

## Observability / Diagnostics

- Runtime signals: none
- Inspection surfaces: setup script text, generated template files, git diff, and targeted grep
- Failure visibility: stale generic prompts, mismatched folder scaffolds, or missing role-specific terms remain visible directly in the template artifacts
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: `AGENTS.md`, `README.md`, `Knowledge/README.md`, `docs/role-profiles/director-of-products.md`
- New wiring introduced in this slice: setup/template defaults now encode the same operating contract as the live docs
- What remains before the milestone is truly usable end-to-end: either a minimal walkthrough proof of generated artifacts or a return to web-app orchestration work in S03

## Tasks

- [x] **T01: Update setup flow and generated goals for the director model** `est:45m`
  - Why: The current interactive setup still asks generic questions and generates a generic goals file.
  - Files: `setup.sh`
  - Do: Rewrite the setup intro, questions, and generated `GOALS.md` template around Joydeep’s role, operating goals, and intervention priorities while keeping the script usable for a markdown-first workspace.
  - Verify: `rg -n "Director of Products|Documentation|Stability|New Business|Today's Three|leadership|feature request|1:1" setup.sh`
  - Done when: The setup script reads like it is onboarding a Director-of-Products workspace instead of a generic task manager.
- [x] **T02: Align reusable templates with the role-specific contract** `est:35m`
  - Why: New workspaces copied from `core/templates/` should inherit the same operating model as the updated live docs.
  - Files: `core/templates/AGENTS.md`, `core/templates/config.yaml`
  - Do: Rewrite the template AGENTS guidance and tune the starter config categories/priority framing to match Documentation, Stability, New Business, Team Leadership, and continuity workflows.
  - Verify: `rg -n "Director of Products|Documentation|Stability|New Business|people|leadership|Feature-Requests|Learnings" core/templates/AGENTS.md core/templates/config.yaml`
  - Done when: The reusable templates no longer push a generic task-management framing.
- [x] **T03: Add scaffoldable knowledge subfolder guidance** `est:25m`
  - Why: S01 documented new `Knowledge/` sub-areas, but setup/templates still do not provide starter artifacts for them.
  - Files: `core/templates/Knowledge/Feature-Requests/README.md`, `core/templates/Knowledge/People/README.md`, `core/templates/Knowledge/Learnings/README.md`
  - Do: Add lightweight starter README files for the most important role-specific knowledge areas so a future setup can scaffold them directly.
  - Verify: `rg -n "Feature Requests|People|Learnings|Director|blocker|coaching|follow-up" core/templates/Knowledge`
  - Done when: The template tree contains starter guidance for the documented knowledge structure.

## Files Likely Touched

- `setup.sh`
- `core/templates/AGENTS.md`
- `core/templates/config.yaml`
- `core/templates/Knowledge/Feature-Requests/README.md`
- `core/templates/Knowledge/People/README.md`
- `core/templates/Knowledge/Learnings/README.md`
