import fs from "node:fs/promises";
import path from "node:path";
import { getWorkspacePaths } from "@/lib/path";

export interface StrategyDocument {
  slug: string;
  title: string;
  path: string;
  body: string;
  updatedAt?: string;
}

export interface StrategyMetric {
  label: string;
  value: string;
  note: string;
}

export interface StrategyQuarter {
  quarter: string;
  theme: string;
  objective: string;
}

export interface StrategyParityItem {
  name: string;
  parity: string;
  note: string;
}

export interface StrategyWorkspace {
  currentShareableStatus: StrategyDocument | null;
  businessStatusUpdates: StrategyDocument[];
  roadmapUpdates: StrategyDocument[];
  executiveSnapshots: StrategyDocument[];
  boardSummaries: StrategyDocument[];
  keyStrategyNotes: StrategyDocument[];
  decisionSupport: StrategyDocument[];
  templates: StrategyDocument[];
  indexes: StrategyDocument[];
  metrics: StrategyMetric[];
  protectedPriorities: string[];
  watchouts: string[];
  riskThemes: string[];
  dependencyHighlights: string[];
  roadmapQuarters: StrategyQuarter[];
  parityHighlights: StrategyParityItem[];
  verticalHighlights: string[];
}

const FY27_DIR = ["Knowledge", "Strategy", "FY27"];
const TEMPLATES_DIR = ["Knowledge", "Templates"];

function toTitle(file: string) {
  return file.replace(/\.md$/i, "").replace(/-/g, " ");
}

function toSlug(file: string) {
  return file.replace(/\.md$/i, "");
}

async function readDoc(absPath: string, relativePath: string): Promise<StrategyDocument | null> {
  try {
    const body = await fs.readFile(absPath, "utf8");
    const stat = await fs.stat(absPath);
    const file = path.basename(absPath);
    const titleMatch = body.match(/^#\s+(.+)$/m);
    return {
      slug: toSlug(file),
      title: titleMatch?.[1]?.trim() || toTitle(file),
      path: relativePath,
      body,
      updatedAt: stat.mtime.toISOString()
    };
  } catch {
    return null;
  }
}

async function listDocs(dirParts: string[]): Promise<StrategyDocument[]> {
  const root = getWorkspacePaths().root;
  const dir = path.join(root, ...dirParts);

  try {
    const entries = await fs.readdir(dir);
    const docs = await Promise.all(
      entries
        .filter((entry) => entry.endsWith(".md"))
        .map((entry) => readDoc(path.join(dir, entry), path.join(...dirParts, entry)))
    );

    return docs.filter((doc): doc is StrategyDocument => Boolean(doc));
  } catch {
    return [];
  }
}

export async function getStrategyWorkspace(): Promise<StrategyWorkspace> {
  const fy27Docs = await listDocs(FY27_DIR);
  const templateDocs = await listDocs(TEMPLATES_DIR);

  const findOne = (slug: string) => fy27Docs.find((doc) => doc.slug === slug) ?? null;
  const byPrefix = (prefix: string) => fy27Docs.filter((doc) => doc.slug.startsWith(prefix)).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  const pick = (slugs: string[]) => slugs.map((slug) => findOne(slug)).filter((doc): doc is StrategyDocument => Boolean(doc));

  return {
    currentShareableStatus: findOne("Current-Shareable-Status"),
    businessStatusUpdates: byPrefix("Business-Status-Update"),
    roadmapUpdates: byPrefix("Roadmap-Update"),
    executiveSnapshots: byPrefix("Executive-Status-Snapshot"),
    boardSummaries: byPrefix("Board-Style-Summary"),
    keyStrategyNotes: pick([
      "Executive-Snapshot",
      "Strategic-Imperatives",
      "FY26-Lessons-Learned",
      "Win-Loss-Analysis",
      "AOP-vs-Roadmap",
      "LOS-Strategy"
    ]),
    decisionSupport: pick([
      "Operating-Command-Brief",
      "Director-Intervention-Brief-2026-03-21",
      "FY27-Quarter-Protection-Review",
      "FY27-Specialist-Dependency-Matrix"
    ]),
    templates: templateDocs,
    indexes: pick(["Status-Output-Index", "SYSTEM-README", "Source-Index"]),
    metrics: [
      { label: "FY26 losses", value: "₹100.5 Cr", note: "Confirmed India loss base from the strategy corpus" },
      { label: "Demo loss rate", value: "78.5%", note: "Signal of conversion weakness, not lack of opportunity" },
      { label: "Gold parity", value: "20%", note: "One of the sharpest visible parity gaps" },
      { label: "LAS / LAMF parity", value: "53%", note: "High-recoverability category if protected well" },
      { label: "BNPL / Credit Line parity", value: "71%", note: "Important baseline for modern retail credibility" },
      { label: "FY27 roadmap scale", value: "5,385–5,551 PD", note: "Execution concentration matters more than exact count" }
    ],
    protectedPriorities: [
      "Gold recovery and parity depth",
      "LAS / LAMF parity",
      "BNPL / Credit Line baseline parity",
      "Compliance firewall items",
      "Stability and referenceability work"
    ],
    watchouts: [
      "Co-lending complexity expanding faster than justified relative to clearer recovery bets",
      "Compliance follow-through remaining under-owned",
      "New-market narratives outrunning actual readiness",
      "Product progress failing to convert commercially because trust/referenceability stays weak"
    ],
    riskThemes: [
      "Core parity gaps in Gold, LAS / LAMF, BNPL, and selected vehicle/secured categories",
      "Enterprise/compliance weaknesses such as DPDPA, ECL, EIR, and audit depth",
      "Trust, incumbency, and weak referenceability reducing conversion",
      "Integration and implementation confidence issues weakening business outcomes"
    ],
    dependencyHighlights: [
      "Capital markets requires explicit domain expertise before confident roadmap commitment",
      "Islamic finance needs both product leadership and Shariah/certification support",
      "Regional expansion needs localization and compliance support rather than generic ambition",
      "Collateral/referenceability improvement remains under-owned despite high commercial importance"
    ],
    roadmapQuarters: [
      {
        quarter: "Q1",
        theme: "Close the gap",
        objective: "Fix the most commercially painful parity gaps and protect Gold/LAS from dilution."
      },
      {
        quarter: "Q2",
        theme: "Enterprise readiness",
        objective: "Remove compliance and audit objections while deepening adjacent readiness."
      },
      {
        quarter: "Q3",
        theme: "B2B and international bets",
        objective: "Advance vehicle, Islamic finance, capital markets, and regional readiness bets."
      },
      {
        quarter: "Q4",
        theme: "Monetize ecosystem",
        objective: "Push AI premiumization, ecosystem leverage, and broader packaging/monetization."
      }
    ],
    parityHighlights: [
      {
        name: "Gold",
        parity: "20%",
        note: "One of the sharpest visible parity gaps and one of the clearest recovery bets."
      },
      {
        name: "LAS / LAMF",
        parity: "53%",
        note: "Repeated loss theme with high recoverability if protected and delivered well."
      },
      {
        name: "BNPL / Credit Line",
        parity: "71%",
        note: "Important baseline parity area for modern retail and credit-line credibility."
      }
    ],
    verticalHighlights: [
      "Gold remains one of the most commercially important recovery categories.",
      "LAS / LAMF is a high-signal category where better depth can directly improve conversion confidence.",
      "BNPL / Credit Line remains important for retail credibility and baseline parity.",
      "Islamic finance and capital markets remain high-upside bets, but must be gated by readiness and specialist support."
    ]
  };
}
