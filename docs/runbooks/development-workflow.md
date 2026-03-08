# Development Workflow

## Before You Change Code

1. Read `requirements.md` for business context.
2. Read `build-plan.md` for current implementation priorities.
3. Read root `CLAUDE.md` for repo rules.
4. If working in `web/`, read `web/CLAUDE.md`.
5. If working in assistant engines or assistant APIs, read `web/lib/assistant/CLAUDE.md`.

## Change Strategy

1. Prefer small, targeted changes with clear verification.
2. Keep user-owned markdown safe.
3. Preserve approval-gated behavior for writes.
4. If adding new orchestration logic, model it around feature requests, not generic tasks.

## Verification

From `web/` run:

1. `npm run typecheck`
2. `npm run test`
3. `npm run build`

Run all three before handing off substantial work.

## When Adding New Context

1. Add durable product or architecture decisions to `docs/decisions/`.
2. Add longer explanatory material to `docs/`.
3. Keep root `CLAUDE.md` short. If it starts growing, move detail into docs and local `CLAUDE.md` files.
