/**
 * Stage Configuration & Metadata
 *
 * Provides centralized configuration for the 13-stage feature request lifecycle.
 * Includes stage grouping, visualization metadata, and transition logic.
 */

import type { FeatureRequestStage } from "./types";

export type StageGroup = "pre-development" | "development" | "deployment";

export interface StageMetadata {
  label: string;
  description: string;
  group: StageGroup;
  color: string; // Tailwind color class
  icon?: string; // Lucide icon name
  typicalOwner: "BA" | "PM" | "Director" | "Engineering";
  expectedDurationDays?: number;
  nextStages?: FeatureRequestStage[];
}

/**
 * Centralized stage configuration for all 13 stages
 */
export const STAGE_CONFIG: Record<FeatureRequestStage, StageMetadata> = {
  incoming: {
    label: "Incoming",
    description: "New request awaiting initial triage",
    group: "pre-development",
    color: "gray",
    icon: "Inbox",
    typicalOwner: "BA",
    expectedDurationDays: 2,
    nextStages: ["ba_grooming"]
  },
  ba_grooming: {
    label: "BA Grooming",
    description: "Business analyst analyzing and refining request",
    group: "pre-development",
    color: "blue",
    icon: "Search",
    typicalOwner: "BA",
    expectedDurationDays: 5,
    nextStages: ["pm_exploration", "director_review"]
  },
  pm_exploration: {
    label: "PM Exploration",
    description: "Product manager researching solution approaches",
    group: "pre-development",
    color: "blue",
    icon: "Lightbulb",
    typicalOwner: "PM",
    expectedDurationDays: 7,
    nextStages: ["director_review", "prd_drafting"]
  },
  director_review: {
    label: "Director Review",
    description: "Director evaluating scope, priority, and strategic fit",
    group: "pre-development",
    color: "purple",
    icon: "UserCheck",
    typicalOwner: "Director",
    expectedDurationDays: 3,
    nextStages: ["engineering_validation", "prd_drafting", "incoming"]
  },
  engineering_validation: {
    label: "Engineering Validation",
    description: "Engineering team validating technical feasibility",
    group: "pre-development",
    color: "cyan",
    icon: "Code",
    typicalOwner: "Engineering",
    expectedDurationDays: 5,
    nextStages: ["prd_drafting", "pm_exploration"]
  },
  prd_drafting: {
    label: "PRD Drafting",
    description: "Product requirements document being written",
    group: "pre-development",
    color: "blue",
    icon: "FileText",
    typicalOwner: "PM",
    expectedDurationDays: 5,
    nextStages: ["estimation"]
  },
  estimation: {
    label: "Estimation",
    description: "Engineering team sizing the work effort",
    group: "pre-development",
    color: "cyan",
    icon: "Calculator",
    typicalOwner: "Engineering",
    expectedDurationDays: 3,
    nextStages: ["prioritized", "director_review"]
  },
  prioritized: {
    label: "Prioritized",
    description: "Ready for development, awaiting sprint assignment",
    group: "pre-development",
    color: "green",
    icon: "CheckCircle",
    typicalOwner: "PM",
    nextStages: ["in_delivery"]
  },
  in_delivery: {
    label: "In Delivery",
    description: "Actively being developed by engineering",
    group: "development",
    color: "orange",
    icon: "Hammer",
    typicalOwner: "Engineering",
    nextStages: ["testing", "client_update"]
  },
  testing: {
    label: "Testing",
    description: "QA testing and validation in progress",
    group: "development",
    color: "yellow",
    icon: "Bug",
    typicalOwner: "Engineering",
    expectedDurationDays: 5,
    nextStages: ["uat_deploy", "in_delivery"]
  },
  client_update: {
    label: "Client Update",
    description: "Communicating progress or changes to client",
    group: "deployment",
    color: "blue",
    icon: "Mail",
    typicalOwner: "PM",
    expectedDurationDays: 2,
    nextStages: ["uat_deploy", "in_delivery"]
  },
  uat_deploy: {
    label: "UAT Deployment",
    description: "Deployed to UAT environment for client testing",
    group: "deployment",
    color: "purple",
    icon: "TestTube",
    typicalOwner: "Engineering",
    expectedDurationDays: 7,
    nextStages: ["prod_deploy", "testing"]
  },
  prod_deploy: {
    label: "Production Deployed",
    description: "Successfully deployed to production",
    group: "deployment",
    color: "green",
    icon: "CheckCheck",
    typicalOwner: "Engineering",
    nextStages: []
  }
};

/**
 * Get metadata for a specific stage
 */
export function getStageMetadata(stage: FeatureRequestStage): StageMetadata {
  return STAGE_CONFIG[stage];
}

/**
 * Get suggested next stage in workflow
 */
export function getNextStage(current: FeatureRequestStage): FeatureRequestStage | null {
  const meta = STAGE_CONFIG[current];
  return meta.nextStages?.[0] || null;
}

/**
 * Get all stages in a specific group
 */
export function getStagesByGroup(group: StageGroup): FeatureRequestStage[] {
  return Object.entries(STAGE_CONFIG)
    .filter(([_, meta]) => meta.group === group)
    .map(([stage, _]) => stage as FeatureRequestStage);
}

/**
 * Get color class for a stage
 */
export function getStageColor(stage: FeatureRequestStage): string {
  return STAGE_CONFIG[stage].color;
}

/**
 * Get all possible stages
 */
export function getAllStages(): FeatureRequestStage[] {
  return Object.keys(STAGE_CONFIG) as FeatureRequestStage[];
}

/**
 * Get stage label (human-readable)
 */
export function getStageLabel(stage: FeatureRequestStage): string {
  return STAGE_CONFIG[stage].label;
}

/**
 * Check if a stage is in a specific group
 */
export function isStageInGroup(stage: FeatureRequestStage, group: StageGroup): boolean {
  return STAGE_CONFIG[stage].group === group;
}

/**
 * Get stage progress percentage (0-100)
 * Based on position in overall workflow
 */
export function getStageProgress(stage: FeatureRequestStage): number {
  const allStages = getAllStages();
  const index = allStages.indexOf(stage);
  return Math.round((index / (allStages.length - 1)) * 100);
}
