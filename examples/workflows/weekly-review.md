# Weekly Review Workflow

A 20-30 minute Director-of-Products review to reflect, learn, and prepare the next week.

## Goal

Use the week’s tasks, meetings, feature requests, blockers, and people notes to answer:
- what moved
- what stalled
- where intervention was needed
- what the system should learn
- what matters most next week

## When to Do It

- Friday afternoon
- Sunday evening
- Monday morning before the week fully starts

## Review Sequence

### Step 1: What moved this week?

Prompt:

```text
What moved this week across Documentation, Stability, New Business, and Team Leadership?
```

The response should group progress by operating goal, not just by raw task count.

Look for:
- PRDs, user stories, updates, and artifacts completed
- stability issues resolved or prevented
- client or sales-driven asks advanced
- PM coaching, support, or 1:1 prep completed

### Step 2: Where did Joydeep have to intervene?

Prompt:

```text
Where did I have to intervene this week, and why?
```

Organize this by:
- PM owner
- client
- feature request / initiative
- blocker type

Typical categories:
- engineering dependency stale
- unclear PRD or story
- client escalation aging
- leadership artifact due
- implementation gap surfaced late
- prioritization ambiguity

### Step 3: What is blocked, stale, or drifting?

Prompt:

```text
What is blocked, stale, or likely to become a problem next week?
```

Surface:
- blocked tasks
- stale feature requests
- unresolved follow-ups from meetings
- documentation gaps
- PMs who need support
- risks that may show up in leadership conversations

For each item, suggest the likely next move:
- escalate
- clarify
- draft
- delegate
- follow up
- deprioritize

### Step 4: What patterns repeated?

Prompt:

```text
What patterns repeated this week across blockers, PM coaching, client asks, or documentation quality?
```

Look for recurring themes such as:
- the same engineering bottleneck across multiple items
- PMs bringing work too late for grooming
- user stories lacking clarity
- repeated stability issues in the same area
- leadership updates requiring last-minute assembly

### Step 5: What should the system learn?

Prompt:

```text
What should this Personal OS learn from this week?
```

Capture improvements for `Knowledge/Learnings/`, including:
- repeated prompting failures
- workflow friction
- note structures missing from `Knowledge/`
- templates that should be created
- recurring blocker patterns worth tracking explicitly

### Step 6: Plan next week

Prompt:

```text
Help me plan next week. What are the priority interventions and must-win outcomes?
```

Recommend:
- top 3-5 priorities for next week
- critical meetings to prep for
- blockers to clear early
- leadership or client artifacts to draft ahead of time
- people-management conversations that need attention

## Example Output

### Progress by Operating Goal

**Documentation**
- Finalized 2 user-story sets for LAS and BNPL
- Drafted the monthly product update outline

**Stability**
- Surfaced 3 implementation gaps before grooming
- Closed one stale blocker with engineering on charge waiver logic

**New Business**
- Advanced one client ask into a scoped feature-request note
- Responded to an RFP-related product clarification

**Team Leadership**
- Prepared and completed 2 PM 1:1s
- Captured one recurring coaching theme around grooming readiness

### Intervention Summary

- PM A needed help with a stale engineering dependency
- One client escalation required director-level clarification
- Leadership update prep became urgent mid-week because source notes were fragmented

### Repeating Patterns

- Stories are reaching grooming without enough clarity
- Meeting follow-ups are not being converted into tasks consistently
- Stability-related asks are split across notes without one durable feature-request record

### System Learnings

- Add a reusable meeting follow-up workflow
- Keep one durable note per feature request in `Knowledge/Feature-Requests/`
- Capture PM coaching themes in people notes before 1:1s get close

### Next Week Priorities

1. Clear grooming-readiness gaps for top BNPL and co-lending items
2. Prepare the full monthly leadership update by Wednesday
3. Review stale client escalations and force next-owner clarity
4. Prep direct-report 1:1 talking points before the week gets crowded

## Quick Version (5 minutes)

If time is tight:

```text
Quick weekly review: What moved, what stalled, what repeated, and what are next week's must-win interventions?
```

## Tips

- Do not optimize for task volume; optimize for decision quality and risk visibility.
- Use `Knowledge/Meetings/`, `Knowledge/Feature-Requests/`, `Knowledge/People/`, and `Knowledge/Learnings/` during the review.
- If the same blocker appears twice in a month, treat it as a system issue, not a one-off.
- End with a short list of next week’s must-win outcomes, not a long list of chores.
