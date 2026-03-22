# Project

## What This Is

This project is a local-first Product Control Tower for Joydeep Sarkar, a Director of Products working across multiple fintech client and product charters. It synthesizes Jira, Confluence, and local context into a feature-request-centric operating system that helps Joydeep decide where to intervene, review execution quality, draft structured artifacts, and manage product leadership workflows.

## Core Value

The one thing that must work is a trustworthy director operating layer that shows where intervention is needed, why it is needed, and what action or artifact should be prepared next without requiring manual chasing across PMs, engineering, and clients.

## Current State

A first usable version already exists. The repo contains a Next.js web app with Jira and Confluence sync, a normalized feature-request model, intervention views grouped by PM owner and risk severity, and an artifact drafting workspace for PRDs, user stories, follow-ups, clarifications, status updates, leadership updates, and client summaries. Approval-gated communication flows exist for outbound draft handling. M001 is complete: the control tower can derive grooming readiness verdicts, rubric dimensions, missing inputs, blocker classes, prioritization posture, and recommended next steps for feature requests; persist private director review decisions as a local overlay; assemble that review state server-side into intervention/detail and artifact flows; and execute a live pre-grooming loop where a director saves a review, sees refreshed assembled state, generates a review-aware follow-up, and submits it into an approval-gated comms draft without sending. M002 is now also complete: the `/people` workspace is live on assembled PM portfolio intelligence instead of mock profiles, private PM coaching and 1:1 state persist in a local overlay, and server-backed 1:1 prep plus IDP drafts can be generated from persisted notes and live portfolio evidence through the existing draft-safe artifact flow. M003 is now complete: approval envelopes are persisted with auditable lifecycle state, one real comms action family can execute through approved envelopes without bypassing human review, and the `/assistant` browser workflow can approve a draft, create an envelope, approve the envelope, execute it, and inspect executed or failed diagnostics from route-backed state. M004 is now also complete, but as a markdown/setup milestone rather than the originally planned orchestration milestone: the Personal OS has been reframed as a Director-of-Products operating system for Joydeep, the markdown workflows and examples now encode Director Intervention Briefs and Today’s Three, setup/templates generate the role-specific structure by default, and fresh workspaces now auto-create the key Knowledge areas for feature requests, people, and learnings with a dedicated setup verification runbook. M008 is now complete: the app lands on Today, primary navigation foregrounds Today and Assistant, and the legacy intervention surface remains reachable as Control Tower rather than competing as the default daily route. M009 is now complete: roadmap communication is separated cleanly from monthly product updates, the artifact workflow can draft both stakeholder-facing roadmap updates and business/RFP-facing roadmap deck outlines, and the Assistant surface now shows quarterly Product Deck / Product Factsheet refresh reminders with durable resolution state instead of relying on memory.

## Architecture / Key Patterns

The system is local-first and markdown-friendly, with derived cache state stored under `.cache/` and the application code in `web/`. Jira remains the execution system of record, Confluence remains the documentation system of record, and Personal OS acts as the private synthesis layer. The primary domain object is the feature request, not a generic task. External integrations are read-first and approval-gated for any write-capable path.

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [x] M001: Decision and review operating system — Make intervention outputs operational by supporting grooming readiness, prioritization, and review-grade decision workflows.
- [x] M002: People management intelligence — Add 1:1 prep, coaching evidence, feedback synthesis, and IDP drafting for PM management.
- [x] M003: Approval-governed automation — Add approval envelopes, auditable action pipelines, and safe writeback into official systems.
- [x] M004: Director-of-Products markdown operating system alignment — Align docs, workflows, setup, templates, and generated workspace scaffolding around Joydeep’s role-specific operating model.
- [x] M005: Director-of-Products web-app alignment — Align the Product Control Tower UI with the new markdown operating model, starting with the daily intervention brief.
- [x] M006: Meeting intelligence and follow-up orchestration — Turn meeting notes and transcripts into durable follow-ups, blockers, and operating-context updates.
- [x] M008: Navigation and route coherence for the director operating model — Foreground Today and Assistant, de-emphasize legacy Intervention, and align route discovery with the new operating workflow.
- [x] M009: Roadmap communications and collateral operations — Separate Product Update vs Roadmap Update, support roadmap decks for business/RFP use, and surface quarterly collateral refresh reminders.
- [x] M010: Strategy knowledge system inside Personal OS — Convert FY27 strategy materials from browser-local artifacts into durable markdown knowledge and an operating brief inside Personal OS.
- [x] M011: Strategy-to-task extraction for FY27 operating follow-through — Turn the FY27 strategy corpus into a concise set of Personal OS tasks for real follow-through.
- [x] M012: Weekly strategy review workflow for Personal OS — Add a reusable weekly ritual that refreshes FY27 strategy, follow-through tasks, and next-week interventions.
- [x] M013: Stakeholder output pack for shareable strategy and roadmap updates — Add reusable templates and a current shareable FY27 status note for business-facing communication.
- [x] M014: Monthly strategy review workflow and status-output index — Add a monthly strategy cadence and a single entrypoint for current shareable outputs.

## What Changed in M001

M001 is now closed with milestone-level verification. The product no longer stops at visibility and drafting: it now supports a real pre-grooming operating loop. Directors can inspect readiness verdicts and missing inputs, capture durable review decisions on feature requests, refresh intervention state from assembled server-side workflow data, generate review-aware follow-up artifacts, and hand those artifacts into the approval-gated comms draft flow without sending.

This milestone also established the main implementation seams future milestones should reuse: derived evaluators for operational judgments, overlay persistence for private orchestration data, assembled feature-request reads for runtime workflow state, stable route failure codes plus diagnostics, and approval-envelope behavior for outward actions.

## What Changed in M003

M003 is now closed with milestone-level verification. The product no longer stops at draft-safe approval staging for outbound actions: it now has a reusable approval-envelope model with persisted lifecycle state, actor/timestamp audit records, stable transition diagnostics, and one proven execution path for comms sending. The `/assistant` experience now serves as the live browser entrypoint for approval-governed automation, letting a user inspect an envelope, approve it, execute it, and inspect the executed or failed result from durable route-backed state.

This milestone also reinforced a critical operational rule for future automation work: the browser-visible workflow must preserve the real approval gate instead of inferring executability from local UI state. In practice, envelope creation for comms now requires an already-approved draft, execution remains impossible without envelope approval, and failed execution remains inspectable through persisted `failureCode`, `failureMessage`, and audit events.
