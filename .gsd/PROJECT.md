# Project

## What This Is

This project is a local-first Product Control Tower for Joydeep Sarkar, a Director of Products working across multiple fintech client and product charters. It synthesizes Jira, Confluence, and local context into a feature-request-centric operating system that helps Joydeep decide where to intervene, review execution quality, draft structured artifacts, and manage product leadership workflows.

## Core Value

The one thing that must work is a trustworthy director operating layer that shows where intervention is needed, why it is needed, and what action or artifact should be prepared next without requiring manual chasing across PMs, engineering, and clients.

## Current State

A first usable version already exists. The repo contains a Next.js web app with Jira and Confluence sync, a normalized feature-request model, intervention views grouped by PM owner and risk severity, and an artifact drafting workspace for PRDs, user stories, follow-ups, clarifications, status updates, leadership updates, and client summaries. Approval-gated communication flows exist for outbound draft handling. M001 is complete: the control tower can derive grooming readiness verdicts, rubric dimensions, missing inputs, blocker classes, prioritization posture, and recommended next steps for feature requests; persist private director review decisions as a local overlay; assemble that review state server-side into intervention/detail and artifact flows; and execute a live pre-grooming loop where a director saves a review, sees refreshed assembled state, generates a review-aware follow-up, and submits it into an approval-gated comms draft without sending. M002 is now also complete: the `/people` workspace is live on assembled PM portfolio intelligence instead of mock profiles, private PM coaching and 1:1 state persist in a local overlay, and server-backed 1:1 prep plus IDP drafts can be generated from persisted notes and live portfolio evidence through the existing draft-safe artifact flow.

## Architecture / Key Patterns

The system is local-first and markdown-friendly, with derived cache state stored under `.cache/` and the application code in `web/`. Jira remains the execution system of record, Confluence remains the documentation system of record, and Personal OS acts as the private synthesis layer. The primary domain object is the feature request, not a generic task. External integrations are read-first and approval-gated for any write-capable path.

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [x] M001: Decision and review operating system — Make intervention outputs operational by supporting grooming readiness, prioritization, and review-grade decision workflows.
- [x] M002: People management intelligence — Add 1:1 prep, coaching evidence, feedback synthesis, and IDP drafting for PM management.
- [ ] M003: Approval-governed automation — Add approval envelopes, auditable action pipelines, and safe writeback into official systems.
- [ ] M004: Expanded orchestration and intelligence — Extend ingestion, continuity, and cross-channel automation for a more autonomous control tower.

## What Changed in M001

M001 is now closed with milestone-level verification. The product no longer stops at visibility and drafting: it now supports a real pre-grooming operating loop. Directors can inspect readiness verdicts and missing inputs, capture durable review decisions on feature requests, refresh intervention state from assembled server-side workflow data, generate review-aware follow-up artifacts, and hand those artifacts into the approval-gated comms draft flow without sending.

This milestone also established the main implementation seams future milestones should reuse: derived evaluators for operational judgments, overlay persistence for private orchestration data, assembled feature-request reads for runtime workflow state, stable route failure codes plus diagnostics, and approval-envelope behavior for outward actions.
