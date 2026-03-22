# FY27 Strategy Source Index

## Purpose

This file maps the original source corpus into the Personal OS strategy notes so future updates do not require rediscovery.

## Source Artifacts

### 1. Browser-local command center
- Source: `/Users/joy/Downloads/online_viewer_net.html`
- Role: Existing presentation artifact and synthesized command-center view
- Key value:
  - current strategy framing
  - execution-oriented dashboard structure
  - existing summaries for overview, strategy, roadmap, AOP, risks, and deep-dives
- Limitation:
  - browser-local state / localStorage-backed
  - not durable enough to act as operating-system truth

### 2. FY27 strategy report
- Source: `/Users/joy/Downloads/Product Strategy/Core Lending Strategy FY27 Report v1.0.pdf`
- Role: Primary narrative strategy source
- Key value:
  - burning-platform framing
  - executive summary
  - FY26 loss patterns
  - strategic bets
  - market-entry thesis
  - compliance and parity rationale

### 3. FY27 strategy deck
- Source: `/Users/joy/Downloads/Product Strategy/M2P Finflux CLS FY27 Strategy Deck v1.0.pdf`
- Role: Executive summary / presentation layer
- Key value:
  - five strategic imperatives
  - headline metrics
  - crisp articulation of revenue bleed, compliance, AI leverage, and new market entry

### 4. AOP planning PDF
- Source: `/Users/joy/Downloads/Product Strategy/AOP Planning.pdf`
- Role: quarter-by-quarter investment and ROI framing
- Key value:
  - feature/module effort estimates
  - quarter placement
  - value proposition framing per item

### 5. Roadmap master workbook
- Source: `/Users/joy/Downloads/Product Strategy/Core Lending FY27 Roadmap Master v1.0.xlsx`
- Role: structured fact base
- Relevant sheets:
  - `1_ROADMAP_MASTER` — master EPIC list and rationale
  - `2_Q_BY_Q_EPICS` — quarter sequencing
  - `3_LOSS_INTELLIGENCE` — lost deals and mapped fixes
  - `4_COMPETITIVE_PARITY` — gap benchmarks
  - `5_RESOURCE_PLAN` — category-level PD concentration and capacity risks
  - `6_TOPIC_MAP` — dependency clusters and strategic connections
  - `7_CSUITE_SNAPSHOT` — leadership summary metrics

### 6. LOS AI-first strategy
- Source: `/Users/joy/Downloads/Product Strategy/LOS/AI-First LOS with Use Cases and Graded Agentic Autonomy.pdf`
- Role: next-horizon strategy input for origination, AI, and market expansion
- Key value:
  - AI-first LOS modules
  - agentic/autonomy framing
  - multilingual and regional expansion implications

### 7. LOS data masters design
- Source: `/Users/joy/Downloads/Product Strategy/LOS/Data Masters for Intelligent Loan Origination System.pdf`
- Role: operating architecture input for LOS strategy
- Key value:
  - master data governance
  - maker-checker, auditability, approvals
  - MFE-based architecture patterns
  - regional compliance and scale considerations

## Source-to-Note Mapping

| Personal OS note | Primary sources | Why it exists |
|---|---|---|
| `Executive-Snapshot.md` | strategy report, strategy deck, c-suite snapshot sheet, HTML overview | fastest factual summary of the FY27 strategy story |
| `Strategic-Imperatives.md` | strategy deck, strategy report, HTML strategy tab | preserves the high-level strategic bets with clearer operating language |
| `FY26-Lessons-Learned.md` | strategy report, loss intelligence sheet, HTML loss/risk framing | turns past-year patterns into reusable leadership lessons |
| `Win-Loss-Analysis.md` | loss intelligence sheet, parity sheet, strategy report | explains where revenue was lost, why, and what fixes map to recovery |
| `AOP-vs-Roadmap.md` | AOP PDF, roadmap master workbook, resource plan sheet, topic map sheet | captures planning, sequencing, concentration, and execution logic |
| `LOS-Strategy.md` | LOS AI-first PDF, data masters PDF | separates LOS as a distinct strategic track with architectural implications |
| `Operating-Command-Brief.md` | all synthesized notes above | single leadership-ready brief for regular use |

## Update Rule

When source documents change:
1. update this file first if source inventory or source roles changed
2. update the specific note(s) affected
3. refresh `Operating-Command-Brief.md` last so it remains a current summary of the deeper notes
