# S03: Minimal markdown runtime proof

**Goal:** Close the markdown/setup loop by making the Director-of-Products knowledge structure appear in a fresh workspace automatically and by documenting a truthful first-run verification path.
**Demo:** A fresh setup run would create the key `Knowledge/` subfolders with starter README files, and the repo contains an explicit artifact-driven proof path showing what to inspect after setup.

## Must-Haves

- Teach `setup.sh` to create the role-specific `Knowledge/` subfolders and copy starter README scaffolds into them when missing.
- Preserve existing files so rerunning setup remains safe.
- Add a truthful walkthrough/proof artifact for what a successful generated workspace should look like after setup.

## Proof Level

- This slice proves: contract
- Real runtime required: no
- Human/UAT required: no

## Verification

- `rg -n "Knowledge/Feature-Requests|Knowledge/People|Knowledge/Learnings|copy.*README|Created: Knowledge/" setup.sh`
- `git diff -- setup.sh docs/runbooks/setup-verification.md | sed -n '1,260p'`

## Observability / Diagnostics

- Runtime signals: setup terminal output for created/preserved folders/files
- Inspection surfaces: `setup.sh`, generated folder tree, and the setup verification runbook
- Failure visibility: missing subfolder creation logic or missing scaffold-copy conditions visible in script diff and grep
- Redaction constraints: none

## Integration Closure

- Upstream surfaces consumed: `core/templates/Knowledge/*`, `setup.sh`, S01/S02 role docs
- New wiring introduced in this slice: setup now materializes the documented knowledge structure into a fresh workspace
- What remains before the milestone is truly usable end-to-end: nothing for the markdown setup path; web-app alignment remains a separate future direction

## Tasks

- [x] **T01: Auto-create role-specific Knowledge scaffolds in setup** `est:40m`
  - Why: The markdown OS still requires manual creation of the most important subfolders, leaving setup one step short of the documented workflow.
  - Files: `setup.sh`
  - Do: Update the setup script to create `Knowledge/Feature-Requests`, `Knowledge/People`, and `Knowledge/Learnings`; copy the template README files into those folders only when missing; keep reruns idempotent and preserve user files.
  - Verify: `rg -n "Feature-Requests|People|Learnings|preserving your version|Copied:" setup.sh`
  - Done when: A fresh run would create the key role-specific knowledge folders and their starter README files without clobbering existing work.
- [x] **T02: Add first-run verification guidance for the generated workspace** `est:20m`
  - Why: The repo needs a truthful proof artifact that tells a future agent or user what to inspect after setup.
  - Files: `docs/runbooks/setup-verification.md`, `README.md`
  - Do: Add a short runbook describing the expected post-setup directory/file state and update README references if needed so the verification path is discoverable.
  - Verify: `rg -n "setup verification|Feature-Requests|People|Learnings|GOALS.md|AGENTS.md" docs/runbooks/setup-verification.md README.md`
  - Done when: The repo contains a clear, truthful verification path for the generated markdown workspace.

## Files Likely Touched

- `setup.sh`
- `docs/runbooks/setup-verification.md`
- `README.md`
