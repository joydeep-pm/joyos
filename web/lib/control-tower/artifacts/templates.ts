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
    CLIENT_SUMMARY_TEMPLATE
  ];
}
