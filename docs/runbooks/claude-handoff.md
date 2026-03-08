# Claude Handoff

## Start Here

Read in this order:

1. `requirements.md`
2. `build-plan.md`
3. `CLAUDE.md`
4. `docs/architecture.md`
5. `web/CLAUDE.md`
6. `web/lib/assistant/CLAUDE.md` if you will touch assistant logic
7. `docs/runbooks/claude-kickoff-prompt.md` if you want the exact kickoff prompt for Claude Code

## What Already Exists

The repo already has:

1. A working Next.js app in `web/`
2. Local-first assistant features
3. Review, alert, trend, KPI, queue, and comms logic
4. Tests and build setup

## What Is Missing Relative To The Real Product

1. Jira ingestion
2. Confluence ingestion
3. A normalized feature-request model
4. PM-owner and risk-severity-first director views
5. True product-control-tower orchestration across systems of record

## Non-Negotiable Product Truths

1. The user is a Director of Products, not an individual task-manager user.
2. Feature request is the top-level unit.
3. PM owner and risk severity are the dominant views.
4. Jira is execution truth.
5. Confluence is requirements-doc truth.
6. Writes must be approval-gated.

## Good Next Tasks For Parallel Implementation

1. Add Jira read integration
2. Add Confluence read integration
3. Normalize feature-request cache objects
4. Build the intervention brief on top of that model
5. Add PM blocker heatmap / dashboard
6. Add template-aware artifact drafting from linked context
