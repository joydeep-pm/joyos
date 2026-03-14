# Meeting Follow-Up Runbook

Use this runbook when processing a meeting note or transcript into durable operating artifacts.

## Goal

Convert one meeting into structured outputs that the Personal OS can carry forward.

## Inputs

Start with one of these:
- a typed meeting note
- a transcript synced from Granola
- a raw summary pasted into the assistant

## Minimum Input Shape

Try to identify:
- date
- meeting type
- attendees
- what changed
- decisions
- action items
- risks / blockers
- open questions

If some are missing, mark the gaps explicitly instead of guessing.

## Output Targets

Every meeting should produce some combination of these:
- task updates
- `Knowledge/Feature-Requests/` update
- `Knowledge/People/` update
- `Knowledge/Learnings/` update
- leadership / status update input

When processing a meeting, also make the continuity state explicit:
- which commitments are still open
- which points are blocked
- which points are ambiguous rather than ready for action
- which durable artifacts should be updated next

## Processing Checklist

### 1. Capture key decisions
What was actually decided?

### 2. Capture action items
What must someone do next?

### 3. Capture blockers / risks
What is blocked, uncertain, stale, or likely to slip?

### 4. Route durable updates
Ask:
- Did this change a product ask? → update `Feature-Requests/`
- Did this reveal a coaching or stakeholder theme? → update `People/`
- Did this reveal a repeated pattern? → update `Learnings/`
- Did this affect leadership communication? → note the update input

For each routed output, capture a simple target label or path hint when you can. Example targets:
- task
- `Knowledge/Feature-Requests/...`
- `Knowledge/People/...`
- `Knowledge/Learnings/...`
- leadership update draft

### 5. Recommend Joydeep’s next intervention
What is the single highest-leverage next move?

### 6. Mark ambiguity explicitly
If a point is not ready to become a task or concrete update, keep it visible as an ambiguous open question instead of silently dropping it.

## Failure Signals

Something is off if:
- the meeting creates no durable output even though real decisions or blockers were discussed
- every meeting point is turned into a task without filtering
- repeated patterns never make it into `Knowledge/Learnings/`
- feature-request changes stay trapped in meeting notes instead of updating durable request files

## Good Output Example

A useful meeting follow-up should let a future agent answer:
- what was decided
- what needs to happen next
- what is blocked
- which durable notes need updating
- what Joydeep should intervene on now

## Related Files

- `examples/workflows/meeting-followup.md`
- `examples/example_files/meeting-note-example.md`
- `examples/example_files/meeting-followup-output-example.md`
- `core/integrations/granola/README.md`
