# Enhanced Build Plan v2

## Phase 1 Audit Summary

### What Already Exists

The repo contains a working Next.js application with substantial local-first assistant capabilities:

**Infrastructure:**
- Next.js 15 App Router application
- TypeScript with strict type checking
- Vitest test framework
- Local cache layer in `.cache/`
- Module/action framework for extensibility

**Assistant Engines (all in `web/lib/assistant/`):**
- `context-engine.ts` - Ingests Goals, Tasks, Knowledge markdown
- `brief-engine.ts` - Generates daily outcome briefs
- `queue-engine.ts` - Task queue and commitment tracking
- `comms-engine.ts` - Draft generation with approval workflow
- `review-engine.ts` - Weekly review generation
- `alert-engine.ts` - Priority drift and WIP limit alerts
- `trend-engine.ts` - Outcome closure trend tracking
- `kpi-engine.ts` - Weekly KPI calculations
- `policy-engine.ts` - Approval policy enforcement
- `storage.ts` - File-based cache persistence

**UI Surfaces:**
- `/assistant` - Main assistant dashboard
- `/review` - Weekly review view
- `/today` - Daily view
- `/triage` - Task triage
- `/tasks` - Task management
- `/settings` - Configuration
- `/actions` - Action modules

**API Routes:**
- `/api/assistant/*` - Context, brief, queue, comms, review, alerts, trends, KPI
- `/api/tasks/*` - Task CRUD operations
- `/api/backlog/*` - Backlog processing
- `/api/goals` - Goals access
- `/api/copilot/chat` - In-app copilot
- `/api/modules/*` - Module action execution

### Critical Gap Identified

**The system is currently built entirely around `Task` as the primary unit.**

Evidence:
- All types are task-centric (`TaskDocument`, `TaskSignal`, `TaskFrontmatter`)
- All engines operate on task lists
- All views are task-focused
- The data model is `Tasks/` markdown files

**But requirements.md explicitly states:**
> "Feature request is the primary object" (line 412)
> "The system should not be primarily organized around generic tasks" (line 403)

This is a fundamental architectural mismatch that must be resolved before continuing.

### What Is Missing For Product Control Tower

**Critical Missing Pieces:**
1. ❌ No Jira integration (`web/lib/integrations/jira/`)
2. ❌ No Confluence integration (`web/lib/integrations/confluence/`)
3. ❌ No `FeatureRequest` domain type
4. ❌ No `feature-request-engine.ts`
5. ❌ No normalized cross-source merge logic
6. ❌ No PM-owner dimension
7. ❌ No risk-severity dimension
8. ❌ No intervention brief (current brief is outcome-focused)
9. ❌ No PM blocker dashboard
10. ❌ No people management workflows

**Dependencies Not Installed:**
- No Jira API client
- No Confluence API client

### Validation: Is The First Build Slice Still Correct?

**YES.** The kickoff prompt correctly identifies the prerequisite work:

> "Read-only external source ingestion plus normalized feature-request modeling."

This is the absolute foundation. Without it:
- We cannot represent the true product domain (feature requests, not tasks)
- We cannot build PM-owner or risk-severity views
- We cannot merge Jira execution metadata with Confluence requirements
- We cannot support director-level intervention workflows

The current task-centric architecture should be preserved for personal productivity use cases, but the control tower must be built on top of the feature-request layer.

---

## Enhanced Implementation Plan

### Prerequisites

1. Install Jira API client (e.g., `jira.js` or Atlassian REST API client)
2. Install Confluence API client (e.g., `confluence.js`)
3. Create environment config surface for:
   - Jira base URL, credentials, project keys, board filters
   - Confluence base URL, credentials, space keys

### First Build Slice: External Source Ingestion + Feature Request Model

This slice is read-only and purely additive. It does not modify existing task-based workflows.

#### Deliverable 1: Jira Integration Layer

**Location:** `web/lib/integrations/jira/`

**Files to create:**
1. `web/lib/integrations/jira/client.ts`
   - Jira API client wrapper
   - Authentication handling
   - Rate limiting / retry logic
   - Error handling

2. `web/lib/integrations/jira/types.ts`
   - JiraIssue type (subset of Jira API response)
   - JiraProject, JiraBoard, JiraComment types
   - JiraFilter for query construction

3. `web/lib/integrations/jira/adapter.ts`
   - `fetchIssues(filters)` - Pull issues from configured projects/boards
   - `fetchComments(issueKey)` - Get issue comments
   - `normalizeJiraIssue(raw)` - Transform Jira API response to internal format

4. `web/lib/integrations/jira/cache.ts`
   - Cache Jira data to `.cache/jira-issues.json`
   - Track last sync timestamp
   - Implement incremental sync logic

**Environment Config:**
```typescript
// web/lib/integrations/jira/config.ts
export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKeys: string[];
  boardIds?: number[];
  customFilters?: string[];
}
```

#### Deliverable 2: Confluence Integration Layer

**Location:** `web/lib/integrations/confluence/`

**Files to create:**
1. `web/lib/integrations/confluence/client.ts`
   - Confluence API client wrapper
   - Authentication handling
   - Error handling

2. `web/lib/integrations/confluence/types.ts`
   - ConfluencePage type
   - ConfluenceSpace type
   - ConfluenceLabel type

3. `web/lib/integrations/confluence/adapter.ts`
   - `fetchPages(spaceKey, labels?)` - Pull pages from configured spaces
   - `fetchPageContent(pageId)` - Get full page content
   - `normalizeConfluencePage(raw)` - Transform to internal format

4. `web/lib/integrations/confluence/cache.ts`
   - Cache Confluence data to `.cache/confluence-pages.json`
   - Track last sync timestamp

**Environment Config:**
```typescript
// web/lib/integrations/confluence/config.ts
export interface ConfluenceConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  spaceKeys: string[];
  labelFilters?: string[];
}
```

#### Deliverable 3: Feature Request Domain Model

**Location:** `web/lib/control-tower/`

**New types in `web/lib/control-tower/types.ts`:**

```typescript
export type FeatureRequestSource =
  | "client_escalation"
  | "pm_ask"
  | "sales_rfp"
  | "implementation_gap"
  | "bug_stability"
  | "engineering_blocker"
  | "leadership_request";

export type FeatureRequestStage =
  | "incoming"
  | "ba_grooming"
  | "pm_exploration"
  | "director_review"
  | "engineering_validation"
  | "prd_drafting"
  | "estimation"
  | "prioritized"
  | "in_delivery"
  | "testing"
  | "client_update"
  | "uat_deploy"
  | "prod_deploy";

export type RiskSeverity = "high" | "medium" | "low" | "none";

export interface FeatureRequest {
  id: string;
  title: string;
  source: FeatureRequestSource;
  client?: string;
  productCharter?: string;
  pmOwner?: string;
  stage: FeatureRequestStage;

  // Linked sources
  jiraIssues: {
    key: string;
    status: string;
    assignee?: string;
    dueDate?: string;
    lastUpdated: string;
  }[];

  confluencePages: {
    id: string;
    title: string;
    url: string;
    lastModified: string;
  }[];

  localNotes?: {
    path: string;
    summary: string;
  }[];

  // Derived intelligence
  riskSummary: {
    severity: RiskSeverity;
    factors: string[];
  };

  blockerSummary: {
    hasBlockers: boolean;
    blockerCount: number;
    blockers: Array<{
      type: "engineering" | "pm" | "client" | "other";
      description: string;
      daysOpen: number;
    }>;
  };

  latestUpdate: {
    date: string;
    source: "jira" | "confluence" | "local";
    summary: string;
  };

  recommendedNextStep?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
}
```

**Files to create:**

1. `web/lib/control-tower/feature-request-engine.ts`
   - `ingestFeatureRequests()` - Main orchestration
   - `mergeSourceData()` - Combine Jira + Confluence + local notes
   - `calculateRiskSeverity()` - Risk scoring logic
   - `detectBlockers()` - Blocker detection from status, comments, age
   - `inferPmOwner()` - Map from Jira assignee or local config
   - `cacheFeatureRequests()` - Persist to `.cache/feature-requests.json`

2. `web/lib/control-tower/merge-logic.ts`
   - Logic to match Jira issues to Confluence pages
   - Heuristics: issue key in page title, labels, links
   - Deduplication logic

3. `web/lib/control-tower/risk-scorer.ts`
   - Risk severity calculation based on:
     - Days without update
     - Overdue dates
     - Blocked status
     - Client urgency signals
     - PM availability

4. `web/lib/control-tower/blocker-detector.ts`
   - Parse Jira status for blocked states
   - Parse comments for blocker keywords
   - Aging logic for stale dependencies

#### Deliverable 4: Feature Request Cache Artifact

**Cache file:** `.cache/feature-requests.json`

**Structure:**
```json
{
  "version": 1,
  "generatedAt": "2026-03-08T10:00:00Z",
  "sources": {
    "jira": {
      "issueCount": 45,
      "lastSyncAt": "2026-03-08T09:55:00Z"
    },
    "confluence": {
      "pageCount": 23,
      "lastSyncAt": "2026-03-08T09:50:00Z"
    },
    "local": {
      "noteCount": 12
    }
  },
  "featureRequests": [
    {
      "id": "fr-001",
      "title": "Co-lending repayment strategy ordering",
      ...
    }
  ]
}
```

#### Deliverable 5: API Endpoint

**New route:** `web/app/api/control-tower/feature-requests/route.ts`

**Endpoints:**
- `GET /api/control-tower/feature-requests` - List all feature requests
  - Query params: `pmOwner`, `riskSeverity`, `stage`, `client`
- `GET /api/control-tower/feature-requests/sync` - Trigger sync from Jira/Confluence
- `GET /api/control-tower/feature-requests/:id` - Get single feature request details

#### Deliverable 6: Tests

**Test files:**
1. `web/tests/integrations/jira-adapter.test.ts`
2. `web/tests/integrations/confluence-adapter.test.ts`
3. `web/tests/control-tower/feature-request-engine.test.ts`
4. `web/tests/control-tower/merge-logic.test.ts`
5. `web/tests/control-tower/risk-scorer.test.ts`

**Test coverage:**
- Jira API response normalization
- Confluence page parsing
- Feature request merging with multiple sources
- Risk scoring edge cases
- Blocker detection accuracy
- Fallback behavior when sources are unavailable

---

## Design Constraints For This Slice

1. **Read-only:** No writeback to Jira or Confluence in this slice
2. **Approval-gated:** All future write actions must be explicit and approved
3. **Additive:** Do not modify existing task-based workflows
4. **Cache-first:** External APIs should be cached; UI reads from cache
5. **Normalized model:** Feature requests are the canonical representation, not raw Jira issues
6. **Source attribution:** Always track which source (Jira/Confluence/local) provided each piece of data

---

## Implementation Sequence

### Step 1: Dependencies and Config (1-2 hours)
1. Add `jira.js` and `confluence.js` to package.json
2. Create environment variable structure
3. Add config files for Jira and Confluence

### Step 2: Jira Integration (3-4 hours)
1. Implement Jira client wrapper
2. Implement Jira adapter with normalization
3. Implement Jira cache layer
4. Write tests

### Step 3: Confluence Integration (2-3 hours)
1. Implement Confluence client wrapper
2. Implement Confluence adapter with normalization
3. Implement Confluence cache layer
4. Write tests

### Step 4: Feature Request Engine (4-5 hours)
1. Define FeatureRequest types
2. Implement merge logic
3. Implement risk scorer
4. Implement blocker detector
5. Implement feature-request-engine orchestration
6. Write tests

### Step 5: API Routes (1-2 hours)
1. Create `/api/control-tower/feature-requests` route
2. Implement sync endpoint
3. Test API responses

### Step 6: Verification (1 hour)
1. Run `npm run typecheck`
2. Run `npm run test`
3. Run `npm run build`
4. Manual smoke test of sync and retrieval

**Total estimated time:** 12-17 hours

---

## What Comes After This Slice

Once the feature request foundation is in place, the next slices will be:

**Slice 2: Intervention Brief UI**
- Build PM-owner grouped, risk-severity sorted morning view
- Replace or augment current `/assistant` page with director intervention mode

**Slice 3: PM Blocker Dashboard**
- Visualize blocker aging and PM capacity
- Show feature requests by wait state

**Slice 4: Artifact Drafting**
- PRD drafting from feature request context
- User story generation
- Leadership update generation

**Slice 5: Pre-Grooming Review**
- Grooming readiness checklist
- Bandwidth-aware prioritization

**Slice 6: People Management**
- 1:1 notes and IDP drafting
- PM performance evidence log

**Slice 7: Approval-Gated Writeback**
- Jira issue creation/update with approval
- Confluence page drafting with approval

---

## Acceptance Criteria for Slice 1

✅ Jira issues can be fetched and cached
✅ Confluence pages can be fetched and cached
✅ Feature requests are created by merging Jira + Confluence + local notes
✅ Risk severity is calculated and stored
✅ Blockers are detected and categorized
✅ API endpoint returns feature requests with filtering
✅ All tests pass
✅ TypeScript compiles without errors
✅ Build succeeds

---

## Open Questions To Resolve During Implementation

1. **Jira Query Strategy:**
   - Should we pull from specific boards, projects, or JQL filters?
   - Default: Pull from configured project keys + filter by updated date

2. **Confluence Page Matching:**
   - How do we match Confluence pages to Jira issues?
   - Default: Check for Jira key in page title/content, use labels

3. **PM Owner Mapping:**
   - Should PM owner come from Jira assignee, local config, or custom field?
   - Default: Start with Jira assignee, allow local override

4. **Manual Teams Integration:**
   - How should Teams escalation context be captured?
   - Default: Add a `manualNotes` field to FeatureRequest for pasted context

5. **Sync Frequency:**
   - Should sync be manual, scheduled, or on-demand?
   - Default: Manual trigger via API, add scheduled sync later

---

## Risk Mitigation

**Risk: Jira/Confluence APIs are slow or unreliable**
- Mitigation: Cache-first architecture, graceful degradation, incremental sync

**Risk: Matching Jira issues to Confluence pages is error-prone**
- Mitigation: Start with explicit linking (Jira key in Confluence), add fuzzy matching later

**Risk: PM owner mapping is ambiguous**
- Mitigation: Allow local configuration file to override inferred mappings

**Risk: Existing task workflows break**
- Mitigation: This slice is purely additive; task engines remain unchanged

---

## Next Steps

After this plan is approved, I will:

1. Create the directory structure
2. Install dependencies
3. Implement Jira integration
4. Implement Confluence integration
5. Build feature request engine
6. Add API routes
7. Write tests
8. Verify build

Then present a summary of what was implemented and what the next slice should address.
