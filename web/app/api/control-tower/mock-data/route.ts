/**
 * Generate Mock Data API
 *
 * GET /api/control-tower/mock-data - Generate and cache mock feature requests
 */

import { NextResponse } from "next/server";
import { writeFeatureRequestCache } from "@/lib/control-tower/cache";
import type { FeatureRequest } from "@/lib/control-tower/types";

const mockFeatureRequests: FeatureRequest[] = [
  {
    id: "fr-001",
    title: "Co-lending repayment strategy for HDFC integration",
    source: "client_escalation",
    stage: "in_delivery",
    client: "HDFC Bank",
    productCharter: "Lending Platform",
    pmOwner: "Alice",
    jiraIssues: [
      {
        key: "LEND-234",
        status: "In Progress",
        statusCategory: "In Progress",
        assignee: "bob@m2p.com",
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    confluencePages: [
      {
        id: "conf-1",
        title: "HDFC Co-lending Requirements",
        url: "https://confluence.example.com/hdfc-colending",
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    localNotes: [],
    riskSummary: {
      severity: "high",
      factors: [
        "Client escalation from HDFC leadership",
        "Overdue by 10 days",
        "Blocked on engineering dependency"
      ]
    },
    blockerSummary: {
      hasBlockers: true,
      blockerCount: 1,
      blockers: [
        {
          type: "engineering",
          description: "Waiting for backend repayment API from core team",
          daysOpen: 8
        }
      ]
    },
    latestUpdate: {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      source: "jira",
      summary: "Engineering team started API work"
    },
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: "fr-002",
    title: "Dashboard analytics for lending portfolio",
    source: "pm_ask",
    stage: "pm_exploration",
    productCharter: "Analytics & Reporting",
    pmOwner: "Alice",
    jiraIssues: [
      {
        key: "DASH-145",
        status: "To Do",
        statusCategory: "To Do",
        lastUpdated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    confluencePages: [],
    localNotes: [],
    riskSummary: {
      severity: "medium",
      factors: ["No requirements doc after 12 days"]
    },
    blockerSummary: {
      hasBlockers: false,
      blockerCount: 0,
      blockers: []
    },
    latestUpdate: {
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      source: "jira",
      summary: "Created Jira issue"
    },
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: "fr-003",
    title: "Mobile app onboarding flow improvements",
    source: "pm_ask",
    stage: "in_delivery",
    productCharter: "Mobile Experience",
    pmOwner: "Bob",
    jiraIssues: [
      {
        key: "MOB-567",
        status: "In Progress",
        statusCategory: "In Progress",
        assignee: "sarah@m2p.com",
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    confluencePages: [
      {
        id: "conf-2",
        title: "Mobile Onboarding PRD",
        url: "https://confluence.example.com/mobile-onboarding",
        lastModified: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    localNotes: [],
    riskSummary: {
      severity: "low",
      factors: []
    },
    blockerSummary: {
      hasBlockers: false,
      blockerCount: 0,
      blockers: []
    },
    latestUpdate: {
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      source: "jira",
      summary: "UI implementation in progress"
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: "fr-004",
    title: "KYC verification API integration for Aadhaar",
    source: "client_escalation",
    stage: "estimation",
    client: "Axis Bank",
    productCharter: "Compliance & KYC",
    pmOwner: "Bob",
    jiraIssues: [
      {
        key: "KYC-890",
        status: "Blocked",
        statusCategory: "In Progress",
        assignee: "raj@m2p.com",
        lastUpdated: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    confluencePages: [
      {
        id: "conf-3",
        title: "Aadhaar KYC Requirements",
        url: "https://confluence.example.com/aadhaar-kyc",
        lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    localNotes: [],
    riskSummary: {
      severity: "high",
      factors: [
        "Client escalation from Axis compliance team",
        "Regulatory deadline approaching",
        "PM blocked for 6 days"
      ]
    },
    blockerSummary: {
      hasBlockers: true,
      blockerCount: 1,
      blockers: [
        {
          type: "pm",
          description: "Waiting for legal approval on data retention policy",
          daysOpen: 6
        }
      ]
    },
    latestUpdate: {
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      source: "jira",
      summary: "Blocked on legal review"
    },
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: "fr-005",
    title: "Payment gateway timeout handling",
    source: "bug_stability",
    stage: "testing",
    productCharter: "Payment Processing",
    pmOwner: "Charlie",
    jiraIssues: [
      {
        key: "PAY-123",
        status: "In Testing",
        statusCategory: "In Progress",
        assignee: "dev@m2p.com",
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    confluencePages: [],
    localNotes: [],
    riskSummary: {
      severity: "medium",
      factors: ["Production bug affecting 5% of transactions"]
    },
    blockerSummary: {
      hasBlockers: false,
      blockerCount: 0,
      blockers: []
    },
    latestUpdate: {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      source: "jira",
      summary: "QA testing in progress"
    },
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastSyncedAt: new Date().toISOString()
  }
];

export async function GET() {
  try {
    await writeFeatureRequestCache(mockFeatureRequests);

    return NextResponse.json({
      success: true,
      message: `Generated ${mockFeatureRequests.length} mock feature requests`,
      count: mockFeatureRequests.length
    });
  } catch (error) {
    console.error("Error generating mock data:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
