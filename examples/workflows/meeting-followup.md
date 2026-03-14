# Meeting Follow-Up Workflow

Turn a meeting note, synced transcript, or raw discussion summary into durable operating artifacts.

## Goal

A meeting should not remain a static note. After processing, it should produce some combination of:
- action items
- blockers / risks
- follow-ups
- feature-request updates
- people-note updates
- leadership-update inputs
- learnings

## When to Use

Use this workflow after:
- client escalation calls
- PM syncs
- engineering grooming discussions
- roadmap / planning reviews
- leadership update meetings
- 1:1s with PMs or key counterparts

## Prompt Examples

```text
Turn this meeting note into follow-ups.
```

```text
Process this transcript and tell me what needs action.
```

```text
What from this meeting should become tasks, people notes, or feature-request updates?
```

## Required Input Contract

A meeting note or transcript does not need to be perfect, but it should ideally include:
- **Date**
- **Meeting type** (client call, PM sync, grooming, 1:1, leadership review, etc.)
- **Attendees**
- **What changed**
- **Decisions**
- **Action items**
- **Risks / blockers**
- **Open questions**

If some of these are missing, infer what you can and explicitly call out what is still ambiguous.

## Output Contract

Process the meeting in this exact order and produce these outputs.

### 1. Key decisions
Capture what was decided.

### 2. Action items
Create or update tasks only when there is:
- a clear action
- a likely owner
- a next step

### 3. Risks / blockers
Capture what could slip, what is blocked, and what may require director intervention.

### 4. Durable context updates
Route the meeting outputs into the correct long-lived artifact:

#### Feature-request update
Create or update a `Knowledge/Feature-Requests/` note if the meeting changes:
- scope
- urgency
- PM owner
- blocker state
- client impact
- next review point

#### People update
Create or update a `Knowledge/People/` note if the meeting reveals:
- support needs
- recurring coaching themes
- stakeholder expectations
- unresolved follow-up loops

#### Learning update
Create or update a `Knowledge/Learnings/` note if the meeting reveals a repeated pattern such as:
- recurring blocker causes
- repeated documentation gaps
- unclear story quality before grooming
- repeated escalation or follow-up failures

#### Leadership / status input
Flag if the meeting creates input for:
- monthly leadership update
- grooming prep
- escalation summary
- internal status communication

## Processing Steps

### Step 1: Identify what changed
Extract:
- decisions made
- action items
- risks surfaced
- dependencies mentioned
- unresolved questions
- promises or commitments made by Joydeep or others

### Step 2: Decide what becomes durable
Not every statement becomes a task.

Use these rules:
- **Task** if someone must do something next
- **Feature-request note** if the meeting changed the understanding of a product ask
- **People note** if the meeting changed understanding of a PM, stakeholder, or counterpart
- **Learning note** if the same pattern is repeating
- **Leadership artifact input** if the meeting changes what should appear in a leadership/status update

### Step 3: Surface the outputs
Present a concise summary in this order:
1. **Key decisions**
2. **Action items**
3. **Risks / blockers**
4. **Suggested task creations or updates**
5. **Suggested knowledge-note updates**
6. **What Joydeep should do next**

### Step 4: Suggest the next intervention
Recommend the highest-leverage next move, for example:
- escalate to engineering
- ask PM for missing clarity
- capture a durable feature-request note
- follow up with a client or stakeholder
- add a point to the next leadership update

## Example Output Shape

### Key decisions
- Charge-waiver visibility needs a proper feature-request write-up before grooming
- Engineering needs one clarified story before sizing

### Action items
- Ask PM owner to draft acceptance criteria by tomorrow
- Follow up with engineering lead on blocker ownership
- Add the client ask to the monthly update risk section

### Risks / blockers
- Client expectation is ahead of confirmed feasibility
- No durable feature-request note exists yet
- Grooming may slip if story clarity is not fixed this week

### Suggested task updates
- Create task: "Draft charge-waiver visibility feature-request note"
- Create task: "Follow up with engineering on BNPL blocker ownership"

### Suggested knowledge updates
- Update `Knowledge/Feature-Requests/charge-waiver-visibility.md`
- Update `Knowledge/People/pm-[name].md` with the recurring clarity gap
- Add a note to `Knowledge/Learnings/` if this is the second similar grooming issue this month

### What Joydeep should do next
- Review the feature-request framing before grooming
- Clarify engineering ownership today

## Tips

- Don’t treat every meeting note as a task list; first decide what actually changed.
- If the same issue spans multiple meetings, update one durable note instead of creating duplicate files.
- If a follow-up is ambiguous, capture it as an open question before turning it into a task.
- Prefer one durable meeting-derived update per object (task, feature request, people note, learning) rather than duplicating context everywhere.
