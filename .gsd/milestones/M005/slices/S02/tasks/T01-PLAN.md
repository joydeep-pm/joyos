---
estimated_steps: 4
estimated_files: 1
---

# T01: Rework assistant page headings and daily-brief framing

**Slice:** S02 — Assistant continuity alignment
**Milestone:** M005

## Description

Update `/assistant` so its primary brief and related section language clearly continue the intervention-first Director-of-Products model introduced on `/today`, without removing existing assistant functionality.

## Steps

1. Inspect the current assistant page structure and identify the primary daily-brief sections and user-visible headings.
2. Rewrite the headings and supporting copy to use intervention-first language consistent with `/today`.
3. Preserve all existing data wiring, actions, and capability sections.
4. Verify the page still typechecks and is ready for focused semantic test coverage.

## Must-Haves

- [ ] The assistant page’s primary daily framing matches the Director-of-Products model.
- [ ] Existing assistant capabilities remain intact.

## Verification

- `cd web && npm run typecheck`
- Visual diff/review of `web/app/assistant/page.tsx`

## Observability Impact

- Signals added/changed: visible assistant headings and copy only
- How a future agent inspects this: read `web/app/assistant/page.tsx` and compare live `/assistant` rendering
- Failure state exposed: stale generic headings or broken render/typecheck failures

## Inputs

- `web/app/assistant/page.tsx` — current assistant surface
- `web/app/today/page.tsx` — aligned daily-surface language to stay consistent with

## Expected Output

- `web/app/assistant/page.tsx` — intervention-first assistant framing aligned to the Director-of-Products operating model
