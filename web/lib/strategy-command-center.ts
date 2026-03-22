export type RoadmapStatus = "not_started" | "in_progress" | "at_risk" | "blocked" | "done";

export interface RoadmapItem {
  id: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  title: string;
  category: string;
  type: "parity" | "compliance" | "market_entry" | "stability" | "ecosystem";
  status: RoadmapStatus;
  reason: string;
}

export interface ProductDeepDive {
  id: string;
  title: string;
  parity: string;
  opportunity: string;
  watchout: string;
  linkedRoadmapIds: string[];
}

export interface AopPanelItem {
  title: string;
  value: string;
  note: string;
}

export interface RiskHiringItem {
  title: string;
  severity: "critical" | "high" | "medium";
  note: string;
}

export interface StrategyCommandCenterModel {
  roadmap: RoadmapItem[];
  deepDives: ProductDeepDive[];
  aopPanels: AopPanelItem[];
  riskHiring: RiskHiringItem[];
}

export const STRATEGY_COMMAND_CENTER: StrategyCommandCenterModel = {
  roadmap: [
    {
      id: "gold-parity",
      quarter: "Q1",
      title: "Gold parity and recovery stack",
      category: "Product parity",
      type: "parity",
      status: "in_progress",
      reason: "High-confidence recovery category with strong commercial importance."
    },
    {
      id: "las-lamf",
      quarter: "Q1",
      title: "LAS / LAMF parity",
      category: "Product parity",
      type: "parity",
      status: "in_progress",
      reason: "Repeated loss theme with visible recoverability if protected well."
    },
    {
      id: "bnpl-baseline",
      quarter: "Q1",
      title: "BNPL / Credit Line baseline parity",
      category: "Product parity",
      type: "parity",
      status: "not_started",
      reason: "Important baseline retail credibility bet that cannot stay vague."
    },
    {
      id: "compliance-firewall",
      quarter: "Q2",
      title: "Compliance firewall items",
      category: "Compliance",
      type: "compliance",
      status: "at_risk",
      reason: "Commercially mandatory but easy to under-protect if treated as technical work."
    },
    {
      id: "stability-referenceability",
      quarter: "Q2",
      title: "Stability and referenceability",
      category: "Execution quality",
      type: "stability",
      status: "in_progress",
      reason: "Revenue protection layer that makes roadmap progress commercially believable."
    },
    {
      id: "capital-markets",
      quarter: "Q3",
      title: "Capital markets readiness",
      category: "New market",
      type: "market_entry",
      status: "at_risk",
      reason: "High-upside bet gated by specialist dependency clarity."
    },
    {
      id: "islamic-finance",
      quarter: "Q3",
      title: "Islamic finance / GCC readiness",
      category: "New market",
      type: "market_entry",
      status: "at_risk",
      reason: "High-upside bet that needs both product and certification readiness."
    },
    {
      id: "ecosystem-leverage",
      quarter: "Q4",
      title: "Ecosystem and monetization leverage",
      category: "Ecosystem",
      type: "ecosystem",
      status: "not_started",
      reason: "Later-year monetization layer that should not crowd out higher-certainty early bets."
    }
  ],
  deepDives: [
    {
      id: "gold",
      title: "Gold",
      parity: "20%",
      opportunity: "High-value recovery category with strong business visibility.",
      watchout: "Needs end-to-end parity and enforcement/recovery credibility, not partial depth.",
      linkedRoadmapIds: ["gold-parity", "stability-referenceability"]
    },
    {
      id: "las-lamf",
      title: "LAS / LAMF",
      parity: "53%",
      opportunity: "High-recoverability category if focus and depth are protected.",
      watchout: "Can get crowded out by broader ecosystem complexity.",
      linkedRoadmapIds: ["las-lamf"]
    },
    {
      id: "bnpl",
      title: "BNPL / Credit Line",
      parity: "71%",
      opportunity: "Important credibility baseline for modern retail and credit-line discussions.",
      watchout: "Needs clear definition of minimum parity, not broad aspirational scope.",
      linkedRoadmapIds: ["bnpl-baseline"]
    },
    {
      id: "capital-markets",
      title: "Capital Markets",
      parity: "Strategic bet",
      opportunity: "Non-linear upside and stronger business narrative if readiness is real.",
      watchout: "Unsafe to over-promise without specialist support.",
      linkedRoadmapIds: ["capital-markets"]
    },
    {
      id: "islamic",
      title: "Islamic Finance / GCC",
      parity: "Strategic bet",
      opportunity: "High-upside new-market entry with differentiated positioning.",
      watchout: "Needs product plus certification/advisory readiness before confident selling.",
      linkedRoadmapIds: ["islamic-finance"]
    }
  ],
  aopPanels: [
    {
      title: "Roadmap scale",
      value: "5,385–5,551 PD",
      note: "Exact total matters less than concentration and protection discipline."
    },
    {
      title: "Execution concentration",
      value: "High",
      note: "Product parity, compliance, quality, and market-entry work cluster in a few risky zones."
    },
    {
      title: "Commercial rule",
      value: "Protect the few bets that matter",
      note: "The AOP works only if protected bets are not diluted by adjacent complexity."
    }
  ],
  riskHiring: [
    {
      title: "Compliance under-protection",
      severity: "critical",
      note: "If treated as technical polish instead of a commercial gate, enterprise readiness collapses."
    },
    {
      title: "Capital markets specialist gap",
      severity: "high",
      note: "Roadmap credibility weakens if specialist support remains assumed rather than secured."
    },
    {
      title: "Islamic finance readiness gap",
      severity: "high",
      note: "Product ambition can outrun certification/advisory readiness."
    },
    {
      title: "Referenceability under-owned",
      severity: "medium",
      note: "Roadmap progress may fail to convert commercially if proof and reference assets stay weak."
    }
  ]
};
