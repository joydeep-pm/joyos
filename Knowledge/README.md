# Knowledge

Store durable product-leadership context that helps the Personal OS make better decisions for Joydeep as Director of Products.

> This directory is gitignored — your notes stay private and local.

---

## Purpose

`Knowledge/` is not a generic dumping ground. It should hold the context your assistant needs to:
- understand feature requests and product charters
- remember client and stakeholder context
- turn meetings into follow-up actions
- support leadership updates and grooming prep
- capture recurring blocker patterns and system learnings

Keep notes concise, current, and easy to reference from `Tasks/`.

---

## Recommended Structure

```text
Knowledge/
├── Feature-Requests/      # One file per major request, initiative, or escalation
├── Meetings/              # Meeting notes, decisions, action items, risks
├── People/                # PMs, engineering counterparts, stakeholders, clients
├── Leadership-Updates/    # Monthly updates, review notes, talking points
├── Grooming/              # Grooming prep, prioritization notes, readiness gaps
├── Learnings/             # Recurring blocker patterns, prompting lessons, improvements
└── Research/              # Market research, analysis, references
```

You do not need to create everything at once. Start with the folders that match your current work.

---

## What Goes Here

| Folder | What to store | Typical fields / content |
|--------|---------------|--------------------------|
| `Feature-Requests/` | Major asks, client-driven requests, initiatives | source, charter, PM owner, current stage, blockers, next step |
| `Meetings/` | Meeting notes and synced transcripts | attendees, decisions, follow-ups, risks, dependencies |
| `People/` | PMs, engineering leads, stakeholders, clients | role, relationship context, open loops, next 1:1 topics |
| `Leadership-Updates/` | Monthly updates and leadership artifacts | wins, risks, asks, milestones, stability issues |
| `Grooming/` | Sprint/grooming prep notes | readiness gaps, estimate questions, dependency risks |
| `Learnings/` | What the system should learn over time | repeated mistakes, blocker patterns, workflow improvements |
| `Research/` | Reference material | analysis, market intel, product comparisons |

---

## Suggested Note Types

### Feature request note
Use for any request or initiative that needs tracking over time.

Suggested sections:
- Summary
- Source / client / stakeholder
- Product charter
- PM owner
- Current status
- Risks / blockers
- Next decision or intervention needed
- Linked Jira / Confluence / meeting references

### Meeting note
Use for product reviews, client calls, PM syncs, engineering grooming, and 1:1s.

Suggested sections:
- Date and attendees
- What changed
- Decisions made
- Action items
- Risks / unresolved questions
- Follow-ups to convert into tasks

### People note
Use for PMs, engineering partners, sales counterparts, implementation leads, and key client contacts.

Suggested sections:
- Role / team / context
- Current responsibilities
- Open loops
- Recent themes
- Support or coaching needs
- Next follow-up

### Learning note
Use when patterns repeat.

Examples:
- recurring blocker causes
- repeated documentation gaps
- common grooming failures
- prompting patterns that waste time
- system improvements worth making later

---

## Linking from Tasks

Reference knowledge docs in task files:

```yaml
resource_refs:
  - Knowledge/Feature-Requests/cim-bnpl-limit-config.md
  - Knowledge/Meetings/2026-03-14-grooming-sync.md
  - Knowledge/People/pm-aarti.md
```

In each task’s **Context** section, mention:
- which operating goal it supports: **Documentation**, **Stability**, **New Business**, or **Team Leadership**
- which feature request, client, PM, or meeting it relates to

---

## Maintenance Guidance

- Prefer one durable note per long-lived topic instead of many fragmented files.
- Update the same file over time when the context is continuous.
- Keep raw capture in `BACKLOG.md`; move durable context here.
- If a note drives multiple tasks, link it from each relevant task.
- If the same blocker shows up repeatedly, create or update a file in `Knowledge/Learnings/` so it surfaces during weekly review.

See `examples/example_files/` for concrete note patterns.
