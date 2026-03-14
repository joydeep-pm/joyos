---
estimated_steps: 6
estimated_files: 4
---

# T01: Rewrite core assistant and planning guidance for the director role

**Slice:** S01 — Director-of-products role scaffolding and workflow uplift
**Milestone:** M004

## Description

Rework the core markdown guidance so the Personal OS behaves like a Director of Products operating system for Joydeep, with explicit OKR alignment, intervention-first daily planning, and durable knowledge conventions for feature requests, people, and learnings.

## Steps

1. Read the current `AGENTS.md`, `README.md`, and `Knowledge/README.md` alongside `requirements.md` and the implementation plan to extract the generic language that needs replacement.
2. Rewrite `AGENTS.md` to encode Director-of-Products behavior, Today’s Three, escalation/blocker-aware prioritization, and role-specific workflow triggers.
3. Update `README.md` so the repo’s positioning, quick-start, and workflow guidance reflect the Director-of-Products operating model rather than generic productivity.
4. Update `Knowledge/README.md` with role-specific folder conventions for people, feature requests, meetings, leadership updates, and learnings.
5. Create `docs/role-profiles/director-of-products.md` capturing responsibilities, recurring inputs/outputs, decision lenses, and the operating rhythm drawn from `requirements.md`.
6. Verify the updated docs contain the intended role-specific terms and no longer read as generic guidance.

## Must-Haves

- [ ] `AGENTS.md` explicitly encodes Joydeep’s Director-of-Products operating model and Today’s Three constraint.
- [ ] Core docs establish the knowledge conventions and role profile needed for later workflow/setup work.

## Verification

- `rg -n "Director of Products|Today's Three|Documentation|Stability|New Business|Feature-Requests|People|Learnings" AGENTS.md README.md Knowledge/README.md docs/role-profiles/director-of-products.md`
- `git diff -- AGENTS.md README.md Knowledge/README.md docs/role-profiles/director-of-products.md | sed -n '1,220p'`

## Observability Impact

- Signals added/changed: None
- How a future agent inspects this: read the updated docs directly and grep for role-specific operating-model terms
- Failure state exposed: stale generic phrasing or missing role artifacts remains visible in diff/grep output

## Inputs

- `requirements.md` — source of truth for Joydeep’s role, OKRs, recurring workflows, and product context
- `build-plan.md` — confirms alignment with the product-control-tower direction rather than generic productivity

## Expected Output

- `AGENTS.md` — rewritten role-specific assistant contract
- `README.md` — updated repo positioning and workflow framing
- `Knowledge/README.md` — role-specific knowledge conventions
- `docs/role-profiles/director-of-products.md` — durable role profile artifact
