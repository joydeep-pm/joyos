#!/usr/bin/env bash

# Personal OS Setup Script
# Creates directories, copies templates, and guides you through goals creation
#
# ┌────────────────────────────────────────────────────────────────────────────┐
# │ AGENT INSTRUCTIONS                                                         │
# │                                                                            │
# │ If you are an AI agent (e.g. Claude Code) reading this file:               │
# │ Do NOT execute this script as bash. Instead, walk through the              │
# │ setup interactively using your tools. Use AskUserQuestion (or your         │
# │ equivalent interactive tool) to gather answers from the user.              │
# │                                                                            │
# │ Follow these steps:                                                        │
# │                                                                            │
# │ 1. CREATE WORKSPACE STRUCTURE                                              │
# │    - Ensure these directories exist: Tasks/, Knowledge/                    │
# │    - If AGENTS.md doesn't exist, copy from core/templates/AGENTS.md        │
# │    - If .gitignore doesn't exist, copy from core/templates/gitignore       │
# │    - If BACKLOG.md doesn't exist, create it with a short intro             │
# │                                                                            │
# │ 2. ASK THE USER THESE 5 QUESTIONS (use AskUserQuestion if you              │
# │    have it, otherwise ask inline):                                         │
# │    Q1: "What product charter, business area, or scope do you own?"        │
# │        Example: Core lending suite, BNPL, platform risk, platform infra    │
# │    Q2: "What would success look like this year across Documentation,       │
# │         Stability, and New Business?"                                     │
# │    Q3: "What are your most important objectives for THIS QUARTER           │
# │         (next 90 days)?"                                                   │
# │    Q4: "What leadership artifacts or recurring reviews do you need         │
# │         to stay ahead of?"                                                 │
# │        Example: monthly leadership updates, grooming, roadmap reviews      │
# │    Q5: "What are the top 3 interventions or priorities on your plate       │
# │         right now?"                                                        │
# │                                                                            │
# │ 3. GENERATE GOALS.md                                                       │
# │    Use the answers to populate GOALS.md following the template             │
# │    defined at the bottom of this script (search for "cat > GOALS")        │
# │                                                                            │
# │ 4. SUMMARIZE                                                               │
# │    Tell the user what was created and suggest next steps:                  │
# │    - Review GOALS.md and refine as needed                                  │
# │    - Read AGENTS.md to understand the Director-of-Products workflow        │
# │    - Start adding tasks or notes to BACKLOG.md                             │
# │    - Say "process my backlog" or "what needs my intervention today?"      │
# └────────────────────────────────────────────────────────────────────────────┘

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo "============================================================"
    echo "  $1"
    echo "============================================================"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

ask_question() {
    local prompt="$1"
    local example="$2"
    local response=""

    echo "" >&2
    echo "$prompt" >&2
    if [ -n "$example" ]; then
        echo -e "${BLUE}$example${NC}" >&2
    fi
    read -r response
    echo "$response"
}

# Start setup
clear
print_header "Welcome to Personal OS Setup"

echo "This setup will help you:"
echo "  1. Create your workspace structure"
echo "  2. Define your operating goals and intervention priorities"
echo "  3. Configure your AI assistant for a Director-of-Products workflow"
echo ""
echo "Takes about 2 minutes. Be specific and practical."
echo ""
read -p "Press Enter to begin..."

# Create directories
print_header "Creating Workspace"

for dir in "Tasks" "Knowledge"; do
    if [ -d "$dir" ]; then
        print_info "Directory exists: $dir/"
    else
        mkdir -p "$dir"
        print_success "Created: $dir/"
    fi
done

# Copy template files
print_header "Setting Up Templates"

if [ ! -f "AGENTS.md" ] && [ -f "core/templates/AGENTS.md" ]; then
    cp "core/templates/AGENTS.md" "AGENTS.md"
    print_success "Copied: AGENTS.md"
else
    print_info "File exists: AGENTS.md (preserving your version)"
fi

if [ ! -f ".gitignore" ] && [ -f "core/templates/gitignore" ]; then
    cp "core/templates/gitignore" ".gitignore"
    print_success "Copied: .gitignore"
else
    print_info "File exists: .gitignore (preserving your version)"
fi

if [ ! -f "BACKLOG.md" ]; then
    cat > "BACKLOG.md" << 'EOF'
# Backlog

Drop raw notes, escalations, follow-ups, and half-formed ideas here. Say `process my backlog` when you're ready to triage.
EOF
    print_success "Created: BACKLOG.md"
else
    print_info "File exists: BACKLOG.md"
fi

print_header "Seeding Knowledge Structure"

for subdir in "Feature-Requests" "People" "Learnings"; do
    target_dir="Knowledge/$subdir"
    template_readme="core/templates/Knowledge/$subdir/README.md"
    target_readme="$target_dir/README.md"

    if [ -d "$target_dir" ]; then
        print_info "Directory exists: $target_dir/"
    else
        mkdir -p "$target_dir"
        print_success "Created: $target_dir/"
    fi

    if [ ! -f "$target_readme" ] && [ -f "$template_readme" ]; then
        cp "$template_readme" "$target_readme"
        print_success "Copied: $target_readme"
    elif [ -f "$target_readme" ]; then
        print_info "File exists: $target_readme (preserving your version)"
    else
        print_warning "Template missing: $template_readme"
    fi
done

# Goals creation
print_header "Building Your Operating Goals"

echo "Now let's create your GOALS.md - the operating core of this Personal OS."
echo ""
echo "This helps your AI assistant prioritize Documentation, Stability, New Business, and leadership interventions."
echo ""
echo "You can refine GOALS.md later as your priorities shift."
echo ""
read -p "Ready to start? Press Enter..."

print_header "1. Role And Scope"

ans_role=$(ask_question \
    "What's your current role?" \
    "Director of Products, VP Product, Group PM")

ans_scope=$(ask_question \
    "What product charter, business area, or scope do you own?" \
    "Core lending suite, BNPL, co-lending, platform infra, collections")

print_header "2. Operating Success"

ans_success_year=$(ask_question \
    "What would success look like this year across Documentation, Stability, and New Business?" \
    "Cleaner PRDs and updates, fewer surprises in delivery, stronger client and revenue impact")

print_header "3. This Quarter"

ans_qtr=$(ask_question \
    "What are your most important objectives for THIS QUARTER (next 90 days)?" \
    "Improve grooming readiness, reduce implementation churn, move priority client asks")

print_header "4. Leadership Rhythm"

ans_artifacts=$(ask_question \
    "What leadership artifacts or recurring reviews do you need to stay ahead of?" \
    "Monthly leadership updates, grooming reviews, roadmap reviews, PM 1:1s")

print_header "5. Current Interventions"

ans_top3=$(ask_question \
    "What are the top 3 interventions or priorities on your plate right now?" \
    "1. Resolve stale client escalation, 2. Finish leadership update, 3. Unblock grooming readiness")

CURRENT_DATE=$(date +"%B %d, %Y")

print_header "Generating Your GOALS.md"

cat > "GOALS.md" << EOF
# Goals & Operating Direction

*Last updated: ${CURRENT_DATE}*

## Current Context

### Role
${ans_role}

### Product Scope / Charter
${ans_scope}

## Operating Goals

### Documentation
Keep product artifacts crisp, current, and useful:
- PRDs
- user stories
- leadership updates
- status summaries
- grooming-ready documentation

### Stability
Reduce delivery surprises and execution risk:
- blockers surfaced early
- implementation gaps identified before escalation
- stale dependencies followed through
- recurring failure patterns tracked

### New Business
Keep product opportunities and client-driven asks moving:
- feature requests scoped clearly
- sales / RFP asks answered well
- client escalations handled without drift
- roadmap opportunities made visible early

### Team Leadership
Support PM execution quality and growth:
- 1:1s prepared with evidence
- recurring coaching themes captured
- support needs surfaced before they become misses

## What would success look like this year?
${ans_success_year}

## Quarterly Priorities
${ans_qtr}

## Leadership Rhythm
${ans_artifacts}

## Today’s Three Rule
When planning each day:
- focus on no more than three meaningful priorities
- prefer interventions and unblockers over busywork
- on heavy meeting days, reduce focus to one or two high-leverage moves

## Priority Framework

**P0 (Critical / Director attention now)**
- urgent client or business risk
- stale blocker that needs intervention
- leadership artifact due soon
- issue directly affecting Documentation, Stability, or New Business this week

**P1 (Important this week)**
- meaningful progress on charter priorities
- PM or stakeholder follow-up with clear downstream impact
- grooming or planning preparation that prevents future churn

**P2 (Scheduled work)**
- normal planning, writing, research, and operational work
- tasks that support the goals but do not need immediate intervention

**P3 (Someday / maybe)**
- low-leverage admin
- speculative ideas without a clear near-term payoff
- work that does not currently move the operating goals

## Current Top 3 Interventions / Priorities
${ans_top3}

---

**Your AI assistant uses this document to prioritize work, surface what needs intervention, and suggest Today’s Three.**

*Review this weekly as your charter, pressure points, and leadership needs evolve.*
EOF

print_success "Created: GOALS.md"

print_header "Setup Complete!"

echo "Your Director-of-Products Personal OS is ready to use."
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Review GOALS.md and refine the language as needed"
echo "2. Read AGENTS.md to understand how the assistant now prioritizes interventions"
echo "3. Start adding tasks, follow-ups, or escalations to BACKLOG.md"
echo "4. Create durable notes under Knowledge/ for feature requests, meetings, people, and learnings"
echo "5. Tell your AI: 'What needs my intervention today?' or 'Process my backlog'"
echo ""
print_success "Happy operating!"
echo ""
