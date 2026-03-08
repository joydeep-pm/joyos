/**
 * Artifact Templates
 *
 * Predefined templates for generating structured documents.
 */

import type { ArtifactTemplate, ArtifactType } from "./types";

/**
 * PRD Template
 */
export const PRD_TEMPLATE: ArtifactTemplate = {
  type: "prd",
  name: "Product Requirements Document",
  description: "Detailed product requirement specification",
  sections: [
    {
      id: "overview",
      title: "Overview",
      placeholder: "High-level summary of the feature and its business value",
      required: true,
      hints: [
        "What problem does this solve?",
        "Who is the target user?",
        "What is the expected business impact?"
      ]
    },
    {
      id: "background",
      title: "Background & Context",
      placeholder: "Context and motivation for this feature",
      required: true,
      hints: [
        "Why now?",
        "What is the current state?",
        "What customer/client feedback led to this?"
      ]
    },
    {
      id: "objectives",
      title: "Objectives",
      placeholder: "Specific goals and success criteria",
      required: true,
      hints: [
        "What are the measurable outcomes?",
        "How will we know this is successful?",
        "What are the key performance indicators?"
      ]
    },
    {
      id: "user_stories",
      title: "User Stories",
      placeholder: "As a [user type], I want to [action] so that [benefit]",
      required: true,
      hints: [
        "Who are the actors?",
        "What are the key user flows?",
        "What are the edge cases?"
      ]
    },
    {
      id: "requirements",
      title: "Functional Requirements",
      placeholder: "Detailed functional specifications",
      required: true,
      hints: [
        "What must the system do?",
        "What are the input/output specifications?",
        "What are the business rules?"
      ]
    },
    {
      id: "non_functional",
      title: "Non-Functional Requirements",
      placeholder: "Performance, security, scalability requirements",
      required: false,
      hints: [
        "Performance requirements?",
        "Security considerations?",
        "Scalability needs?"
      ]
    },
    {
      id: "dependencies",
      title: "Dependencies & Assumptions",
      placeholder: "External dependencies and key assumptions",
      required: true,
      hints: [
        "What systems/teams are involved?",
        "What are we assuming?",
        "What could block this?"
      ]
    },
    {
      id: "out_of_scope",
      title: "Out of Scope",
      placeholder: "What is explicitly not included",
      required: false,
      hints: ["What won't be delivered in this version?"]
    },
    {
      id: "acceptance_criteria",
      title: "Acceptance Criteria",
      placeholder: "Conditions that must be met for acceptance",
      required: true,
      hints: [
        "What does done look like?",
        "How will we test this?",
        "What are the edge cases?"
      ]
    }
  ]
};

/**
 * User Story Template
 */
export const USER_STORY_TEMPLATE: ArtifactTemplate = {
  type: "user_story",
  name: "User Story",
  description: "Agile user story with acceptance criteria",
  sections: [
    {
      id: "story",
      title: "User Story",
      placeholder: "As a [user type], I want to [action] so that [benefit]",
      required: true,
      hints: ["Who is the user?", "What do they want to do?", "Why do they want to do it?"]
    },
    {
      id: "context",
      title: "Context",
      placeholder: "Background and additional context",
      required: false,
      hints: ["Why is this important?", "What is the current pain point?"]
    },
    {
      id: "acceptance_criteria",
      title: "Acceptance Criteria",
      placeholder: "Given [context], When [action], Then [outcome]",
      required: true,
      hints: [
        "What are the testable conditions?",
        "What are the success scenarios?",
        "What are the edge cases?"
      ]
    },
    {
      id: "technical_notes",
      title: "Technical Notes",
      placeholder: "Technical implementation considerations",
      required: false,
      hints: ["API endpoints needed?", "Database changes?", "Third-party integrations?"]
    },
    {
      id: "dependencies",
      title: "Dependencies",
      placeholder: "Blocked by or blocks other stories",
      required: false,
      hints: ["What must be done first?", "What does this enable?"]
    }
  ]
};

/**
 * Follow-up Template
 */
export const FOLLOW_UP_TEMPLATE: ArtifactTemplate = {
  type: "follow_up",
  name: "Follow-up Communication",
  description: "Follow-up message for stakeholders",
  sections: [
    {
      id: "greeting",
      title: "Greeting",
      placeholder: "Hi [Name],",
      required: true
    },
    {
      id: "context",
      title: "Context",
      placeholder: "I'm following up on [feature request title]",
      required: true,
      hints: ["Reference the original request", "Provide current status"]
    },
    {
      id: "updates",
      title: "Updates",
      placeholder: "Current status and progress",
      required: true,
      hints: ["What has been done?", "What is in progress?", "What is next?"]
    },
    {
      id: "blockers",
      title: "Blockers (if any)",
      placeholder: "Current blockers or dependencies",
      required: false,
      hints: ["What is preventing progress?", "What help is needed?"]
    },
    {
      id: "next_steps",
      title: "Next Steps",
      placeholder: "Planned actions and timeline",
      required: true,
      hints: ["What will happen next?", "When can they expect an update?"]
    },
    {
      id: "closing",
      title: "Closing",
      placeholder: "Let me know if you have any questions.",
      required: true
    }
  ]
};

/**
 * Clarification Request Template
 */
export const CLARIFICATION_REQUEST_TEMPLATE: ArtifactTemplate = {
  type: "clarification_request",
  name: "Clarification Request",
  description: "Request for additional information or clarification",
  sections: [
    {
      id: "greeting",
      title: "Greeting",
      placeholder: "Hi [Name],",
      required: true
    },
    {
      id: "context",
      title: "Context",
      placeholder: "Regarding [feature request title]",
      required: true,
      hints: ["Reference the request", "Provide brief context"]
    },
    {
      id: "questions",
      title: "Questions",
      placeholder: "I need clarification on the following:",
      required: true,
      hints: [
        "What is unclear?",
        "What assumptions need validation?",
        "What details are missing?"
      ]
    },
    {
      id: "impact",
      title: "Impact",
      placeholder: "This will help us to...",
      required: false,
      hints: ["Why is this information needed?", "How will it help?"]
    },
    {
      id: "timeline",
      title: "Timeline",
      placeholder: "Could you provide this information by [date]?",
      required: false
    },
    {
      id: "closing",
      title: "Closing",
      placeholder: "Thank you for your help.",
      required: true
    }
  ]
};

/**
 * Status Update Template
 */
export const STATUS_UPDATE_TEMPLATE: ArtifactTemplate = {
  type: "status_update",
  name: "Status Update",
  description: "Internal status update for team/leadership",
  sections: [
    {
      id: "summary",
      title: "Summary",
      placeholder: "Brief status summary",
      required: true,
      hints: ["What is the current state?", "Green/Yellow/Red status?"]
    },
    {
      id: "progress",
      title: "Progress",
      placeholder: "What has been accomplished",
      required: true,
      hints: ["Completed milestones?", "Delivered features?"]
    },
    {
      id: "current_work",
      title: "Current Work",
      placeholder: "Work in progress",
      required: true,
      hints: ["What is being worked on now?", "Who is working on it?"]
    },
    {
      id: "blockers",
      title: "Blockers & Risks",
      placeholder: "Current blockers and risks",
      required: true,
      hints: ["What is blocking progress?", "What are the risks?", "Mitigation plans?"]
    },
    {
      id: "next_steps",
      title: "Next Steps",
      placeholder: "Upcoming work and timeline",
      required: true,
      hints: ["What's next?", "Expected completion dates?"]
    },
    {
      id: "help_needed",
      title: "Help Needed",
      placeholder: "Support required from leadership",
      required: false,
      hints: ["What decisions are needed?", "What resources are needed?"]
    }
  ]
};

/**
 * Leadership Update Template
 */
export const LEADERSHIP_UPDATE_TEMPLATE: ArtifactTemplate = {
  type: "leadership_update",
  name: "Leadership Update",
  description: "Monthly product update for leadership",
  sections: [
    {
      id: "executive_summary",
      title: "Executive Summary",
      placeholder: "High-level summary for leadership",
      required: true,
      hints: ["Key achievements", "Critical risks", "Major decisions needed"]
    },
    {
      id: "key_metrics",
      title: "Key Metrics",
      placeholder: "Relevant KPIs and metrics",
      required: true,
      hints: ["Delivery velocity", "Quality metrics", "Customer satisfaction"]
    },
    {
      id: "achievements",
      title: "Achievements",
      placeholder: "Completed work and milestones",
      required: true,
      hints: ["What shipped?", "What value was delivered?"]
    },
    {
      id: "in_progress",
      title: "In Progress",
      placeholder: "Current initiatives",
      required: true,
      hints: ["Major ongoing work", "Expected completion"]
    },
    {
      id: "risks_issues",
      title: "Risks & Issues",
      placeholder: "Critical risks and how they're being addressed",
      required: true,
      hints: ["High-priority risks", "Mitigation strategies", "Escalation needed?"]
    },
    {
      id: "upcoming",
      title: "Upcoming",
      placeholder: "Next period's focus",
      required: true,
      hints: ["Priorities for next period", "Resource needs"]
    }
  ]
};

/**
 * Client Summary Template
 */
export const CLIENT_SUMMARY_TEMPLATE: ArtifactTemplate = {
  type: "client_summary",
  name: "Client Escalation Summary",
  description: "Summary of client escalation for internal tracking",
  sections: [
    {
      id: "client_request",
      title: "Client Request",
      placeholder: "What the client asked for",
      required: true,
      hints: ["Original request", "Client priority", "Business impact"]
    },
    {
      id: "current_status",
      title: "Current Status",
      placeholder: "Where we are now",
      required: true,
      hints: ["Progress made", "Current blockers", "Timeline"]
    },
    {
      id: "actions_taken",
      title: "Actions Taken",
      placeholder: "Steps taken to address the request",
      required: true,
      hints: ["What has been done?", "Who is involved?"]
    },
    {
      id: "next_steps",
      title: "Next Steps",
      placeholder: "Planned actions",
      required: true,
      hints: ["What will be done?", "By when?", "By whom?"]
    },
    {
      id: "client_communication",
      title: "Client Communication",
      placeholder: "Summary of communication with client",
      required: false,
      hints: ["Last update to client", "Client feedback", "Next scheduled update"]
    }
  ]
};

/**
 * M2P: OKR Update Template
 */
export const OKR_UPDATE_TEMPLATE: ArtifactTemplate = {
  type: "okr_update",
  name: "OKR Progress Update",
  description: "Quarterly OKR tracking for M2P leadership (Documentation, Stability, New Business)",
  sections: [
    {
      id: "objective",
      title: "Objective",
      placeholder: "Which objective is this for? (Documentation / Stability / New Business)",
      required: true,
      hints: ["Which of the three major OKRs?", "Owner?", "Quarter?"]
    },
    {
      id: "key_results",
      title: "Key Results",
      placeholder: "List measurable key results and their current status",
      required: true,
      hints: ["What are the KRs for this objective?", "What's the target?", "What's the current status?"]
    },
    {
      id: "progress_summary",
      title: "Progress Summary",
      placeholder: "Overall progress this quarter",
      required: true,
      hints: ["What's been accomplished?", "What's on track?", "What's at risk?"]
    },
    {
      id: "metrics",
      title: "Metrics",
      placeholder: "Quantitative progress metrics",
      required: true,
      hints: ["Current vs. target numbers", "Trend direction", "Leading indicators"]
    },
    {
      id: "blockers",
      title: "Blockers & Risks",
      placeholder: "What's preventing progress?",
      required: false,
      hints: ["Dependencies?", "Resource constraints?", "External factors?"]
    },
    {
      id: "next_steps",
      title: "Next Steps",
      placeholder: "Actions for next period",
      required: true,
      hints: ["What needs to happen?", "Who's responsible?", "By when?"]
    }
  ]
};

/**
 * M2P: IDP Feedback Template (M2P Format)
 * Based on M2P's IDP spreadsheet format
 */
export const IDP_FEEDBACK_TEMPLATE: ArtifactTemplate = {
  type: "idp_feedback",
  name: "IDP Feedback (M2P Format)",
  description: "M2P Fintech Individual Development Plan - Performance management and growth tracking",
  sections: [
    {
      id: "employee_info",
      title: "Employee Information",
      placeholder: `**Employee Name / Role:** [Name - Role]

**Manager:** [Manager Name]

**Function:** [Product / Engineering / Implementation]

**Last Update:** [Date]`,
      required: true,
      hints: ["Basic employee context"]
    },
    {
      id: "strengths",
      title: "Strengths",
      placeholder: `### Key Strengths:
- [Strength 1: e.g., Ownership]
- [Strength 2: e.g., Technical Depth]
- [Strength 3: e.g., Cross-functional Collaboration]

**Evidence/Examples:**
- [Specific examples demonstrating strengths]`,
      required: true,
      hints: ["Based on observed performance", "Provide specific examples"]
    },
    {
      id: "areas_for_development",
      title: "Areas for Development",
      placeholder: `### Primary Development Areas:
1. [Area 1: e.g., Product Sense & Strategy]
2. [Area 2: e.g., LMS Domain Knowledge]
3. [Area 3: e.g., Communication]

**Why these areas:**
- [Rationale for each development area]`,
      required: true,
      hints: ["Focus on 2-4 key development areas", "Aligned with role expectations and career growth"]
    },
    {
      id: "development_plan",
      title: "Development Plan",
      placeholder: `## Area 1: [Development Area Name]

### Development Goal:
[Specific, measurable goal]

### Development Actions:
- [ ] Action 1: [Specific task/milestone]
- [ ] Action 2: [Specific task/milestone]
- [ ] Action 3: [Specific task/milestone]

**Timeline:** [Quarter / Month]

**Status:** [Not Started / In Progress / Completed]

**Success Measure:** [% completion or specific outcome]

---

## Area 2: [Development Area Name]

### Development Goal:
[Specific, measurable goal]

### Development Actions:
- [ ] Action 1: [Specific task/milestone]
- [ ] Action 2: [Specific task/milestone]

**Timeline:** [Quarter / Month]

**Status:** [Not Started / In Progress / Completed]

**Success Measure:** [% completion or specific outcome]`,
      required: true,
      hints: [
        "Each area should have clear goals and actions",
        "Include timeline and success measures",
        "Track progress regularly"
      ]
    },
    {
      id: "brag_sheet",
      title: "Brag Sheet (Accomplishments)",
      placeholder: `Track significant accomplishments and contributions:

| S.No. | Group/Client | Platform | Accomplishment |
|-------|--------------|----------|----------------|
| 1 | [Client/Project] | [LOS/LMS/Platform] | [Specific achievement] |
| 2 | [Client/Project] | [LOS/LMS/Platform] | [Specific achievement] |
| 3 | [Client/Project] | [LOS/LMS/Platform] | [Specific achievement] |

**Other Contributions:**
- [Cross-functional work]
- [Process improvements]
- [Documentation/enablement work]`,
      required: false,
      hints: [
        "Evidence for performance reviews",
        "Update regularly with wins",
        "Include both project and non-project work"
      ]
    },
    {
      id: "goals_okrs",
      title: "Current Quarter Goals/OKRs",
      placeholder: `| Objective | Weightage | Key Results | Status |
|-----------|-----------|-------------|--------|
| [Objective 1] | 30% | [KR with metrics] | [On Track/At Risk/Delayed] |
| [Objective 2] | 25% | [KR with metrics] | [On Track/At Risk/Delayed] |
| [Objective 3] | 20% | [KR with metrics] | [On Track/At Risk/Delayed] |

**Total Weightage:** 100%`,
      required: false,
      hints: ["Link to quarterly OKRs", "Ensure weightages add to 100%", "Track progress against each objective"]
    },
    {
      id: "monthly_one_on_one",
      title: "Monthly 1-on-1 Tracking",
      placeholder: `## Month 1: [Month Name]

### Review of Last Month:
- [Accomplishment 1]
- [Accomplishment 2]
- [Blocker/Challenge addressed]

### What to Expect This Month:
- [Goal 1]
- [Goal 2]
- [Key deliverable]

---

## Month 2: [Month Name]

### Review of Last Month:
- [Accomplishment 1]
- [Accomplishment 2]

### What to Expect This Month:
- [Goal 1]
- [Goal 2]`,
      required: false,
      hints: [
        "Track monthly progress and expectations",
        "Review accomplishments and set forward goals",
        "Use as discussion guide for 1-on-1s"
      ]
    }
  ]
};

/**
 * Get template by type
 */
export function getTemplate(type: ArtifactType): ArtifactTemplate {
  switch (type) {
    case "prd":
      return PRD_TEMPLATE;
    case "user_story":
      return USER_STORY_TEMPLATE;
    case "follow_up":
      return FOLLOW_UP_TEMPLATE;
    case "clarification_request":
      return CLARIFICATION_REQUEST_TEMPLATE;
    case "status_update":
      return STATUS_UPDATE_TEMPLATE;
    case "leadership_update":
      return LEADERSHIP_UPDATE_TEMPLATE;
    case "client_summary":
      return CLIENT_SUMMARY_TEMPLATE;
    case "okr_update":
      return OKR_UPDATE_TEMPLATE;
    case "idp_feedback":
      return IDP_FEEDBACK_TEMPLATE;
    case "bmad_prd":
      return PRD_TEMPLATE; // Use generic PRD for now, can be customized later
    default:
      throw new Error(`Unknown artifact type: ${type}`);
  }
}

/**
 * Get all available templates
 */
export function getAllTemplates(): ArtifactTemplate[] {
  return [
    PRD_TEMPLATE,
    USER_STORY_TEMPLATE,
    FOLLOW_UP_TEMPLATE,
    CLARIFICATION_REQUEST_TEMPLATE,
    STATUS_UPDATE_TEMPLATE,
    LEADERSHIP_UPDATE_TEMPLATE,
    CLIENT_SUMMARY_TEMPLATE,
    OKR_UPDATE_TEMPLATE,
    IDP_FEEDBACK_TEMPLATE
  ];
}

/**
 * Get default templates as a Map (for template registry)
 */
export function getDefaultTemplates(): Map<ArtifactType, ArtifactTemplate> {
  const templates = new Map<ArtifactType, ArtifactTemplate>();

  templates.set("prd", PRD_TEMPLATE);
  templates.set("user_story", USER_STORY_TEMPLATE);
  templates.set("follow_up", FOLLOW_UP_TEMPLATE);
  templates.set("clarification_request", CLARIFICATION_REQUEST_TEMPLATE);
  templates.set("status_update", STATUS_UPDATE_TEMPLATE);
  templates.set("leadership_update", LEADERSHIP_UPDATE_TEMPLATE);
  templates.set("client_summary", CLIENT_SUMMARY_TEMPLATE);
  templates.set("okr_update", OKR_UPDATE_TEMPLATE);
  templates.set("idp_feedback", IDP_FEEDBACK_TEMPLATE);
  templates.set("bmad_prd", PRD_TEMPLATE); // Can be customized with YAML template

  return templates;
}
