# ADR 0001: Reframe The Product As A Product Control Tower

## Status

Accepted

## Context

The original Personal OS UI started from a local-first task and backlog workflow. Discovery with the user showed that this framing is too shallow for the real job-to-be-done.

The user is a Director of Products at M2P Fintech managing multiple PMs, multiple client-driven product charters, biweekly engineering prioritization, PRD and user-story quality, monthly leadership updates, and recurring blocker/intervention work.

## Decision

The product will be treated as a Product Control Tower, not a generic task planner.

The primary unit is:

1. Feature request

Primary operational lenses are:

1. PM owner
2. Risk severity

The system should act as:

1. a synthesis layer over Jira and Confluence
2. a drafting layer for structured artifacts
3. a director intervention dashboard

## Consequences

1. Task-centric UI and models are insufficient on their own.
2. Jira and Confluence ingestion become high-priority.
3. The morning intervention brief becomes the main user-facing workflow.
4. PM blocker visibility is a first-class product requirement.
5. Writeback must remain approval-gated.
