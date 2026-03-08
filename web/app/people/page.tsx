/**
 * People Management Page
 *
 * PM coaching, 1:1 tracking, and IDP management for M2P
 */

"use client";

import { useState } from "react";
import type { PMProfile } from "@/lib/control-tower/people-types";
import { ArtifactViewer } from "@/components/artifacts/ArtifactViewer";
import type { Artifact } from "@/lib/control-tower/artifacts/types";

// Mock PM profiles - will be replaced with actual data
const mockPMProfiles: PMProfile[] = [
  {
    id: "pm-1",
    name: "PM Name 1",
    email: "pm1@m2p.com",
    role: "SPM",
    productCharters: ["Co-Lending", "LAS"],
    startDate: "2024-01-15",
    lastOneOnOneDate: "2026-02-15"
  },
  {
    id: "pm-2",
    name: "PM Name 2",
    email: "pm2@m2p.com",
    role: "APM",
    productCharters: ["BNPL"],
    startDate: "2024-06-01",
    lastOneOnOneDate: "2026-02-20"
  }
];

export default function PeoplePage() {
  const [pmProfiles] = useState<PMProfile[]>(mockPMProfiles);
  const [viewingArtifact, setViewingArtifact] = useState<Artifact | null>(null);

  const getDaysSinceLastOneOnOne = (lastDate?: string): number => {
    if (!lastDate) return 999;
    return Math.floor(
      (new Date().getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const isOverdue = (lastDate?: string): boolean => {
    return getDaysSinceLastOneOnOne(lastDate) > 30;
  };

  const handleDraftIDP = (pm: PMProfile) => {
    const now = new Date().toISOString();
    const idpArtifact: Artifact = {
      id: `idp-${pm.id}-${Date.now()}`,
      type: "idp_feedback",
      title: `IDP Feedback - ${pm.name}`,
      content: generateIDPContent(pm),
      status: "draft",
      createdAt: now,
      updatedAt: now,
      metadata: {
        featureRequestId: `pm-${pm.id}`,
        featureRequestTitle: `IDP for ${pm.name}`,
        generatedAt: now,
        generatedBy: "Product Control Tower",
        pmOwner: pm.name
      }
    };
    setViewingArtifact(idpArtifact);
  };

  const handleOneOnOnePrep = (pm: PMProfile) => {
    const now = new Date().toISOString();
    const oneOnOneArtifact: Artifact = {
      id: `1on1-${pm.id}-${Date.now()}`,
      type: "status_update",
      title: `1:1 Prep - ${pm.name}`,
      content: generateOneOnOnePrepContent(pm),
      status: "draft",
      createdAt: now,
      updatedAt: now,
      metadata: {
        featureRequestId: `pm-${pm.id}`,
        featureRequestTitle: `1:1 Prep for ${pm.name}`,
        generatedAt: now,
        generatedBy: "Product Control Tower",
        pmOwner: pm.name
      }
    };
    setViewingArtifact(oneOnOneArtifact);
  };

  function generateIDPContent(pm: PMProfile): string {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    return `# IDP Feedback - ${pm.name}

## Employee Information

**Employee Name / Role:** ${pm.name} - ${pm.role}

**Manager:** Joydeep Sarkar (Director of Products)

**Function:** Product

**Last Update:** ${currentDate}

---

## Strengths

### Key Strengths:
- [Strength 1: e.g., Ownership]
- [Strength 2: e.g., Technical Depth]
- [Strength 3: e.g., Cross-functional Collaboration]

**Evidence/Examples:**
- Product Charters: ${pm.productCharters.join(", ")}
- [Add specific examples demonstrating strengths]

---

## Areas for Development

### Primary Development Areas:
1. [Area 1: e.g., Product Sense & Strategy]
2. [Area 2: e.g., Domain Knowledge (${pm.productCharters[0]})]
3. [Area 3: e.g., Stakeholder Communication]

**Why these areas:**
- [Rationale for each development area]

---

## Development Plan

## Area 1: [Development Area Name]

### Development Goal:
[Specific, measurable goal]

### Development Actions:
- [ ] Action 1: [Specific task/milestone]
- [ ] Action 2: [Specific task/milestone]
- [ ] Action 3: [Specific task/milestone]

**Timeline:** Q2 2026

**Status:** Not Started

**Success Measure:** [% completion or specific outcome]

---

## Area 2: [Development Area Name]

### Development Goal:
[Specific, measurable goal]

### Development Actions:
- [ ] Action 1: [Specific task/milestone]
- [ ] Action 2: [Specific task/milestone]

**Timeline:** Q2 2026

**Status:** Not Started

**Success Measure:** [% completion or specific outcome]

---

## Brag Sheet (Accomplishments)

Track significant accomplishments and contributions:

| S.No. | Group/Client | Platform | Accomplishment |
|-------|--------------|----------|----------------|
| 1 | [Client/Project] | [LOS/LMS/Platform] | [Specific achievement] |
| 2 | [Client/Project] | [LOS/LMS/Platform] | [Specific achievement] |
| 3 | [Client/Project] | [LOS/LMS/Platform] | [Specific achievement] |

**Other Contributions:**
- [Cross-functional work]
- [Process improvements]
- [Documentation/enablement work]

---

## Current Quarter Goals/OKRs

| Objective | Weightage | Key Results | Status |
|-----------|-----------|-------------|--------|
| [Objective 1] | 30% | [KR with metrics] | [On Track/At Risk/Delayed] |
| [Objective 2] | 25% | [KR with metrics] | [On Track/At Risk/Delayed] |
| [Objective 3] | 20% | [KR with metrics] | [On Track/At Risk/Delayed] |

**Total Weightage:** 100%

---

## Monthly 1-on-1 Tracking

## Month 1: [Month Name]

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
- [Goal 2]
`;
  }

  function generateOneOnOnePrepContent(pm: PMProfile): string {
    const daysSince = getDaysSinceLastOneOnOne(pm.lastOneOnOneDate);
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    return `# 1:1 Preparation - ${pm.name}

**Date:** ${currentDate}
**Last 1:1:** ${pm.lastOneOnOneDate ? `${daysSince} days ago (${new Date(pm.lastOneOnOneDate).toLocaleDateString()})` : "Never"}
**Role:** ${pm.role}
**Product Charters:** ${pm.productCharters.join(", ")}

---

## Agenda

### 1. Review of Last Month
- [ ] Accomplishments and wins
- [ ] Challenges faced
- [ ] Blockers resolved

### 2. Current Work & Portfolio Review
- [ ] Feature requests status for ${pm.productCharters.join(", ")}
- [ ] Client escalations
- [ ] Jira/Confluence updates
- [ ] Team collaboration

### 3. Goals & Development
- [ ] Progress on quarterly OKRs
- [ ] IDP goals review
- [ ] Skill development opportunities

### 4. Upcoming Priorities
- [ ] Next month's focus areas
- [ ] Resource needs
- [ ] Support required

### 5. Open Discussion
- [ ] PM's concerns or feedback
- [ ] Career development
- [ ] Process improvements

---

## Key Metrics to Discuss

**Feature Request Portfolio:**
- Active requests: [To be filled from intervention data]
- Blocked items: [To be filled]
- Overdue items: [To be filled]

**Delivery Performance:**
- PRD quality: [To be assessed]
- Blocker resolution time: [To be measured]
- Stakeholder satisfaction: [To be discussed]

---

## Notes & Action Items

[Take notes during the 1:1]

**Action Items:**
- [ ] [Action item 1 - Owner - Due date]
- [ ] [Action item 2 - Owner - Due date]

**Follow-up:**
- Next 1:1 scheduled for: [Date]
`;
  }

  return (
    <div className="min-h-screen bg-warm-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-warm-900 mb-2">People Management</h1>
          <p className="text-warm-600">PM coaching, 1:1s, and IDP tracking</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total PMs</div>
            <div className="text-3xl font-bold text-gray-900">{pmProfiles.length}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-yellow-600 mb-1">1:1s Overdue</div>
            <div className="text-3xl font-bold text-yellow-700">
              {pmProfiles.filter((pm) => isOverdue(pm.lastOneOnOneDate)).length}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-green-600 mb-1">Up to Date</div>
            <div className="text-3xl font-bold text-green-700">
              {pmProfiles.filter((pm) => !isOverdue(pm.lastOneOnOneDate)).length}
            </div>
          </div>
        </div>

        {/* PM List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Product Managers</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pmProfiles.map((pm) => {
              const daysSince = getDaysSinceLastOneOnOne(pm.lastOneOnOneDate);
              const overdueFlag = isOverdue(pm.lastOneOnOneDate);

              return (
                <div key={pm.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{pm.name}</h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          {pm.role}
                        </span>
                        {overdueFlag && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                            1:1 Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{pm.email}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          <strong>Charters:</strong> {pm.productCharters.join(", ")}
                        </span>
                        <span>
                          <strong>Last 1:1:</strong>{" "}
                          {pm.lastOneOnOneDate
                            ? `${daysSince} days ago`
                            : "Never"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOneOnOnePrep(pm)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        1:1 Prep
                      </button>
                      <button
                        onClick={() => handleDraftIDP(pm)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                      >
                        Draft IDP
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Artifact Viewer Modal */}
      {viewingArtifact && (
        <ArtifactViewer artifact={viewingArtifact} onClose={() => setViewingArtifact(null)} />
      )}
    </div>
  );
}
