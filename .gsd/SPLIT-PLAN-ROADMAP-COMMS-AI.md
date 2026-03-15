# Split Plan: Roadmap Communications vs AI Proficiency

**Written:** 2026-03-15

## Why Split These

The newly added requirements actually represent two distinct product problems:

1. **Roadmap communications and collateral operations**
   - Product Update vs Roadmap Update distinction
   - vertical-specific roadmap status updates
   - overall roadmap deck for RFP/business use
   - quarterly Product Deck / Factsheet refresh reminders

2. **AI proficiency in people management**
   - AI proficiency as a growth dimension
   - inclusion in 1:1 prep
   - inclusion in coaching notes
   - inclusion in IDP drafting and evidence tracking

These should not be built as one milestone because:
- they touch different workflows
- they affect different app surfaces
- they require different data models and reminders
- they solve different user jobs

---

## Track A — Roadmap Communications and Collateral Ops

### Problem This Solves

Joydeep repeatedly has to repackage roadmap truth into different formats for different audiences:
- monthly product updates
- vertical-specific business stakeholder roadmap updates
- RFP/business-facing roadmap decks
- quarterly deck/factsheet refreshes

### Recommended Milestone

## M009: Roadmap communications and collateral operations

### Goal

Turn roadmap communication into a first-class drafting and reminder workflow, distinct from Product Updates.

### Proposed Slices

#### S01 — Clarify artifact taxonomy and templates
- separate Product Update vs Roadmap Update vs RFP Deck vs Product Deck/Factsheet
- define expected inputs, outputs, and cadence
- map real vertical/product-area structure from the monthly product update format

#### S02 — Roadmap draft workspace
- draft roadmap status update for one vertical/stakeholder
- draft overall roadmap deck outline for RFP/business use
- keep output template-aware and reviewable

#### S03 — Quarterly collateral reminders
- reminder surfaces for Product Deck / Factsheet refreshes per vertical
- likely assistant/today/review reminder integration

### Why This Should Come First

This directly addresses newly added pain points around repeated roadmap communication overhead and repackaging work.

---

## Track B — AI Proficiency in 1:1s and IDPs

### Problem This Solves

AI proficiency is becoming part of PM growth expectations. Joydeep wants to discuss and track it during:
- 1:1s
- coaching
- IDP drafting

The screenshot shows a useful maturity ladder:
- L0: disengaged / performative
- L1: competent user
- L2: non-technical builder
- L3: systems builder

### Recommended Milestone

## M010: AI proficiency in people development

### Goal

Make AI proficiency a visible, structured coaching and IDP dimension inside the People workspace.

### Proposed Slices

#### S01 — AI proficiency rubric contract
- define how the ladder is stored and phrased locally
- decide how it fits into 1:1 prep, people notes, and IDP drafts

#### S02 — People workspace integration
- add AI proficiency fielding/prompting in people workflows
- support notes on current level, examples, and growth next steps

#### S03 — IDP / 1:1 output integration
- ensure generated 1:1 prep and IDP drafts can include AI proficiency consistently

### Why This Should Follow M009

This is valuable, but it is narrower in scope and affects a smaller slice of daily operating pain than roadmap communication overhead.

---

## Recommended Order

### 1. M008 — finish navigation coherence
Current in progress. Finish before starting new surface work.

### 2. M009 — Roadmap communications and collateral operations
Highest-value next problem introduced by the new requirements.

### 3. M010 — AI proficiency in people development
Strong follow-up once the roadmap comms problem is structured.

---

## Surface Mapping

### Likely surfaces for M009
- drafting workspace / artifact flow
- assistant reminders
- review or today for quarterly collateral nudges
- maybe Control Tower for roadmap source context

### Likely surfaces for M010
- `/people`
- IDP draft flows
- 1:1 prep flows
- people evidence / coaching overlays

---

## Decision Recommendation

**Build M009 first.**

Why:
- it addresses a recurring cross-vertical executive/business communication burden
- it is closer to your repeated artifact production pain
- it likely unlocks immediate savings in roadmap-status and RFP support work

Then build **M010** as the people-development extension.
