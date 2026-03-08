# Claude Kickoff Prompt

Paste the prompt below into Claude Code when starting work on this repo.

```md
You are joining an existing repo that is being evolved into a Product Control Tower for Joydeep Sarkar, Director of Products at M2P Fintech.

Your job is not to rediscover the product from scratch. Your first job is to read the repo memory, validate the current implementation against the plan, enhance the implementation plan where needed, and then start the highest-leverage first build slice.

Read these files in this exact order before making code changes:

1. `CLAUDE.md`
2. `requirements.md`
3. `build-plan.md`
4. `docs/architecture.md`
5. `docs/runbooks/claude-handoff.md`
6. `web/CLAUDE.md`
7. `web/lib/assistant/CLAUDE.md`

Product truths you must preserve:

1. This is not a generic task planner.
2. The primary unit is `feature request`.
3. The dominant views are `PM owner` and `risk severity`.
4. Jira is the execution system of record.
5. Confluence is the requirements-doc system of record.
6. Any writeback or communication action must remain approval-gated.
7. Local-first behavior should be preserved unless a specific integration requires expansion.

Your workflow must be:

## Phase 1: Repo And Plan Audit

1. Inspect the existing implementation in `web/`.
2. Compare what already exists with `requirements.md` and `build-plan.md`.
3. Identify:
   - already implemented capabilities
   - missing capabilities
   - weak assumptions in the current plan
   - the smallest high-leverage build slice to start with

Before implementation, enhance the plan:

1. Do not overwrite `requirements.md`.
2. If the current plan needs more precision, create `build-plan-v2.md`.
3. `build-plan-v2.md` should include:
   - what already exists
   - what is missing
   - the recommended implementation order
   - APIs, types, data flow, and acceptance criteria for the next build slice
   - any repo-specific constraints you discovered

## Phase 2: Implement The First Build Slice

After the audit and plan enhancement, implement this first unless your repo audit proves a smaller prerequisite is missing:

### First build slice

Read-only external source ingestion plus normalized feature-request modeling.

Specifically:

1. Add `web/lib/integrations/jira/`
2. Add `web/lib/integrations/confluence/`
3. Add `web/lib/control-tower/feature-request-engine.ts`
4. Add a cache-backed normalized feature request model that merges:
   - Jira execution metadata
   - Confluence requirement metadata
   - local Personal OS notes / overlays
5. Keep this slice read-only
6. Do not implement Teams ingestion in this slice beyond manual or pasted-summary support

### Deliverables for the first build slice

1. Environment/config surface for Jira and Confluence access
2. Typed adapters for fetching and normalizing source data
3. Feature request domain type and merge logic
4. A cache artifact under repo `.cache/`
5. At least one API endpoint exposing normalized feature requests
6. Tests covering normalization, merge logic, and fallback behavior

### Design constraints

1. Do not model the control tower directly on raw Jira issues.
2. Model it on a normalized `feature request` object.
3. Keep writeback approval-gated and out of scope for this slice.
4. Preserve existing assistant/review behavior unless a change is required.
5. Avoid spreading product logic into UI files.

## Phase 3: Verification And Handoff

Before stopping:

1. Run from `web/`:
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`
2. Summarize:
   - what was implemented
   - what remains
   - what the next slice should be

If the repo audit shows the first build slice above is not yet the right next step, do not improvise silently. Explain why, update the enhanced plan, and then implement the true prerequisite.
```
