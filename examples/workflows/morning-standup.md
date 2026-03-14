# Morning Standup Workflow

A quick 5-minute Director-of-Products check-in to decide where Joydeep should intervene today.

## Goal

Start the day with a **Director Intervention Brief** and commit to **Today’s Three** only.

This workflow is not about building a long task list. It is about identifying the few decisions, unblockers, follow-ups, or artifacts that most need Joydeep’s attention.

## The Prompt

```text
What needs my intervention today?
```

You can also use:

```text
What are my Today's Three?
```

## Workflow Structure

### Step 1: Build the Director Intervention Brief

Review the current task list, blocked work, recent meeting notes, stale follow-ups, and feature-request context.

Answer these questions first:
1. Which PM, client, feature request, or leadership deliverable needs intervention today?
2. Why does it matter now?
3. What specific action is needed from Joydeep?

Present the brief in this order:
- **Intervention item**
- **Why now**
- **Recommended action**
- **Which operating goal it supports**

### Step 2: Pick Today’s Three

After the intervention brief, recommend **no more than three** focus items.

Prioritize by:
1. business or client risk
2. blocker age / staleness
3. leadership urgency
4. impact on Documentation, Stability, New Business, or Team Leadership
5. dependency impact on PMs or engineering

Each recommended item should include:
- priority level
- expected time or effort
- why it matters now
- what good looks like by end of day

### Step 3: Flag what is blocked or stale

Explicitly call out:
- blocked tasks
- missing documentation
- unresolved engineering dependencies
- feature requests without an update
- meetings that require prep or follow-up

When possible, propose the next escalation, clarification, or follow-up action.

### Step 4: Adapt to the day shape

If the day is meeting-heavy or overloaded:
- recommend one or two high-leverage interventions only
- de-prioritize low-value admin work
- prefer unblockers and decisions over long maker tasks

## Example Response

**You:** What needs my intervention today?

**Assistant:**

## Director Intervention Brief

### 1. CIM BNPL configuration escalation
- **Why now:** Client is waiting on clarification and the PM has no confirmed engineering answer yet.
- **Recommended action:** Review the open dependency, decide whether to escalate to engineering today, and send a crisp internal follow-up.
- **Supports:** Stability + New Business

### 2. Leadership monthly update draft
- **Why now:** You need a defensible update on progress, risks, and asks before the leadership review.
- **Recommended action:** Block 45 minutes to consolidate wins, risk items, and support needed.
- **Supports:** Documentation

## Today’s Three

**1. [P0] Unblock CIM BNPL escalation** (30 min)
- PM is waiting on your intervention
- Success today = clear owner, next step, and follow-up message sent

**2. [P0] Draft leadership update outline** (45 min)
- Avoid last-minute scrambling
- Success today = outline with wins, risks, asks, and open dependencies

**3. [P1] Review LAS grooming readiness gaps** (30 min)
- Missing estimate/clarity can derail the next grooming session
- Success today = list of missing inputs and owners

## Blocked / Stale Items

- **Co-lending waiver story** — no update in 6 days; engineering dependency is stale
- **PM feedback note for monthly 1:1** — draft not captured yet
- **Feature request: client charge-waiver visibility** — needs a durable note in `Knowledge/Feature-Requests/`

Want me to turn any of these into a concrete plan or follow-up note?

## Variations

### When overwhelmed

```text
I'm overwhelmed. What's the single highest-leverage intervention today?
```

### When short on time

```text
I only have 90 minutes of real focus time. What should I definitely do?
```

### When preparing for meetings

```text
I have a meeting-heavy day. What should I prep and what can wait?
```

### When coming back after context switching

```text
Remind me what was stuck, what I owe people, and what needs attention today.
```

## Tips

- Run this before checking Teams or email deeply.
- Commit to **Today’s Three** only.
- If more than three items feel urgent, identify the real intervention bottleneck instead of adding more work.
- Use meeting notes and feature-request files from `Knowledge/` to avoid re-deciding from scratch.
