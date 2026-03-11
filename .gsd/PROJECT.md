# Project

## What This Is

This project is a local-first Product Control Tower for Joydeep Sarkar, a Director of Products working across multiple fintech client and product charters. It synthesizes Jira, Confluence, and local context into a feature-request-centric operating system that helps Joydeep decide where to intervene, review execution quality, draft structured artifacts, and manage product leadership workflows.

## Core Value

The one thing that must work is a trustworthy director operating layer that shows where intervention is needed, why it is needed, and what action or artifact should be prepared next without requiring manual chasing across PMs, engineering, and clients.

## Current State

A first usable version already exists. The repo contains a Next.js web app with Jira and Confluence sync, a normalized feature-request model, intervention views grouped by PM owner and risk severity, and an artifact drafting workspace for PRDs, user stories, follow-ups, clarifications, status updates, leadership updates, and client summaries. Approval-gated communication flows exist for outbound draft handling. M001/S01 and M001/S02 are now complete: the control tower can derive grooming readiness verdicts, rubric dimensions, missing inputs, blocker classes, prioritization posture, and recommended next steps for feature requests, then persist private director review decisions as a local overlay and assemble them server-side with readiness/intervention state for intervention APIs, detail rendering, and artifact drafting. The next step is S03: connect live review capture and follow-up preparation into an end-to-end pre-grooming operating loop.

## Architecture / Key Patterns

The system is local-first and markdown-friendly, with derived cache state stored under `.cache/` and the application code in `web/`. Jira remains the execution system of record, Confluence remains the documentation system of record, and Personal OS acts as the private synthesis layer. The primary domain object is the feature request, not a generic task. External integrations are read-first and approval-gated for any write-capable path.

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [ ] M001: Decision and review operating system — Make intervention outputs operational by supporting grooming readiness, prioritization, and review-grade decision workflows.
- [ ] M002: People management intelligence — Add 1:1 prep, coaching evidence, feedback synthesis, and IDP drafting for PM management.
- [ ] M003: Approval-governed automation — Add approval envelopes, auditable action pipelines, and safe writeback into official systems.
- [ ] M004: Expanded orchestration and intelligence — Extend ingestion, continuity, and cross-channel automation for a more autonomous control tower.
