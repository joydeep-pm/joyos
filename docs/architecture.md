# Architecture Overview

## What This Repo Is

This repo is a local-first web application and knowledge workspace that is being evolved into a Product Control Tower for Joydeep Sarkar. The app should help a Director of Products orchestrate feature requests, PM work, engineering dependencies, and stakeholder communication.

## Where Truth Lives

1. `requirements.md`
Business truth, user context, and the intended product shape.

2. `build-plan.md`
Execution truth for what should be built next.

3. `web/`
Application code.

4. `Tasks/`, `Knowledge/`, `GOALS.md`, `BACKLOG.md`
Canonical user-owned markdown content.

5. `Jira`
Execution system of record outside this repo.

6. `Confluence`
Requirements-doc system of record outside this repo.

## App Structure

### `web/app/`

1. App Router pages
2. Current surfaces include:
   - `/assistant`
   - `/review`
   - `/today`
   - `/triage`
   - `/tasks`
   - `/settings`

### `web/app/api/`

1. Route handlers for assistant, tasks, backlog, modules, and system status
2. Assistant APIs already cover:
   - context
   - brief
   - queue
   - comms
   - review
   - alerts
   - trends
   - KPI

### `web/lib/assistant/`

Current intelligence engines live here:

1. `context-engine.ts`
2. `brief-engine.ts`
3. `queue-engine.ts`
4. `comms-engine.ts`
5. `review-engine.ts`
6. `alert-engine.ts`
7. `trend-engine.ts`
8. `kpi-engine.ts`
9. `week-utils.ts`
10. `flags.ts`
11. `storage.ts`
12. `policy-engine.ts`

### `.cache/`

Derived state and indexes live here. This is fast-read support state, not the primary business source of truth.

## Design Constraints

1. Keep markdown canonical for local Personal OS data.
2. Add external integrations as read-first, cached ingest.
3. Use approval-gated writeback for anything that changes official systems or communication.
4. Keep feature request as the primary orchestration unit.

## Near-Term Architecture Direction

Add:

1. Jira integration layer
2. Confluence integration layer
3. Normalized feature-request engine
4. PM-owner and risk-severity-centric intervention views

Keep:

1. Existing local assistant engines
2. Existing UI shell and local-first runtime
